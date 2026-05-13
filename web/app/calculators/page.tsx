import SkillCalculator from '@/components/SkillCalculator';

export const metadata = {
  title: 'Skill Calculator | RunePulse'
};

export default function CalculatorsPage({ searchParams }) {
  const username = (searchParams?.username || '').toString();
  const skill = (searchParams?.skill || 'Prayer').toString();

  return (
    <main className="container grid" style={{ gap: 22 }}>
      <section className="section section--soft">
        <div className="stat-row">
          <div>
            <h2 style={{ margin: 0 }}>Calculators</h2>
          </div>
        </div>
      </section>
      <SkillCalculator initialUsername={username} initialSkill={skill} />
    </main>
  );
}
