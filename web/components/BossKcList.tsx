export default function BossKcList({ rows }) {
  return (
    <div className="section">
      <h2>Top Boss KC</h2>
      {rows.length === 0 ? (
        <p className="mono">No boss KC captured yet.</p>
      ) : (
        <div className="boss-grid">
          {rows.map((row) => (
            <div key={row.boss} className="boss-card">
              <div className="boss-name">{row.boss}</div>
              <div className="boss-kc">{Number(row.kc || 0).toLocaleString()}</div>
              <div className="mono">kills</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
