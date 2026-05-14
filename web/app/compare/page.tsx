import { api, getBossKc, getGear, getSkillsSummary } from '@/lib/api';
import AssetImage from '@/components/AssetImage';
import { getBossImage, getSkillIcon, initials } from '@/lib/osrsAssets';

const ranges = ['day', 'week', 'month', 'year', 'lifetime'];
const slotOrder = ['HEAD', 'CAPE', 'AMULET', 'WEAPON', 'BODY', 'SHIELD', 'LEGS', 'HANDS', 'FEET', 'RING', 'AMMO'];

function sumXp(rows) {
  return (rows || []).reduce((sum, row) => sum + Number(row.xp || 0), 0);
}

function rowsByKey(rows, key) {
  const map = {};
  (rows || []).forEach((row) => {
    if (row?.[key]) map[row[key]] = row;
  });
  return map;
}

function xpGainMap(rows) {
  const map = {};
  (rows || []).forEach((row) => {
    if (row?.skill) map[row.skill] = Number(row.xp || 0);
  });
  return map;
}

function format(value) {
  return Number(value || 0).toLocaleString();
}

function deltaClass(value) {
  if (value > 0) return 'compare-positive';
  if (value < 0) return 'compare-negative';
  return 'mono';
}

function signed(value) {
  const number = Number(value || 0);
  if (number > 0) return `+${format(number)}`;
  if (number < 0) return `-${format(Math.abs(number))}`;
  return '0';
}

function bestSkillName(totals, range) {
  const row = [...(totals?.[range] || [])].sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0))[0];
  return row?.skill || 'None yet';
}

function CompareStat({ label, leftLabel, rightLabel, leftValue, rightValue }) {
  const diff = Number(leftValue || 0) - Number(rightValue || 0);

  return (
    <div className="compare-stat">
      <div className="mono">{label}</div>
      <div className="compare-stat-row">
        <span>{leftLabel}</span>
        <strong className="xp-number">{format(leftValue)}</strong>
      </div>
      <div className="compare-stat-row">
        <span>{rightLabel}</span>
        <strong className="xp-number">{format(rightValue)}</strong>
      </div>
      <div className="compare-delta">
        <span className="mono">Difference</span>
        <strong className={deltaClass(diff)}>{signed(diff)}</strong>
      </div>
    </div>
  );
}

function PlayerCard({ name, totals, skills }) {
  const totalCurrentXp = sumXp(skills);

  return (
    <div className="compare-player-card">
      <div>
        <span className="mono">Player</span>
        <h2>{name}</h2>
      </div>
      <div className="compare-player-metrics">
        <div>
          <span className="mono">Current skill XP</span>
          <strong className="xp-number">{format(totalCurrentXp)}</strong>
        </div>
        <div>
          <span className="mono">Today</span>
          <strong>{format(sumXp(totals?.day))}</strong>
        </div>
        <div>
          <span className="mono">Best today</span>
          <strong>{bestSkillName(totals, 'day')}</strong>
        </div>
      </div>
    </div>
  );
}

function BossFace({ boss }) {
  const image = getBossImage(boss);

  return (
    <AssetImage
      className="compare-boss-image"
      src={image}
      fallback={initials(boss)}
      fallbackClassName="compare-boss-image compare-boss-image--fallback"
    />
  );
}

function GearMini({ item }) {
  if (!item?.id) {
    return (
      <div className="compare-gear-mini">
        <span className="gear-icon gear-icon--empty" />
        <span>Empty</span>
      </div>
    );
  }

  return (
    <div className="compare-gear-mini">
      <img className="compare-gear-icon" src={`https://static.runelite.net/cache/item/icon/${item.id}.png`} alt="" />
      <span>{item.name || 'Unknown'}</span>
    </div>
  );
}

