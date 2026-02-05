'use client';

import { useMemo, useState } from 'react';
import SkillsSummaryTable from '@/components/SkillsSummaryTable';
import XpHistoryChart from '@/components/XpHistoryChart';

export default function SkillsOverviewPanel({ rows, username }) {
  const skillList = useMemo(
    () => rows?.map((row) => row.skill).filter(Boolean) || [],
    [rows]
  );
  const [selectedSkill, setSelectedSkill] = useState(
    skillList[0] || 'Attack'
  );

  return (
    <div className="grid grid-2">
      <section className="section skills-panel">
        <div className="stat-row" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>Skills overview</h2>
        </div>
        <SkillsSummaryTable
          rows={rows || []}
          selectedSkill={selectedSkill}
          onSelect={setSelectedSkill}
        />
      </section>

      <section className="section">
        <h2>{selectedSkill} XP history</h2>
        <XpHistoryChart username={username} skill={selectedSkill} />
      </section>
    </div>
  );
}
