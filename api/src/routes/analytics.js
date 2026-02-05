import { db } from '../db.js';
import { accountFromToken } from '../auth.js';

export default async function analyticsRoutes(app) {
  app.get('/profile/:username/xp-totals', async (req) => {
    const { username } = req.params;

    const account = await db.oneOrNone(
      'SELECT id, is_public FROM accounts WHERE username = $1 ORDER BY updated_at DESC NULLS LAST LIMIT 1',
      [username]
    );
    if (!account) {
      return { notFound: true, username };
    }
    if (account.is_public === false) {
      return { private: true, username };
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

    return out;
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

    const account = await db.oneOrNone(
      'SELECT id, is_public FROM accounts WHERE username = $1 ORDER BY updated_at DESC NULLS LAST LIMIT 1',
      [username]
    );
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
    const account = await db.oneOrNone(
      'SELECT id, is_public FROM accounts WHERE username = $1 ORDER BY updated_at DESC NULLS LAST LIMIT 1',
      [username]
    );
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
    const account = await db.oneOrNone(
      'SELECT id, is_public FROM accounts WHERE username = $1 ORDER BY updated_at DESC NULLS LAST LIMIT 1',
      [username]
    );
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