export default async function ComparePage({ searchParams }) {
  const left = (searchParams?.left || '').toString().trim();
  const right = (searchParams?.right || '').toString().trim();
  const range = ranges.includes((searchParams?.range || '').toString()) ? searchParams.range.toString() : 'month';
  const hasQuery = left && right;

  let leftTotals = null;
  let rightTotals = null;
  let leftSkills = [];
  let rightSkills = [];
  let leftBosses = [];
  let rightBosses = [];
  let leftGear = null;
  let rightGear = null;

  if (hasQuery) {
    [leftTotals, rightTotals, leftSkills, rightSkills, leftBosses, rightBosses, leftGear, rightGear] = await Promise.all([
      api(`/profile/${encodeURIComponent(left)}/xp-totals`),
      api(`/profile/${encodeURIComponent(right)}/xp-totals`),
      getSkillsSummary(left),
      getSkillsSummary(right),
      getBossKc(left, 25),
      getBossKc(right, 25),
      getGear(left),
      getGear(right)
    ]);
  }

  const leftPrivate = leftTotals?.private;
  const rightPrivate = rightTotals?.private;
  const leftSkillRows = rowsByKey(leftSkills, 'skill');
  const rightSkillRows = rowsByKey(rightSkills, 'skill');
  const leftGains = xpGainMap(leftTotals?.[range]);
  const rightGains = xpGainMap(rightTotals?.[range]);
  const allSkills = Array.from(new Set([
    ...Object.keys(leftSkillRows),
    ...Object.keys(rightSkillRows),
    ...Object.keys(leftGains),
    ...Object.keys(rightGains)
  ])).sort();
  const leftBossRows = rowsByKey(leftBosses, 'boss');
  const rightBossRows = rowsByKey(rightBosses, 'boss');
  const allBosses = Array.from(new Set([...Object.keys(leftBossRows), ...Object.keys(rightBossRows)]))
    .sort((a, b) =>
      (Number(rightBossRows[b]?.kc || 0) + Number(leftBossRows[b]?.kc || 0)) -
      (Number(rightBossRows[a]?.kc || 0) + Number(leftBossRows[a]?.kc || 0))
    );

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section compare-hero">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>Compare players</h2>
          <span className="mono">XP, bosses, and gear</span>
        </div>
        <form method="get" className="compare-form">
          <input
            className="input"
            name="left"
            placeholder="First username"
            defaultValue={left}
            autoComplete="off"
          />
          <input
            className="input"
            name="right"
            placeholder="Second username"
            defaultValue={right}
            autoComplete="off"
          />
          <select className="select" name="range" defaultValue={range}>
            {ranges.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button className="button" type="submit">Compare</button>
        </form>
      </section>

      {!hasQuery ? null : (
        <>
          {(leftPrivate || rightPrivate) ? (
            <section className="section">
              <h2>Private profile</h2>
              <p className="subtitle">
                One of these profiles is private. Ask the owner to enable public access.
              </p>
            </section>
          ) : (
            <>
              <section className="compare-player-grid">
                <PlayerCard name={leftTotals?.username || left} totals={leftTotals} skills={leftSkills} />
                <PlayerCard name={rightTotals?.username || right} totals={rightTotals} skills={rightSkills} />
              </section>

              <section className="section">
                <h2>XP gained</h2>
                <div className="grid grid-3">
                  <CompareStat label="Today" leftLabel={left} rightLabel={right} leftValue={sumXp(leftTotals?.day)} rightValue={sumXp(rightTotals?.day)} />
                  <CompareStat label="This week" leftLabel={left} rightLabel={right} leftValue={sumXp(leftTotals?.week)} rightValue={sumXp(rightTotals?.week)} />
                  <CompareStat label="This month" leftLabel={left} rightLabel={right} leftValue={sumXp(leftTotals?.month)} rightValue={sumXp(rightTotals?.month)} />
                </div>
              </section>

              <section className="section compare-table-section">
                <div className="stat-row">
                  <h2 style={{ margin: 0 }}>Skills</h2>
                  <span className="pill">{range} gains</span>
                </div>
                <table className="table compare-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Skill</th>
                      <th style={{ textAlign: 'right' }}>{left}</th>
                      <th style={{ textAlign: 'right' }}>{right}</th>
                      <th style={{ textAlign: 'right' }}>XP diff</th>
                      <th style={{ textAlign: 'right' }}>{range} diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSkills.map((skill) => {
                      const leftRow = leftSkillRows[skill] || {};
                      const rightRow = rightSkillRows[skill] || {};
                      const xpDiff = Number(leftRow.xp || 0) - Number(rightRow.xp || 0);
                      const gainDiff = Number(leftGains[skill] || 0) - Number(rightGains[skill] || 0);
                      const icon = getSkillIcon(skill);

                      return (
                        <tr key={skill}>
                          <td>
                            <span className="skill-cell">
                              {icon ? <img className="skill-icon" src={icon} alt="" /> : null}
                              <span>{skill}</span>
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong>Lv {Number(leftRow.level || 1)}</strong>
                            <div className="mono">{format(leftRow.xp)} XP</div>
                            <div className="xp-number">+{format(leftGains[skill])}</div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <strong>Lv {Number(rightRow.level || 1)}</strong>
                            <div className="mono">{format(rightRow.xp)} XP</div>
                            <div className="xp-number">+{format(rightGains[skill])}</div>
                          </td>
                          <td style={{ textAlign: 'right' }} className={deltaClass(xpDiff)}>{signed(xpDiff)}</td>
                          <td style={{ textAlign: 'right' }} className={deltaClass(gainDiff)}>{signed(gainDiff)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>

              <section className="section">
                <div className="stat-row">
                  <h2 style={{ margin: 0 }}>Boss KC</h2>
                  <span className="pill">{allBosses.length} bosses</span>
                </div>
                {allBosses.length === 0 ? (
                  <p className="mono">No boss KC captured yet.</p>
                ) : (
                  <div className="compare-boss-grid">
                    {allBosses.map((boss) => {
                      const leftKc = Number(leftBossRows[boss]?.kc || 0);
                      const rightKc = Number(rightBossRows[boss]?.kc || 0);
                      const diff = leftKc - rightKc;

                      return (
                        <div className="compare-boss-card" key={boss}>
                          <BossFace boss={boss} />
                          <div>
                            <div className="boss-name">{boss}</div>
                            <div className="compare-boss-kc">
                              <span>{left}: <strong>{format(leftKc)}</strong></span>
                              <span>{right}: <strong>{format(rightKc)}</strong></span>
                            </div>
                            <div className={deltaClass(diff)}>{signed(diff)} KC</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="section">
                <h2>Gear</h2>
                <div className="compare-gear-grid">
                  {slotOrder.map((slot) => (
                    <div className="compare-gear-row" key={slot}>
                      <div className="gear-label">{slot}</div>
                      <GearMini item={leftGear?.slots?.[slot]} />
                      <GearMini item={rightGear?.slots?.[slot]} />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
