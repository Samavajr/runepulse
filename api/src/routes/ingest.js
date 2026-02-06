import { db } from '../db.js';
import { accountFromToken } from '../auth.js';
import { fetchHiscoreBossKc } from '../hiscore.js';

async function mergeDuplicateAccounts(username, keepAccountId) {
  if (!username) return;

  await db.tx(async (t) => {
    const dupRows = await t.any(
      'SELECT id FROM accounts WHERE LOWER(username) = LOWER($1) AND id <> $2',
      [username, keepAccountId]
    );
    const dupIds = dupRows.map((r) => r.id);
    if (dupIds.length === 0) {
      return;
    }

    await t.none(
      'UPDATE xp_events SET account_id = $1 WHERE account_id IN ($2:csv)',
      [keepAccountId, dupIds]
    );
    await t.none(
      'UPDATE xp_goals SET account_id = $1 WHERE account_id IN ($2:csv)',
      [keepAccountId, dupIds]
    );
    await t.none(
      'UPDATE gear_snapshots SET account_id = $1 WHERE account_id IN ($2:csv)',
      [keepAccountId, dupIds]
    );

    await t.none(
      `INSERT INTO xp_baselines (account_id, skill, xp, captured_at)
       SELECT $1, skill, xp, captured_at
       FROM xp_baselines
       WHERE account_id IN ($2:csv)
       ON CONFLICT (account_id, skill) DO UPDATE
       SET xp = GREATEST(xp_baselines.xp, EXCLUDED.xp),
           captured_at = GREATEST(xp_baselines.captured_at, EXCLUDED.captured_at)`,
      [keepAccountId, dupIds]
    );

    await t.none(
      `INSERT INTO boss_kc (account_id, boss, kc, updated_at)
       SELECT $1, boss, kc, updated_at
       FROM boss_kc
       WHERE account_id IN ($2:csv)
       ON CONFLICT (account_id, boss) DO UPDATE
       SET kc = GREATEST(boss_kc.kc, EXCLUDED.kc),
           updated_at = GREATEST(boss_kc.updated_at, EXCLUDED.updated_at)`,
      [keepAccountId, dupIds]
    );

    await t.none(
      'DELETE FROM accounts WHERE id IN ($1:csv)',
      [dupIds]
    );
  });
}

async function ensureBossKcBaseline(accountId, username, logger) {
  if (!username) return;

  const existing = await db.oneOrNone(
    'SELECT 1 FROM boss_kc WHERE account_id = $1 LIMIT 1',
    [accountId]
  );
  if (existing) return;

  try {
    const hiscoreKc = await fetchHiscoreBossKc(username);
    const entries = Object.entries(hiscoreKc);
    if (entries.length === 0) return;

    const upsert = `
      INSERT INTO boss_kc (account_id, boss, kc, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (account_id, boss)
      DO UPDATE SET kc = EXCLUDED.kc, updated_at = EXCLUDED.updated_at
    `;

    for (const [boss, kc] of entries) {
      await db.none(upsert, [accountId, boss, kc]);
    }
  } catch (err) {
    if (logger?.warn) {
      logger.warn({ err }, 'hiscore boss kc fetch failed');
    } else {
      console.warn('hiscore boss kc fetch failed', err);
    }
  }
}

export default async function ingestRoutes(app) {
  app.post('/xp', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const account = await accountFromToken(token);
    if (!account) return reply.code(403).send();

    const { timestamp, xpGained, username } = req.body || {};
    if (!timestamp || !xpGained) return reply.code(400).send();

    if (username) {
      await db.none(
        'UPDATE accounts SET username = $1, updated_at = NOW() WHERE id = $2',
        [username, account.id]
      );
      await mergeDuplicateAccounts(username, account.id);
      await ensureBossKcBaseline(account.id, username, app.log);
    }

    const entries = Object.entries(xpGained);
    if (entries.length === 0) return { ok: true };

    const insert = `
      INSERT INTO xp_events (account_id, skill, xp_gained, timestamp)
      VALUES ($1, $2, $3, to_timestamp($4))
    `;

    for (const [skill, xp] of entries) {
      await db.none(insert, [account.id, skill, xp, timestamp]);
    }

    return { ok: true };
  });

  app.post('/baseline', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const account = await accountFromToken(token);
    if (!account) return reply.code(403).send();

    const { timestamp, skills, username } = req.body || {};
    if (!timestamp || !skills) return reply.code(400).send();

    if (username) {
      await db.none(
        'UPDATE accounts SET username = $1, updated_at = NOW() WHERE id = $2',
        [username, account.id]
      );
      await mergeDuplicateAccounts(username, account.id);
      await ensureBossKcBaseline(account.id, username, app.log);
    }

    const entries = Object.entries(skills);
    if (entries.length === 0) return { ok: true };

    const upsert = `
      INSERT INTO xp_baselines (account_id, skill, xp, captured_at)
      VALUES ($1, $2, $3, to_timestamp($4))
      ON CONFLICT (account_id, skill)
      DO UPDATE SET xp = EXCLUDED.xp, captured_at = EXCLUDED.captured_at
    `;

    for (const [skill, xp] of entries) {
      await db.none(upsert, [account.id, skill, xp, timestamp]);
    }

    return { ok: true };
  });

  app.post('/gear', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const account = await accountFromToken(token);
    if (!account) return reply.code(403).send();

    const { timestamp, username, slots } = req.body || {};
    if (!timestamp || !slots) return reply.code(400).send();

    if (username) {
      await db.none(
        'UPDATE accounts SET username = $1, updated_at = NOW() WHERE id = $2',
        [username, account.id]
      );
      await mergeDuplicateAccounts(username, account.id);
      await ensureBossKcBaseline(account.id, username, app.log);
    }

    await db.none(
      'INSERT INTO gear_snapshots (account_id, timestamp, slots) VALUES ($1, to_timestamp($2), $3)',
      [account.id, timestamp, slots]
    );

    return { ok: true };
  });

  app.post('/boss-kc', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const account = await accountFromToken(token);
    if (!account) return reply.code(403).send();

    const { timestamp, username, bossKc } = req.body || {};
    if (!timestamp || !bossKc) return reply.code(400).send();

    if (username) {
      await db.none(
        'UPDATE accounts SET username = $1, updated_at = NOW() WHERE id = $2',
        [username, account.id]
      );
      await mergeDuplicateAccounts(username, account.id);
      await ensureBossKcBaseline(account.id, username, app.log);
    }

    const upsert = `
      INSERT INTO boss_kc (account_id, boss, kc, updated_at)
      VALUES ($1, $2, $3, to_timestamp($4))
      ON CONFLICT (account_id, boss)
      DO UPDATE SET kc = EXCLUDED.kc, updated_at = EXCLUDED.updated_at
    `;

    for (const [boss, kc] of Object.entries(bossKc)) {
      await db.none(upsert, [account.id, boss, kc, timestamp]);
    }

    return { ok: true };
  });
}
