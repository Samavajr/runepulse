export default function XpGoalCard({ goal }) {
  const pct = Math.min(goal.currentXp / goal.target_xp, 1) * 100;

  return (
    <div className="card">
      <div className="stat-row">
        <strong>{goal.skill}</strong>
        <span className="mono">{Math.floor(pct)}%</span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="mono">
        {goal.currentXp.toLocaleString()} / {goal.target_xp.toLocaleString()} XP
      </div>
      <div className="mono">XP/hr: {Math.round(goal.xpPerHour || 0).toLocaleString()}</div>
      {goal.estimatedHours ? (
        <div className="mono">ETA: {Math.ceil(goal.estimatedHours)} hours</div>
      ) : null}
      {goal.requiredXpPerHour ? (
        <div className="mono">
          Required XP/hr: {Math.round(goal.requiredXpPerHour).toLocaleString()}
        </div>
      ) : null}
    </div>
  );
}
