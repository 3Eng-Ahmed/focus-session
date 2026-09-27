// src/components/Dashboard.jsx
import { useEffect, useState } from 'react';
import { THEMES } from '../data/themes';
import { getAllStats, clearAllStats, formatDuration } from '../utils/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    setStats(getAllStats());
  }, []);

  const rows = THEMES.map((theme) => ({
    id: theme.id,
    name: theme.name,
    seconds: stats[theme.id]?.totalSeconds || 0,
  }));

  const totalSeconds = rows.reduce((sum, row) => sum + row.seconds, 0);
  const maxSeconds = Math.max(1, ...rows.map((row) => row.seconds));

  const handleReset = () => {
    const confirmed = window.confirm('Clear all recorded focus time? This cannot be undone.');
    if (!confirmed) return;
    clearAllStats();
    setStats({});
  };

  return (
    <section className="dashboard" aria-labelledby="dashboard-heading">
      <div className="dashboard__header">
        <h2 id="dashboard-heading" className="dashboard__title">Focus time</h2>
        <p className="dashboard__total">
          {totalSeconds > 0 ? formatDuration(totalSeconds) : 'No sessions logged yet'}
        </p>
      </div>

      <ul className="dashboard__list">
        {rows.map((row) => (
          <li
            key={row.id}
            className="dashboard__row"
            style={{ '--row-fill': `${Math.round((row.seconds / maxSeconds) * 100)}%` }}
          >
            <span className="dashboard__row-name">{row.name}</span>
            <span className="dashboard__row-time">
              {row.seconds > 0 ? formatDuration(row.seconds) : 'Not started'}
            </span>
          </li>
        ))}
      </ul>

      {totalSeconds > 0 && (
        <button
          type="button"
          className="dashboard__reset"
          onClick={handleReset}
          aria-label="Reset all recorded focus time"
        >
          Reset stats
        </button>
      )}
    </section>
  );
}