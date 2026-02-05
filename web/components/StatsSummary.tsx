'use client';

import { useMemo, useState } from 'react';

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

export default function StatsSummary({ totals }) {
  const [range, setRange] = useState('day');
  const sumXp = (rows) => (rows || []).reduce((sum, row) => sum + Number(row.xp || 0), 0);

  const rows = totals?.[range] || [];
  const value = sumXp(rows);

  const topSkills = useMemo(() => {
    return [...rows]
      .filter((row) => Number(row.xp || 0) > 0)
      .sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0))
      .slice(0, 6);
  }, [rows]);

  return (
    <section className="section">
      <div className="stat-row">
        <h2 style={{ margin: 0 }}>XP gained</h2>
        <div className="toggle">
          <button
            className={`toggle-btn ${range === 'day' ? 'active' : ''}`}
            onClick={() => setRange('day')}
          >
            Day
          </button>
          <button
            className={`toggle-btn ${range === 'week' ? 'active' : ''}`}
            onClick={() => setRange('week')}
          >
            Week
          </button>
          <button
            className={`toggle-btn ${range === 'month' ? 'active' : ''}`}
            onClick={() => setRange('month')}
          >
            Month
          </button>
        </div>
      </div>
      <div className="stat-row" style={{ marginTop: 12 }}>
        <div className="xp-number">+{value.toLocaleString()} XP</div>
      </div>
      <div className="xp-skill-grid">
        {topSkills.map((row) => {
          const icon = getSkillIcon(row.skill);
          return (
            <div className="xp-skill-card" key={row.skill}>
              <div className="xp-skill-name">
                {icon ? <img className="skill-icon" src={icon} alt={row.skill} /> : null}
                <span>{row.skill}</span>
              </div>
              <div className="xp-number">+{Number(row.xp || 0).toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
