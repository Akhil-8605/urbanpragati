import './DeptStatsCard.css';

export default function DeptStatsCard({ dept }) {
  const { name, icon, total, pending, inProgress, resolved, color } = dept;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return (
    <article className="dept-stats-card card" style={{ '--dept-color': color }}>
      <div className="dsc-header">
        <div className="dsc-icon-wrap" aria-hidden="true">
          {icon}
        </div>
        <div className="dsc-name-wrap">
          <h3 className="dsc-name">{name}</h3>
          <span className="dsc-total">{total} total</span>
        </div>
      </div>

      <div className="dsc-stats-grid">
        <div className="dsc-stat pending">
          <span className="dsc-stat-num">{pending}</span>
          <span className="dsc-stat-label">Pending</span>
        </div>
        <div className="dsc-stat in-progress">
          <span className="dsc-stat-num">{inProgress}</span>
          <span className="dsc-stat-label">In Progress</span>
        </div>
        <div className="dsc-stat resolved">
          <span className="dsc-stat-num">{resolved}</span>
          <span className="dsc-stat-label">Resolved</span>
        </div>
      </div>

      <div className="dsc-progress-wrap">
        <div className="dsc-progress-bar" aria-label={`${resolvedPct}% resolved`}>
          <div className="dsc-progress-fill" style={{ width: `${resolvedPct}%` }} />
        </div>
        <span className="dsc-progress-pct">{resolvedPct}% resolved</span>
      </div>
    </article>
  );
}
