export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === 'true';

const MOCK_TOTALS = {
  lifetime: [
    { skill: 'Attack', xp: 3271953 },
    { skill: 'Strength', xp: 4012501 },
    { skill: 'Defence', xp: 2154419 },
    { skill: 'Hitpoints', xp: 3464480 },
    { skill: 'Ranged', xp: 1494300 },
    { skill: 'Prayer', xp: 751613 },
    { skill: 'Magic', xp: 1279465 }
  ],
  year: [
    { skill: 'Attack', xp: 702341 },
    { skill: 'Strength', xp: 853110 },
    { skill: 'Defence', xp: 412993 },
    { skill: 'Hitpoints', xp: 555102 },
    { skill: 'Ranged', xp: 214000 },
    { skill: 'Prayer', xp: 132050 },
    { skill: 'Magic', xp: 304600 }
  ],
  month: [
    { skill: 'Attack', xp: 182300 },
    { skill: 'Strength', xp: 244600 },
    { skill: 'Defence', xp: 103400 },
    { skill: 'Hitpoints', xp: 141700 },
    { skill: 'Ranged', xp: 50100 },
    { skill: 'Prayer', xp: 40200 },
    { skill: 'Magic', xp: 78300 }
  ],
  week: [
    { skill: 'Attack', xp: 49300 },
    { skill: 'Strength', xp: 61100 },
    { skill: 'Defence', xp: 27100 },
    { skill: 'Hitpoints', xp: 36200 },
    { skill: 'Ranged', xp: 12300 },
    { skill: 'Prayer', xp: 9300 },
    { skill: 'Magic', xp: 20400 }
  ],
  day: [
    { skill: 'Attack', xp: 8200 },
    { skill: 'Strength', xp: 10450 },
    { skill: 'Defence', xp: 3900 },
    { skill: 'Hitpoints', xp: 5200 },
    { skill: 'Ranged', xp: 2100 },
    { skill: 'Prayer', xp: 1400 },
    { skill: 'Magic', xp: 2800 }
  ]
};

const MOCK_SKILLS_SUMMARY = [
  { skill: 'Agility', level: 73, xp: 1079261, xpToNext: 17017 },
  { skill: 'Attack', level: 85, xp: 3271953, xpToNext: 325839 },
  { skill: 'Construction', level: 54, xp: 157006, xpToNext: 9630 },
  { skill: 'Cooking', level: 74, xp: 1131959, xpToNext: 78462 },
  { skill: 'Crafting', level: 66, xp: 535661, xpToNext: 12292 },
  { skill: 'Defence', level: 80, xp: 2154419, xpToNext: 38399 },
  { skill: 'Farming', level: 68, xp: 607510, xpToNext: 60541 },
  { skill: 'Firemaking', level: 82, xp: 2556147, xpToNext: 116967 },
  { skill: 'Fishing', level: 82, xp: 2582254, xpToNext: 90860 },
  { skill: 'Fletching', level: 60, xp: 300435, xpToNext: 1853 },
  { skill: 'Herblore', level: 62, xp: 365152, xpToNext: 3447 },
  { skill: 'Hitpoints', level: 85, xp: 3464480, xpToNext: 133312 },
  { skill: 'Hunter', level: 69, xp: 688383, xpToNext: 49244 },
  { skill: 'Magic', level: 75, xp: 1279465, xpToNext: 56978 },
  { skill: 'Mining', level: 81, xp: 2377118, xpToNext: 43969 },
  { skill: 'Prayer', level: 70, xp: 751613, xpToNext: 62832 },
  { skill: 'Ranged', level: 77, xp: 1494300, xpToNext: 134900 },
  { skill: 'Runecraft', level: 73, xp: 1003750, xpToNext: 92528 },
  { skill: 'Sailing', level: 55, xp: 177492, xpToNext: 6548 },
  { skill: 'Slayer', level: 65, xp: 488265, xpToNext: 7989 }
];

const MOCK_GEAR = [
  { slot: 'Head', itemName: 'Helm of neitiznot', itemId: 10828 },
  { slot: 'Cape', itemName: 'Fire cape', itemId: 6570 },
  { slot: 'Amulet', itemName: 'Amulet of power', itemId: 1731 },
  { slot: 'Weapon', itemName: 'Zombie axe', itemId: 28177 },
  { slot: 'Body', itemName: 'Rune platebody', itemId: 1127 },
  { slot: 'Shield', itemName: 'Dragon defender', itemId: 12954 },
  { slot: 'Legs', itemName: 'Rune platelegs', itemId: 1079 },
  { slot: 'Hands', itemName: 'Barrows gloves', itemId: 7462 },
  { slot: 'Feet', itemName: 'Climbing boots', itemId: 3105 },
  { slot: 'Ring', itemName: 'Ring of life', itemId: 2570 },
  { slot: 'Ammo', itemName: 'Empty', itemId: -1 }
];

const MOCK_BOSS_KC = [
  { boss: 'Zulrah', kc: 142 },
  { boss: 'Vorkath', kc: 98 },
  { boss: 'Kree\'arra', kc: 31 },
  { boss: 'General Graardor', kc: 84 },
  { boss: 'Kraken', kc: 210 },
  { boss: 'Cerberus', kc: 52 },
  { boss: 'Barrows', kc: 301 },
  { boss: 'Sarachnis', kc: 64 },
  { boss: 'Calvar\'ion', kc: 24 },
  { boss: 'Giant Mole', kc: 115 }
];

const MOCK_HISTORY = [
  { time: '2026-02-01T18:00:00Z', xp: 1200 },
  { time: '2026-02-02T00:00:00Z', xp: 2400 },
  { time: '2026-02-02T06:00:00Z', xp: 1800 },
  { time: '2026-02-02T12:00:00Z', xp: 3200 },
  { time: '2026-02-02T18:00:00Z', xp: 4100 },
  { time: '2026-02-03T00:00:00Z', xp: 2800 },
  { time: '2026-02-03T06:00:00Z', xp: 5100 },
  { time: '2026-02-03T12:00:00Z', xp: 3300 },
  { time: '2026-02-03T18:00:00Z', xp: 5900 },
  { time: '2026-02-04T00:00:00Z', xp: 2700 }
];

function getMock(path: string) {
  if (path.includes('/xp-totals')) return MOCK_TOTALS;
  if (path.includes('/skills-summary')) return MOCK_SKILLS_SUMMARY;
  if (path.includes('/gear')) return MOCK_GEAR;
  if (path.includes('/boss-kc')) return MOCK_BOSS_KC;
  if (path.includes('/xp-history')) return MOCK_HISTORY;
  return {};
}

export async function api(path) {
  if (USE_MOCKS) return getMock(path);
  const res = await fetch(`${API_BASE}${path}`, { cache: 'no-store' });
  if (res.status === 403) {
    return { private: true };
  }
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getGear(username: string) {
  return api(`/profile/${username}/gear`);
}

export async function getBossKc(username: string) {
  return api(`/profile/${username}/boss-kc?limit=10`);
}

export async function getSkillsSummary(username: string) {
  return api(`/profile/${username}/skills-summary`);
}
