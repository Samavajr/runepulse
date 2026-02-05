import { api } from '@/lib/api';

function sumXp(rows) {
  return (rows || []).reduce((sum, row) => sum + Number(row.xp || 0), 0);
}

function buildSkillMap(rows) {
  const map = {};
  (rows || []).forEach((row) => {
    if (row?.skill) map[row.skill] = Number(row.xp || 0);
  });
  return map;
}

export default async function ComparePage({ searchParams }) {
  const left = (searchParams?.left || '').toString().trim();
  const right = (searchParams?.right || '').toString().trim();

  const hasQuery = left && right;

  let leftTotals = null;
  let rightTotals = null;

  if (hasQuery) {
    leftTotals = await api(`/profile/${left}/xp-totals`);
    rightTotals = await api(`/profile/${right}/xp-totals`);
  }

  const leftPrivate = leftTotals?.private;
  const rightPrivate = rightTotals?.private;

  const window = 'month';
  const leftSkills = buildSkillMap(leftTotals?.[window]);
  const rightSkills = buildSkillMap(rightTotals?.[window]);
  const allSkills = Array.from(new Set([
    ...Object.keys(leftSkills),
    ...Object.keys(rightSkills)
  ])).sort();

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>Compare players</h2>
          <span className="mono">RunePulse</span>
        </div>
        <form method="get" className="grid grid-2" style={{ marginTop: 12 }}>
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
              <section className="section">
                <h2>Total XP gained</h2>
                <div className="grid grid-3">
                  <div className="card">
                    <div className="mono">Today</div>
                    <div className="stat-row">
                      <span>{left}</span>
                      <span className="xp-number">{sumXp(leftTotals?.day).toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span>{right}</span>
                      <span className="xp-number">{sumXp(rightTotals?.day).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="card">
                    <div className="mono">This week</div>
                    <div className="stat-row">
                      <span>{left}</span>
                      <span className="xp-number">{sumXp(leftTotals?.week).toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span>{right}</span>
                      <span className="xp-number">{sumXp(rightTotals?.week).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="card">
                    <div className="mono">This month</div>
                    <div className="stat-row">
                      <span>{left}</span>
                      <span className="xp-number">{sumXp(leftTotals?.month).toLocaleString()}</span>
                    </div>
                    <div className="stat-row">
                      <span>{right}</span>
                      <span className="xp-number">{sumXp(rightTotals?.month).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section">
                <h2>Per-skill comparison (month)</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Skill</th>
                      <th style={{ textAlign: 'right' }}>{left}</th>
                      <th style={{ textAlign: 'right' }}>{right}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSkills.map((skill) => (
                      <tr key={skill}>
                        <td>{skill}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="xp-number">{(leftSkills[skill] || 0).toLocaleString()}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="xp-number">{(rightSkills[skill] || 0).toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </>
          )}
        </>
      )}
    </main>
  );
}
