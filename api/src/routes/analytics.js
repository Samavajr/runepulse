import { db } from '../db.js';
import { accountFromToken } from '../auth.js';
import { fetchHiscoreSkills } from '../hiscore.js';

const WIKI_PRICE_BASE = 'https://prices.runescape.wiki/api/v1/osrs';
const WIKI_HEADERS = {
  'User-Agent': 'RunePulse calculator - github.com/Samavajr/runepulse'
};

function xpForLevel(level) {
  let points = 0;
  for (let lvl = 1; lvl < level; lvl++) {
    points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
  }
  return Math.floor(points / 4);
}

function levelForXp(xp) {
  let level = 1;
  for (let lvl = 2; lvl <= 99; lvl++) {
    if (xp < xpForLevel(lvl)) {
      break;
    }
    level = lvl;
  }
  return level;
}

async function skillsSummaryFromHiscore(username) {
  const skills = await fetchHiscoreSkills(username);
  if (!skills) {
    return [];
  }

  return skills.map((skill) => {
    const currentXp = Number(skill.xp || 0);
    const level = Number(skill.level || levelForXp(currentXp));
    const nextLevelXp = level >= 99 ? currentXp : xpForLevel(level + 1);

    return {
      skill: skill.name,
      xp: currentXp,
      level,
      nextLevelXp,
      xpToNext: Math.max(nextLevelXp - currentXp, 0)
    };
  });
}

