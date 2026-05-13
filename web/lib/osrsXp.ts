export const MAX_LEVEL = 99;
export const MAX_XP = 200_000_000;

const XP_TABLE = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => {
  if (level <= 1) return 0;

  let points = 0;
  for (let lvl = 1; lvl < level; lvl += 1) {
    points += Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
  }

  return Math.floor(points / 4);
});

export function xpForLevel(level: number) {
  const safeLevel = Math.min(Math.max(Math.floor(level || 1), 1), MAX_LEVEL);
  return XP_TABLE[safeLevel];
}

export function levelForXp(xp: number) {
  const safeXp = Math.min(Math.max(Math.floor(xp || 0), 0), MAX_XP);
  let level = 1;

  for (let candidate = 2; candidate <= MAX_LEVEL; candidate += 1) {
    if (safeXp < XP_TABLE[candidate]) {
      break;
    }
    level = candidate;
  }

  return level;
}

export function xpToTarget(currentXp: number, target: number, targetMode: 'level' | 'xp') {
  const targetXp = targetMode === 'level' ? xpForLevel(target) : Math.min(Math.max(Math.floor(target || 0), 0), MAX_XP);
  return {
    targetXp,
    remaining: Math.max(targetXp - Math.max(Math.floor(currentXp || 0), 0), 0)
  };
}
