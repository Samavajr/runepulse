import XpTotalsTable from '@/components/XpTotalsTable';
import XpHistoryChart from '@/components/XpHistoryChart';
import XpGoalCard from '@/components/XpGoalCard';
import GearPanel from '@/components/GearPanel';
import BossKcList from '@/components/BossKcList';
import { api, getBossKc, getGear } from '@/lib/api';

export default async function Page({ params }) {
  const totals = await api(`/profile/${params.username}/xp-totals`);
  const goals = await api(`/profile/${params.username}/goals`);
  const gear = await getGear(params.username);
  const bossKc = await getBossKc(params.username);

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section section--soft">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>{params.username}</h2>
          <span className="mono">RunePulse profile</span>
        </div>
      </section>

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
    </main>
  );
}