export default async function analyticsRoutes(app) {
  app.get('/prices/latest', async (_req, reply) => {
    const res = await fetch(`${WIKI_PRICE_BASE}/latest`, {
      headers: WIKI_HEADERS
    });

    if (!res.ok) {
      return reply.code(502).send({ data: {} });
    }

    return res.json();
  });

  app.get('/prices/mapping', async (_req, reply) => {
    const res = await fetch(`${WIKI_PRICE_BASE}/mapping`, {
      headers: WIKI_HEADERS
    });

    if (!res.ok) {
      return reply.code(502).send([]);
    }

    return res.json();
  });

  app.get('/hiscore/:username/skills', async (req, reply) => {
    const { username } = req.params;
    const skills = await fetchHiscoreSkills(username);
    if (!skills) {
      return reply.code(404).send({ notFound: true, username });
    }

    return { username, skills };
  });

  async function accountByUsername(username) {
    return db.oneOrNone(
      `SELECT id, is_public, username, updated_at
       FROM accounts
       WHERE LOWER(username) = LOWER($1)
       ORDER BY updated_at DESC NULLS LAST
       LIMIT 1`,
      [username]
    );
  }

  app.get('/profile/:username/xp-totals', async (req) => {
    const { username } = req.params;

    const account = await accountByUsername(username);
    if (!account) {
      return { notFound: true, username };
    }
    if (account.is_public === false) {
      return { private: true, username: account.username };
    }

    const windows = {
      lifetime: null,
      year: '1 year',
      month: '30 days',
      week: '7 days',
      day: '24 hours'
    };

    const out = {};

    for (const [key, interval] of Object.entries(windows)) {
      const where = interval
        ? `AND timestamp >= NOW() - INTERVAL '${interval}'`
        : '';

      out[key] = await db.any(`
        SELECT skill, SUM(xp_gained) AS xp
        FROM xp_events
        WHERE account_id = $1
        ${where}
        GROUP BY skill
      `, [account.id]);
    }

    out.username = account.username;
    return out;
  });

  app.get('/profile/:username/telemetry-status', async (req) => {
    const { username } = req.params;
    const account = await accountByUsername(username);
    if (!account) {
      return {
        accountFound: false,
        username,
        isPublic: null,
        updatedAt: null,
        baselineCount: 0,
        latestBaselineAt: null,
        xpEventCount: 0,
        latestXpAt: null,
        xpGained24h: 0,
        gearSnapshotCount: 0,
        latestGearAt: null,
        bossKcCount: 0,
        latestBossKcAt: null
      };
    }

    const [baselines, xp, gear, bosses] = await Promise.all([
      db.one(
        `SELECT COUNT(*)::int AS count, MAX(captured_at) AS latest_at
         FROM xp_baselines
         WHERE account_id = $1`,
        [account.id]
      ),
      db.one(
        `SELECT COUNT(*)::int AS count,
                MAX(timestamp) AS latest_at,
                COALESCE(SUM(xp_gained) FILTER (WHERE timestamp >= NOW() - INTERVAL '24 hours'), 0)::int AS gained_24h
         FROM xp_events
         WHERE account_id = $1`,
        [account.id]
      ),
      db.one(
        `SELECT COUNT(*)::int AS count, MAX(timestamp) AS latest_at
         FROM gear_snapshots
         WHERE account_id = $1`,
        [account.id]
      ),
      db.one(
        `SELECT COUNT(*)::int AS count, MAX(updated_at) AS latest_at
         FROM boss_kc
         WHERE account_id = $1`,
        [account.id]
      )
    ]);

    return {
      accountFound: true,
      username: account.username,
      isPublic: account.is_public,
      updatedAt: account.updated_at,
      baselineCount: Number(baselines.count || 0),
      latestBaselineAt: baselines.latest_at,
      xpEventCount: Number(xp.count || 0),
      latestXpAt: xp.latest_at,
      xpGained24h: Number(xp.gained_24h || 0),
      gearSnapshotCount: Number(gear.count || 0),
      latestGearAt: gear.latest_at,
      bossKcCount: Number(bosses.count || 0),
      latestBossKcAt: bosses.latest_at
    };
  });

  app.get('/profile/:username/xp-history/:skill', async (req) => {
    const { username, skill } = req.params;
    const range = req.query.range ?? 'month';

    const buckets = {
      day: '5 minutes',
      week: '1 hour',
      month: '6 hours',
      year: '1 day',
      lifetime: '7 days'
    };

    const intervals = {
      day: '24 hours',
      week: '7 days',
      month: '30 days',
      year: '1 year',
      lifetime: null
    };

    const account = await accountByUsername(username);
    if (!account) {
      return [];
    }
    if (account.is_public === false) {
      return [];
    }

    const bucket = buckets[range] ?? buckets.month;
    const interval = intervals[range];
    const where = interval
      ? `AND timestamp >= NOW() - INTERVAL '${interval}'`
      : '';

    return db.any(`
      SELECT
        date_bin(INTERVAL '${bucket}', timestamp, TIMESTAMP '2000-01-01') AS time,
        SUM(xp_gained) AS xp
      FROM xp_events
      WHERE account_id = $1
        AND skill = $2
        ${where}
      GROUP BY time
      ORDER BY time
    `, [account.id, skill]);
  });

  app.get('/profile/:username/gear', async (req) => {
    const { username } = req.params;
    const account = await accountByUsername(username);
    if (!account) {
      return { slots: {}, timestamp: null };
    }
    if (account.is_public === false) {
      return { slots: {}, timestamp: null };
    }

    return db.oneOrNone(
      `SELECT slots, timestamp
       FROM gear_snapshots
       WHERE account_id = $1
       ORDER BY timestamp DESC
       LIMIT 1`,
      [account.id]
    ) || { slots: {}, timestamp: null };
  });

  app.get('/profile/:username/boss-kc', async (req) => {
    const { username } = req.params;
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const account = await accountByUsername(username);
    if (!account) {
      return [];
    }
    if (account.is_public === false) {
      return [];
    }

    return db.any(
      `SELECT boss, kc, updated_at
       FROM boss_kc
       WHERE account_id = $1
       ORDER BY kc DESC, boss ASC
       LIMIT $2`,
      [account.id, limit]
    );
  });

  app.get('/profile/:username/skills-summary', async (req) => {
    const { username } = req.params;
    const account = await accountByUsername(username);
    if (!account) {
      return skillsSummaryFromHiscore(username);
    }
    if (account.is_public === false) {
      return [];
    }

    const rows = await db.any(
      `
      SELECT s.skill AS skill,
             COALESCE(MAX(b.xp), 0) AS baseline_xp,
             COALESCE(SUM(e.xp_gained), 0) AS gained_xp
      FROM (
        SELECT skill FROM xp_baselines WHERE account_id = $1
        UNION
        SELECT skill FROM xp_events WHERE account_id = $1
      ) s
      LEFT JOIN xp_baselines b
        ON b.account_id = $1 AND b.skill = s.skill
      LEFT JOIN xp_events e
        ON e.account_id = $1 AND e.skill = s.skill
      GROUP BY s.skill
      ORDER BY s.skill ASC
      `,
      [account.id]
    );

    if (rows.length === 0) {
      return skillsSummaryFromHiscore(username);
    }

    return rows.map((row) => {
      const currentXp = Number(row.baseline_xp || 0) + Number(row.gained_xp || 0);
      const level = levelForXp(currentXp);
      const nextLevelXp = level >= 99 ? currentXp : xpForLevel(level + 1);
      const toNext = Math.max(nextLevelXp - currentXp, 0);

      return {
        skill: row.skill,
        xp: currentXp,
        level,
        nextLevelXp,
        xpToNext: toNext
      };
    });
  });

  app.post('/profile/visibility', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const account = await accountFromToken(token);
    if (!account) return reply.code(403).send();

    const { isPublic } = req.body || {};
    if (typeof isPublic !== 'boolean') return reply.code(400).send();

    await db.none(
      'UPDATE accounts SET is_public = $1, updated_at = NOW() WHERE id = $2',
      [isPublic, account.id]
    );

    return { ok: true, isPublic };
  });
}
