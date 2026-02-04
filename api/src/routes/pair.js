import crypto from 'node:crypto';
import { db } from '../db.js';
import { hashToken } from '../auth.js';

export default async function pairRoutes(app) {
  app.post('/pair', async () => {
    const token = crypto.randomBytes(16).toString('hex');
    const tokenHash = hashToken(token);
    const accountId = crypto.randomUUID();

    await db.none(
      'INSERT INTO accounts (id, username, api_token_hash, updated_at) VALUES ($1, $2, $3, NOW())',
      [accountId, '', tokenHash]
    );

    return { token };
  });
}
