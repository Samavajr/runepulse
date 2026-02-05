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

export default function SkillsSummaryTable({ rows }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Skill</th>
          <th style={{ textAlign: 'right' }}>Level</th>
          <th style={{ textAlign: 'right' }}>XP</th>
          <th style={{ textAlign: 'right' }}>To next</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const icon = getSkillIcon(row.skill);
          return (
            <tr key={row.skill}>
              <td>
                <div className="skill-cell">
                  <span className="skill-dot" data-has-icon={Boolean(icon)} />
                  {icon ? <img className="skill-icon" src={icon} alt={row.skill} /> : null}
                  <span>{row.skill}</span>
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>{row.level}</td>
              <td style={{ textAlign: 'right' }}>
                <span className="xp-number">{Number(row.xp || 0).toLocaleString()}</span>
              </td>
              <td style={{ textAlign: 'right' }}>{Number(row.xpToNext || 0).toLocaleString()}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
