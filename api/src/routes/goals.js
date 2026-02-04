import { db } from '../db.js';
import { accountFromToken } from '../auth.js';

function evaluateGoal({ currentXp, targetXp, xpPerHour, targetDate }) {
  const remainingXp = Math.max(targetXp - currentXp, 0);
  const hoursRemaining = targetDate
    ? (new Date(targetDate).getTime() - Date.now()) / 36e5
    : null;

  return {
    remainingXp,
    estimatedHours: xpPerHour > 0 ? remainingXp / xpPerHour : null,
    requiredXpPerHour:
      hoursRemaining && hoursRemaining > 0
        ? remainingXp / hoursRemaining
        : null
  };
}

export default async function goalsRoutes(app) {
  app.post('/goals', async (req, reply) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const account = await accountFromToken(token);
    if (!account) return reply.code(403).send();

    const { skill, targetXp, targetDate } = req.body || {};
    if (!skill || !targetXp) return reply.code(400).send();

    await db.none(`
      INSERT INTO xp_goals (account_id, skill, target_xp, target_date)
      VALUES ($1, $2, $3, $4)
    `, [account.id, skill, targetXp, targetDate || null]);

    return { ok: true };
  });

  app.get('/profile/:username/goals', async (req) => {
    const { username } = req.params;

    const account = await db.oneOrNone(
      'SELECT id FROM accounts WHERE username = $1 ORDER BY updated_at DESC NULLS LAST LIMIT 1',
      [username]
    );
    if (!account) {
      return [];
    }

    const goals = await db.any(
      'SELECT * FROM xp_goals WHERE account_id = $1',
      [account.id]
    );

    const evaluated = [];

    for (const goal of goals) {
      const [{ xp }] = await db.any(`
        SELECT
          COALESCE((SELECT xp FROM xp_baselines WHERE account_id = $1 AND skill = $2), 0)
          + COALESCE((SELECT SUM(xp_gained) FROM xp_events WHERE account_id = $1 AND skill = $2), 0)
          AS xp
      `, [account.id, goal.skill]);

      const [{ xp_per_hour }] = await db.any(`
        SELECT
          SUM(xp_gained) /
          NULLIF(EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 3600, 0)
          AS xp_per_hour
        FROM xp_events
        WHERE account_id = $1
          AND skill = $2
          AND timestamp >= NOW() AT TIME ZONE 'UTC' - INTERVAL '24 hours'
      `, [account.id, goal.skill]);

      evaluated.push({
        ...goal,
        currentXp: Number(xp ?? 0),
        xpPerHour: Number(xp_per_hour ?? 0),
        ...evaluateGoal({
          currentXp: Number(xp ?? 0),
          targetXp: goal.target_xp,
          xpPerHour: Number(xp_per_hour ?? 0),
          targetDate: goal.target_date
        })
      });
    }

    return evaluated;
  });
}
