import React from 'react';
import { Link } from 'react-router-dom';
import './ServiceCard.css';

function ServiceCard({ icon, title, description, to, color, stats }) {
  return (
    <article className="svc-card card" aria-label={title}>
      <div className="svc-card__icon-wrap" style={{ '--svc-color': color || 'var(--color-saffron)' }}>
        <span className="svc-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <div className="svc-card__body">
        <h3 className="svc-card__title">{title}</h3>
        <p className="svc-card__desc">{description}</p>
        {stats && (
          <div className="svc-card__stats">
            {stats.map((s, i) => (
              <div key={i} className="svc-card__stat">
                <span className="svc-card__stat-num" style={{ color: color || 'var(--color-saffron)' }}>{s.value}</span>
                <span className="svc-card__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <a href={to || '#'} className="svc-card__cta btn btn-ghost btn-sm" style={{textDecoration: "null"}}>
        Request / Report
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </a>
    </article>
  );
}

export default ServiceCard;
