export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

export async function api(path) {
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getGear(username: string) {
  return api(`/profile/${username}/gear`);
}

export async function getBossKc(username: string) {
  return api(`/profile/${username}/boss-kc?limit=10`);
}
