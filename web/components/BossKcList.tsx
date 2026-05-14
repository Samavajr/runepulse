import AssetImage from '@/components/AssetImage';
import { getBossImage, initials } from '@/lib/osrsAssets';

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
              <div className="boss-card-top">
                <AssetImage
                  className="boss-image"
                  src={getBossImage(row.boss)}
                  fallback={initials(row.boss)}
                  fallbackClassName="boss-image boss-image--fallback"
                />
                <div>
                  <div className="boss-name">{row.boss}</div>
                  {row.updated_at ? (
                    <div className="mono">
                      Updated {new Date(row.updated_at).toLocaleDateString('en-US')}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="boss-kc-row">
                <span className="boss-kc">{Number(row.kc || 0).toLocaleString()}</span>
                <span className="mono">kills</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
