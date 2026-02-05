import XpTotalsTable from '@/components/XpTotalsTable';
import XpHistoryChart from '@/components/XpHistoryChart';
import XpGoalCard from '@/components/XpGoalCard';
import GearPanel from '@/components/GearPanel';
import BossKcList from '@/components/BossKcList';
import PrivacyToggle from '@/components/PrivacyToggle';
import { api, getBossKc, getGear } from '@/lib/api';

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
  const goals = await api(`/profile/${params.username}/goals`);
  const gear = await getGear(params.username);
  const bossKc = await getBossKc(params.username);
  const sumXp = (rows) => (rows || []).reduce((sum, row) => sum + Number(row.xp || 0), 0);
  const xpToday = sumXp(totals.day);
  const xpWeek = sumXp(totals.week);
  const xpMonth = sumXp(totals.month);

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section section--soft">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>{params.username}</h2>
          <span className="mono">RunePulse profile</span>
        </div>
      </section>

      <div className="grid grid-3">
        <div className="card">
          <div className="mono">Today</div>
          <div className="xp-number">{xpToday.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="mono">This week</div>
          <div className="xp-number">{xpWeek.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="mono">This month</div>
          <div className="xp-number">{xpMonth.toLocaleString()}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <section className="section">
          <h2>XP totals</h2>
          <XpTotalsTable data={totals} />
        </section>

        <section className="section">
          <h2>XP history</h2>
          <XpHistoryChart username={params.username} skill="Attack" />
        </section>
      </div>

      <div className="grid grid-2">
        <GearPanel gear={gear} />
        <BossKcList rows={bossKc} />
      </div>

      <section className="section">
        <h2>Goals</h2>
        <div className="grid grid-2">
          {goals.map((g) => (
            <XpGoalCard key={g.id} goal={g} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Privacy</h2>
        <PrivacyToggle />
      </section>
    </main>
  );
}
