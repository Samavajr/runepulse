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

export default function XpTotalsTable({ data }) {
  const windows = ['lifetime', 'year', 'month', 'week', 'day'];
  const bySkill = {};

  windows.forEach((w) =>
    (data[w] || []).forEach((e) => {
      if (!bySkill[e.skill]) bySkill[e.skill] = {};
      bySkill[e.skill][w] = Number(e.xp || 0);
    })
  );

  return (
    <table className="table">
      <thead>
        <tr>
          <th style={{ textAlign: 'left' }}>Skill</th>
          {windows.map((w) => (
            <th key={w} style={{ textAlign: 'right' }}>{w}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(bySkill).map(([skill, values]) => {
          const icon = getSkillIcon(skill);
          return (
            <tr key={skill}>
              <td>
                <div className="skill-cell">
                  <span className="skill-dot" data-has-icon={Boolean(icon)} />
                  {icon ? (
                    <img
                      className="skill-icon"
                      src={icon}
                      alt={skill}
                    />
                  ) : null}
                  <span>{skill}</span>
                </div>
              </td>
              {windows.map((w) => (
                <td key={w} style={{ textAlign: 'right' }}>
                  <span className="xp-number">{(values[w] ?? 0).toLocaleString()}</span>
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
