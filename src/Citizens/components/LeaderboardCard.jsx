import React from 'react';
import './LeaderboardCard.css';

const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

function LeaderboardCard({ entry, rank }) {
  const {
    name = 'Ramesh Kumar',
    city = 'New Delhi',
    points = 1240,
    complaints = 34,
    verified = 28,
    avatar,
  } = entry || {};

  const medal = rank <= 3 ? rankColors[rank - 1] : null;

  return (
    <article
      className={`lb-card ${rank <= 3 ? 'lb-card--top' : ''}`}
      aria-label={`Rank ${rank}: ${name}`}
    >
      <div
        className="lb-card__rank"
        style={{ background: medal || 'var(--color-gray-100)', color: medal ? 'var(--color-gray-800)' : 'var(--color-text-secondary)' }}
        aria-label={`Rank ${rank}`}
      >
        {rank <= 3 ? (rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉') : rank}
      </div>

      <div className="lb-card__avatar-wrap">
        {avatar
          ? <img src={avatar} alt={name} className="lb-card__avatar avatar" />
          : (
            <div className="lb-card__avatar-placeholder avatar" aria-hidden="true">
              {name.charAt(0).toUpperCase()}
            </div>
          )
        }
        {rank <= 3 && <div className="lb-card__crown" aria-hidden="true" />}
      </div>

      <div className="lb-card__info">
        <span className="lb-card__name">{name}</span>
        <span className="lb-card__city">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {city}
        </span>
      </div>

      <div className="lb-card__stats">
        <div className="lb-card__stat">
          <span className="lb-card__stat-num" style={{ color: 'var(--color-saffron)' }}>{points.toLocaleString()}</span>
          <span className="lb-card__stat-label">Points</span>
        </div>
        <div className="lb-card__stat">
          <span className="lb-card__stat-num">{complaints}</span>
          <span className="lb-card__stat-label">Complaints</span>
        </div>
        <div className="lb-card__stat">
          <span className="lb-card__stat-num" style={{ color: 'var(--color-resolved)' }}>{verified}</span>
          <span className="lb-card__stat-label">Verified</span>
        </div>
      </div>

      <div className="lb-card__bar-wrap" aria-label={`${points} points`}>
        <div
          className="lb-card__bar"
          style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }}
        />
      </div>
    </article>
  );
}

export default LeaderboardCard;
