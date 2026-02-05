import GearPanel from '@/components/GearPanel';
import BossKcList from '@/components/BossKcList';
import SkillsOverviewPanel from '@/components/SkillsOverviewPanel';
import StatsSummary from '@/components/StatsSummary';
import { api, getBossKc, getGear, getSkillsSummary } from '@/lib/api';

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

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section section--soft">
        <div className="stat-row">
          <h2 style={{ margin: 0 }}>{params.username}</h2>
        </div>
      </section>

      <StatsSummary totals={totals} />

      <SkillsOverviewPanel rows={skillsSummary || []} username={params.username} />

      <div className="grid grid-2">
        <GearPanel gear={gear} />
        <BossKcList rows={bossKc} />
      </div>

    </main>
  );
}
