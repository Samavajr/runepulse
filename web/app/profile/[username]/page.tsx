import GearPanel from '@/components/GearPanel';
import BossKcList from '@/components/BossKcList';
import SkillsOverviewPanel from '@/components/SkillsOverviewPanel';
import StatsSummary from '@/components/StatsSummary';
import { api, getBossKc, getGear, getSkillsSummary, getTelemetryStatus } from '@/lib/api';

function formatStatusTime(value) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-US', { timeZone: 'America/Chicago' });
}

function TelemetryStatus({ status }) {
  if (!status) return null;

  const rows = [
    ['Account', status.accountFound ? 'Found' : 'Not found'],
    ['Last plugin contact', formatStatusTime(status.updatedAt)],
    ['XP baseline', `${status.baselineCount || 0} skills, ${formatStatusTime(status.latestBaselineAt)}`],
    ['XP gained events', `${status.xpEventCount || 0} events, ${Number(status.xpGained24h || 0).toLocaleString()} XP today`],
    ['Latest XP event', formatStatusTime(status.latestXpAt)],
    ['Gear snapshots', `${status.gearSnapshotCount || 0} snapshots, ${formatStatusTime(status.latestGearAt)}`],
    ['Boss KC rows', `${status.bossKcCount || 0} bosses, ${formatStatusTime(status.latestBossKcAt)}`]
  ];

  return (
    <section className="section telemetry-status">
      <div className="stat-row">
        <h2 style={{ margin: 0 }}>Telemetry status</h2>
        <span className={status.accountFound ? 'pill status-good' : 'pill status-warn'}>
          {status.accountFound ? 'Connected' : 'Waiting'}
        </span>
      </div>
      <div className="status-grid">
        {rows.map(([label, value]) => (
          <div key={label} className="status-item">
            <span className="mono">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function topRecentSkill(totals) {
  for (const range of ['day', 'week', 'month', 'year', 'lifetime']) {
    const rows = Array.isArray(totals?.[range]) ? totals[range] : [];
    const best = [...rows]
      .filter((row) => Number(row.xp || 0) > 0)
      .sort((a, b) => Number(b.xp || 0) - Number(a.xp || 0))[0];

    if (best?.skill) {
      return best.skill;
    }
  }

  return null;
}

export default async function Page({ params }) {
  const totals = await api(`/profile/${params.username}/xp-totals`);
  if (totals?.private) {
    return (
      <main className="container grid" style={{ gap: 22 }}>
        <section className="section">
          <h2>Private profile</h2>
          <p className="subtitle">
            This profile is private. Ask the owner to enable public access.
          </p>
        </section>
      </main>
    );
  }
  const gear = await getGear(params.username);
  const bossKc = await getBossKc(params.username);
  const skillsSummary = await getSkillsSummary(params.username);
  const telemetryStatus = await getTelemetryStatus(params.username);

  const displayName = totals?.username || params.username;
  const initialSkill = topRecentSkill(totals);

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section section--soft">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>{displayName}</h2>
          <a className="button" href={`/calculators?username=${encodeURIComponent(params.username)}`}>
            Calculator
          </a>
        </div>
      </section>

      <StatsSummary totals={totals} />

      <TelemetryStatus status={telemetryStatus} />

      <SkillsOverviewPanel rows={skillsSummary || []} username={params.username} initialSkill={initialSkill} />

      <div className="grid grid-2">
        <GearPanel gear={gear} />
        <BossKcList rows={bossKc} />
      </div>

    </main>
  );
}
