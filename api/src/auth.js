import crypto from 'node:crypto';
import { db } from './db.js';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function accountFromToken(token) {
  if (!token) return null;
  const hash = hashToken(token);
  return db.oneOrNone(
    'SELECT id, username FROM accounts WHERE api_token_hash = $1',
    [hash]
  );
}
