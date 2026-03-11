import './ComplaintDetailCard.css';

const statusColors = {
  Pending: 'chip-pending',
  'In Progress': 'chip-inprogress',
  Resolved: 'chip-resolved',
  Rejected: 'chip-rejected',
};

export default function ComplaintDetailCard({ complaint, isSelected, onClick }) {
  const c = complaint || {
    id: 'CMP-1042',
    title: 'Broken Water Pipeline',
    citizen: 'Ramesh Sharma',
    location: 'Sector 14, Noida',
    date: '12 Mar 2025',
    status: 'Pending',
    dept: 'Water',
    priority: 'High',
  };

  return (
    <article
      className={`cdc-card ${isSelected ? 'cdc-card--selected' : ''}`}
      onClick={onClick}
      tabIndex={0}
      aria-label={`Complaint: ${c.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
    >
      <div className="cdc-header">
        <div>
          <span className="cdc-id">{c.id}</span>
          <h3 className="cdc-title">{c.title}</h3>
        </div>
        <span className={`chip ${statusColors[c.status] || 'chip-pending'}`}>{c.status}</span>
      </div>
      <div className="cdc-meta">
        <span className="cdc-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {c.citizen}
        </span>
        <span className="cdc-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {c.location}
        </span>
        <span className="cdc-meta-item">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {c.date}
        </span>
      </div>
      <div className="cdc-footer">
        <span className={`cdc-priority cdc-priority--${c.priority?.toLowerCase()}`}>{c.priority} Priority</span>
        <span className="cdc-dept">{c.dept} Dept.</span>
      </div>
    </article>
  );
}
