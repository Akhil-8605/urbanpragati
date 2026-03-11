import React from 'react';
import './ComplaintCard.css';

const statusConfig = {
  Pending:     { cls: 'chip-pending',    dot: '#F59E0B' },
  'In Progress': { cls: 'chip-inprogress', dot: '#3B82F6' },
  Resolved:    { cls: 'chip-resolved',   dot: '#10B981' },
  Rejected:    { cls: 'chip-rejected',   dot: '#EF4444' },
};

function ComplaintCard({ complaint, compact }) {
  const {
    id = 'C-001',
    title = 'Water Pipe Leakage',
    location = 'Sector 9, Block C',
    date = '12 Jan 2025',
    status = 'Pending',
    dept = 'Water Dept.',
    imageUrl,
    description = 'Large pipe burst causing flooding on street.',
    onView,
  } = complaint || {};

  const sConf = statusConfig[status] || statusConfig['Pending'];

  return (
    <article className={`complaint-card ${compact ? 'complaint-card--compact' : ''}`} aria-label={`Complaint: ${title}`}>
      {!compact && (
        <div className="complaint-card__thumb" aria-hidden="true">
          {imageUrl
            ? <img src={imageUrl} alt={title} loading="lazy" />
            : (
              <div className="complaint-card__thumb-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
            )
          }
        </div>
      )}

      <div className="complaint-card__body">
        <div className="complaint-card__meta">
          <span className={`chip ${sConf.cls}`}>
            <span className="chip-dot" style={{ background: sConf.dot }} aria-hidden="true" />
            {status}
          </span>
          <span className="complaint-card__dept">{dept}</span>
        </div>

        <h4 className="complaint-card__title">{title}</h4>
        {!compact && <p className="complaint-card__desc">{description}</p>}

        <div className="complaint-card__footer">
          <div className="complaint-card__info">
            <span className="complaint-card__loc">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {location}
            </span>
            <span className="complaint-card__date">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {date}
            </span>
          </div>
          <span className="complaint-card__id">#{id}</span>
        </div>
      </div>

      <button
        className="complaint-card__view btn btn-outline btn-sm"
        onClick={onView}
        aria-label={`View complaint ${id}: ${title}`}
      >
        View
      </button>
    </article>
  );
}

export default ComplaintCard;
