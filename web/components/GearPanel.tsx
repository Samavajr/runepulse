const slotOrder = [
  'HEAD',
  'CAPE',
  'AMULET',
  'WEAPON',
  'BODY',
  'SHIELD',
  'LEGS',
  'HANDS',
  'FEET',
  'RING',
  'AMMO'
];

export default function GearPanel({ gear }) {
  const slots = gear?.slots || {};
  const updatedAt = gear?.timestamp ? new Date(gear.timestamp) : null;

  return (
    <div className="section">
      <div className="stat-row" style={{ marginBottom: 12 }}>
        <h2>Gear</h2>
        {updatedAt ? (
          <span className="mono">
            Updated {updatedAt.toLocaleString('en-US', { timeZone: 'America/Chicago' })}
          </span>
        ) : (
          <span className="mono">No snapshot yet</span>
        )}
      </div>

      <div className="gear-grid">
        {slotOrder.map((slot) => {
          const item = slots[slot];
          return (
            <div key={slot} className="gear-slot">
              <div className="gear-label">{slot}</div>
              <div className="gear-item-row">
                {item?.id ? (
                  <img
                    className="gear-icon"
                    src={`https://static.runelite.net/cache/item/icon/${item.id}.png`}
                    alt={item?.name || slot}
                  />
                ) : (
                  <div className="gear-icon gear-icon--empty" />
                )}
                <div className="gear-item">
                  {item?.name ? item.name : 'Empty'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
