'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

export default function XpHistoryChart({ username, skill }) {
  const [range, setRange] = useState('month');
  const [metric, setMetric] = useState('xp');
  const [chartType, setChartType] = useState('auto');
  const [selectedSkill, setSelectedSkill] = useState(skill || 'Attack');
  const [data, setData] = useState([]);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3000';
  const formatLocal = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const bucketHours = {
    day: 5 / 60,
    week: 1,
    month: 6,
    year: 24,
    lifetime: 24 * 7
  };

  const skillOptions = [
    'Attack',
    'Strength',
    'Defence',
    'Ranged',
    'Prayer',
    'Magic',
    'Runecraft',
    'Hitpoints',
    'Crafting',
    'Mining',
    'Smithing',
    'Fishing',
    'Cooking',
    'Firemaking',
    'Woodcutting',
    'Agility',
    'Herblore',
    'Thieving',
    'Fletching',
    'Slayer',
    'Farming',
    'Construction',
    'Hunter',
    'Sailing'
  ];

  useEffect(() => {
    fetch(`${apiBase}/profile/${username}/xp-history/${selectedSkill}?range=${range}`)
      .then((r) => r.json())
      .then(setData);
  }, [apiBase, username, selectedSkill, range]);

  const totalXp = data.reduce((sum, row) => sum + Number(row.xp || 0), 0);
  const bucket = bucketHours[range] || 1;
  const avgXpHr = totalXp > 0 ? totalXp / (data.length * bucket) : 0;
  const chartData = data.map((row) => ({
    ...row,
    value: metric === 'xp' ? Number(row.xp || 0) : Number(row.xp || 0) / bucket
  }));

  const useBars = chartType === 'bar' || (chartType === 'auto' && (range === 'week' || range === 'month'));

  return (
    <div className="chart-shell">
      <div className="chart-header">
        <div className="chart-controls">
          <select
            className="select"
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
          >
            {skillOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="toggle">
            <button
              className={`toggle-btn ${metric === 'xp' ? 'active' : ''}`}
              onClick={() => setMetric('xp')}
            >
              XP gained
            </button>
            <button
              className={`toggle-btn ${metric === 'xphr' ? 'active' : ''}`}
              onClick={() => setMetric('xphr')}
            >
              XP / hr
            </button>
          </div>
          <div className="toggle">
            <button
              className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              Line
            </button>
            <button
              className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
            >
              Bars
            </button>
            <button
              className={`toggle-btn ${chartType === 'auto' ? 'active' : ''}`}
              onClick={() => setChartType('auto')}
            >
              Auto
            </button>
          </div>
        </div>
        <div className="range-buttons">
          {['day', 'week', 'month', 'year', 'lifetime'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`range-button ${range === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-summary">
        <div className="pill">+{totalXp.toLocaleString()} XP</div>
        <span className="mono">
          Avg {Math.round(avgXpHr).toLocaleString()} XP/hr
        </span>
      </div>

      <div style={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          {useBars ? (
            <BarChart data={chartData}>
              <CartesianGrid stroke="rgba(36, 48, 67, 0.35)" vertical={false} />
              <XAxis dataKey="time" tickFormatter={formatLocal} />
              <YAxis />
              <Tooltip
                labelFormatter={formatLocal}
                formatter={(value) => [Number(value).toLocaleString(), metric === 'xp' ? 'XP' : 'XP/hr']}
                cursor={{ fill: 'rgba(0, 0, 0, 0)' }}
                contentStyle={{
                  background: 'rgba(10, 14, 20, 0.96)',
                  border: '1px solid rgba(58, 79, 112, 0.7)',
                  borderRadius: '10px',
                  color: '#edf2fa',
                  fontSize: '13px'
                }}
                labelStyle={{
                  color: '#edf2fa',
                  fontWeight: 600
                }}
              />
              <Bar dataKey="value" fill="#2bf2b4" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid stroke="rgba(36, 48, 67, 0.35)" vertical={false} />
              <XAxis dataKey="time" tickFormatter={formatLocal} />
              <YAxis />
              <Tooltip
                labelFormatter={formatLocal}
                formatter={(value) => [Number(value).toLocaleString(), metric === 'xp' ? 'XP' : 'XP/hr']}
                cursor={{ fill: 'rgba(0, 0, 0, 0)' }}
                contentStyle={{
                  background: 'rgba(10, 14, 20, 0.96)',
                  border: '1px solid rgba(58, 79, 112, 0.7)',
                  borderRadius: '10px',
                  color: '#edf2fa',
                  fontSize: '13px'
                }}
                labelStyle={{
                  color: '#edf2fa',
                  fontWeight: 600
                }}
              />
              <Line dataKey="value" stroke="#2bf2b4" strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
