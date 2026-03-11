import React, { useState, useEffect } from 'react';
import './BestCitizen.css';
import CitizenNavbar from '../components/CitizenNavbar';
import CitizenFooter from '../components/CitizenFooter';
import LeaderboardCard from '../components/LeaderboardCard';
import { getTopCitizens } from '../../firebaseOperations/db';

const POINT_RULES = [
  { pts: '+10 pts', label: 'Submitting a new complaint', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { pts: '+50 pts', label: 'Complaint verified by admin', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg> },
  { pts: '+20 pts', label: 'Complaint resolved successfully', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { pts: '+5 pts', label: 'Submitting feedback or voting', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" /></svg> },
  { pts: '+2 pts', label: 'Voting on development proposals', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22" aria-hidden="true"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
];

export default function BestCitizen() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getTopCitizens();
        setCitizens(data);
      } catch (err) {
        console.error('[BestCitizen] fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const topCitizen = citizens[0] || null;
  const rest = citizens.slice(1);

  const currentUserRank = currentUser?.uid
    ? citizens.findIndex(c => c.uid === currentUser.uid) + 1
    : 0;

  const totalParticipants = citizens.length;
  const totalComplaints = citizens.reduce((s, c) => s + (c.totalComplaints || 0), 0);
  const totalResolved = citizens.reduce((s, c) => s + (c.resolvedComplaints || 0), 0);
  const cities = [...new Set(citizens.map(c => c.city).filter(Boolean))].length;

  const monthYear = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="best-citizen-page">
      <CitizenNavbar />

      <main className="best-citizen-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/citizen-dashboard">Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>Best Citizen</span>
        </nav>

        <header className="bc-page-header">
          <h1>Best Citizen of the Month</h1>
          <p>Recognising active citizens who contribute the most to improving urban services through verified complaint reporting.</p>
        </header>

        {/* Stats bar — computed from real data */}
        <div className="bc-stats-bar">
          <div className="bc-stat-card">
            <span className="bc-stat-num">{loading ? '...' : totalParticipants.toLocaleString()}</span>
            <span className="bc-stat-label">Total Participants</span>
          </div>
          <div className="bc-stat-card">
            <span className="bc-stat-num">{loading ? '...' : totalComplaints.toLocaleString()}</span>
            <span className="bc-stat-label">Complaints Filed</span>
          </div>
          <div className="bc-stat-card">
            <span className="bc-stat-num">{loading ? '...' : totalResolved.toLocaleString()}</span>
            <span className="bc-stat-label">Verified Reports</span>
          </div>
          <div className="bc-stat-card">
            <span className="bc-stat-num">{loading ? '...' : (cities || 0)}</span>
            <span className="bc-stat-label">Cities Covered</span>
          </div>
        </div>

        {/* Your rank callout (if logged in and ranked) */}
        {!loading && currentUserRank > 0 && (
          <div className="bc-your-rank-banner" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            You are currently ranked <strong>#{currentUserRank}</strong> with <strong>{currentUser.points || currentUser.rewardPoints || 0} Pragati Points</strong>
          </div>
        )}

        {loading ? (
          <div className="bc-loading" role="status">Loading leaderboard...</div>
        ) : citizens.length === 0 ? (
          <div className="bc-empty">No citizens on the leaderboard yet. Be the first to earn points!</div>
        ) : (
          <>
            {/* Top citizen hero */}
            {topCitizen && (
              <section className="best-citizen-hero card" aria-labelledby="best-citizen-title">
                <div className="bch-trophy" aria-hidden="true">
                  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" width="80" height="80">
                    <circle cx="40" cy="40" r="38" fill="#FF6F00" opacity="0.1" stroke="#FF6F00" strokeWidth="2" />
                    <path d="M28 20h24v20a12 12 0 01-24 0V20z" fill="#FF6F00" opacity="0.3" stroke="#FF6F00" strokeWidth="2" />
                    <path d="M20 20h8M52 20h8" stroke="#FF6F00" strokeWidth="2" strokeLinecap="round" />
                    <path d="M20 20c0 10 8 16 8 16M60 20c0 10-8 16-8 16" stroke="#FF6F00" strokeWidth="2" strokeLinecap="round" />
                    <line x1="40" y1="52" x2="40" y2="62" stroke="#FF6F00" strokeWidth="2" />
                    <rect x="30" y="62" width="20" height="4" rx="2" fill="#FF6F00" opacity="0.5" stroke="#FF6F00" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="bch-badge" aria-label="Best Citizen of the Month">
                  <span className="bch-month">{monthYear}</span>
                </div>
                <div className="bch-avatar" aria-hidden="true">
                  {topCitizen.displayName ? topCitizen.displayName.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="bch-crown" aria-hidden="true">
                  <svg viewBox="0 0 40 20" fill="#FF6F00" width="40" height="20">
                    <path d="M0 20L8 2L20 14L32 2L40 20H0z" />
                  </svg>
                </div>
                <h2 id="best-citizen-title" className="bch-name">
                  {topCitizen.displayName || topCitizen.name || 'Top Citizen'}
                </h2>
                <p className="bch-city">{topCitizen.city || 'India'}</p>
                <div className="bch-stats">
                  <div className="bch-stat">
                    <span className="bch-stat-num">{(topCitizen.points || topCitizen.rewardPoints || 0).toLocaleString()}</span>
                    <span className="bch-stat-label">Points</span>
                  </div>
                  <div className="bch-stat-divider" aria-hidden="true" />
                  <div className="bch-stat">
                    <span className="bch-stat-num">{topCitizen.totalComplaints || 0}</span>
                    <span className="bch-stat-label">Complaints</span>
                  </div>
                  <div className="bch-stat-divider" aria-hidden="true" />
                  <div className="bch-stat">
                    <span className="bch-stat-num">{topCitizen.resolvedComplaints || 0}</span>
                    <span className="bch-stat-label">Resolved</span>
                  </div>
                </div>
                <div className="bch-badges">
                  {(topCitizen.points || topCitizen.rewardPoints || 0) >= 500 && <span className="bch-badge-chip">Top Contributor</span>}
                  {(topCitizen.totalComplaints || 0) >= 10 && <span className="bch-badge-chip">Quick Reporter</span>}
                  <span className="bch-badge-chip">Verified Citizen</span>
                </div>
              </section>
            )}

            {/* Full leaderboard */}
            {rest.length > 0 && (
              <section className="leaderboard-section">
                <h2 className="section-heading">Full Leaderboard — {monthYear}</h2>
                <div className="leaderboard-list">
                  {rest.map((c, i) => (
                    <LeaderboardCard
                      key={c.uid || i}
                      rank={i + 2}
                      entry={{
                        name: c.displayName || c.name || 'Citizen',
                        city: c.city || 'India',
                        points: c.points || c.rewardPoints || 0,
                        complaints: c.totalComplaints || 0,
                        verified: c.resolvedComplaints || 0,
                        avatar: c.photoURL || null,
                      }}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Points info */}
        <section className="points-info card">
          <h2>How Points Are Earned</h2>
          <div className="points-grid">
            {POINT_RULES.map(rule => (
              <div className="points-item" key={rule.pts}>
                <span className="points-icon" aria-hidden="true">{rule.icon}</span>
                <div>
                  <strong>{rule.pts}</strong>
                  <p>{rule.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CitizenFooter />
    </div>
  );
}
