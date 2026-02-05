'use client';

const skillIcons = {
  Attack: 'Attack_icon.png',
  Strength: 'Strength_icon.png',
  Defence: 'Defence_icon.png',
  Ranged: 'Ranged_icon.png',
  Prayer: 'Prayer_icon.png',
  Magic: 'Magic_icon.png',
  Runecraft: 'Runecraft_icon.png',
  Hitpoints: 'Hitpoints_icon.png',
  Crafting: 'Crafting_icon.png',
  Mining: 'Mining_icon.png',
  Smithing: 'Smithing_icon.png',
  Fishing: 'Fishing_icon.png',
  Cooking: 'Cooking_icon.png',
  Firemaking: 'Firemaking_icon.png',
  Woodcutting: 'Woodcutting_icon.png',
  Agility: 'Agility_icon.png',
  Herblore: 'Herblore_icon.png',
  Thieving: 'Thieving_icon.png',
  Fletching: 'Fletching_icon.png',
  Slayer: 'Slayer_icon.png',
  Farming: 'Farming_icon.png',
  Construction: 'Construction_icon.png',
  Hunter: 'Hunter_icon.png',
  Sailing: 'Sailing_icon.png'
};

function getSkillIcon(skill) {
  const file = skillIcons[skill];
  return file ? `https://oldschool.runescape.wiki/images/${file}` : null;
}

function xpForLevel(level) {
  let points = 0;
  for (let i = 1; i < level; i += 1) {
    points += Math.floor(i + 300 * Math.pow(2, i / 7));
  }
  return Math.floor(points / 4);
}

function getProgress(row) {
  const level = Math.max(1, Number(row.level || 1));
  const xp = Math.max(0, Number(row.xp || 0));
  const levelBase = xpForLevel(level);
  const nextBase = xpForLevel(level + 1);
  const clampedXp = Math.max(xp, levelBase);
  const span = Math.max(nextBase - levelBase, 1);
  const progress = Math.min(Math.max((clampedXp - levelBase) / span, 0), 1);
  const xpToNext = Number.isFinite(row.xpToNext)
    ? Number(row.xpToNext)
    : Math.max(nextBase - xp, 0);

  return { level, xp, xpToNext, progress };
}

export default function SkillsSummaryTable({ rows, selectedSkill, onSelect }) {
  return (
    <div className="skills-scroll">
      {rows.map((row) => {
        const icon = getSkillIcon(row.skill);
        const { level, xp, xpToNext, progress } = getProgress(row);
        const isActive = selectedSkill === row.skill;
        return (
          <button
            className={`skill-row ${isActive ? 'skill-row--active' : ''}`}
            type="button"
            key={row.skill}
            onClick={() => onSelect?.(row.skill)}
          >
            <div className="skill-row-main">
              <div className="skill-cell">
                <span className="skill-dot" data-has-icon={Boolean(icon)} />
                {icon ? <img className="skill-icon" src={icon} alt={row.skill} /> : null}
                <span>{row.skill}</span>
              </div>
              <span className="skill-level">Lv {level}</span>
            </div>
            <div className="skill-row-bar">
              <div className="skill-bar">
                <div className="skill-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <div className="skill-row-meta">
                <span className="xp-number">{xp.toLocaleString()} XP</span>
                <span className="mono">{xpToNext.toLocaleString()} to next</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
