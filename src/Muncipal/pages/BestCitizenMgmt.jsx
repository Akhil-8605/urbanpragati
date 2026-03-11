import './BestCitizenMgmt.css';
import AdminNavbar from '../components/AdminNavbar';
import { useState, useEffect } from 'react';
import { getTopCitizens } from '../../firebaseOperations/db';
const badgeClass = { Platinum: 'badge-platinum', Gold: 'badge-gold', Silver: 'badge-silver', Bronze: 'badge-bronze' };
export default function BestCitizenMgmt() {
  const [citizensList, setCitizensList] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = require('react-router-dom').useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role === 'admin' && userData.department && userData.department !== 'Best Citizen') {
      navigate('/admin');
    } else {
      fetchData();
    }
  }, [navigate]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getTopCitizens();
      const mapped = data.map((c, i) => ({
        ...c,
        rank: i + 1,
        name: c.name || 'Citizen User',
        city: c.city || 'Unknown City',
        points: c.points || 0,
        complaints: c.complaints || 0,
        verified: c.verified || 0,
        badge: c.badge || 'Bronze'
      }));
      setCitizensList(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const top = citizensList.length > 0 ? citizensList[0] : null;
  return (
    <div className="admin-layout" style={{ gridTemplateColumns: '1fr' }}>
      <div className="admin-main">
        <AdminNavbar />
        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <p className="breadcrumb">Admin &rsaquo; Best Citizen Management</p>
              <h1 className="admin-page-title">Best Citizen Management</h1>
            </div>
            <button className="btn btn-primary">Announce Winner</button>
          </div>
          {top && (
            <div className="bcm-spotlight">
              <div className="bcm-trophy" aria-hidden="true">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
              </div>
              <div className="bcm-spotlight-info">
                <span className="bcm-spotlight-label">Best Citizen of the Month</span>
                <h2 className="bcm-spotlight-name">{top.name}</h2>
                <p className="bcm-spotlight-city">{top.city} &bull; {top.complaints} Complaints Filed &bull; {top.verified} Verified</p>
                <div className="bcm-spotlight-badges">
                  <span className={`citizen-badge ${badgeClass[top.badge] || 'badge-bronze'}`}>{top.badge}</span>
                  <span className="bcm-points">{top.points} pts</span>
                </div>
              </div>
              <div className="bcm-spotlight-actions">
                <button className="btn btn-primary">Send Certificate</button>
                <button className="btn btn-secondary">View Profile</button>
              </div>
            </div>
          )}
          <section aria-labelledby="bcm-table-heading" className="admin-table-section">
            <h2 className="section-heading" id="bcm-table-heading">Citizen Leaderboard</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table" aria-label="Citizen leaderboard">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Citizen</th>
                    <th>City</th>
                    <th>Points</th>
                    <th>Complaints Filed</th>
                    <th>Verified</th>
                    <th>Badge</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading Leaderboard...</td></tr>}
                  {!loading && citizensList.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No citizens found.</td></tr>}
                  {!loading && citizensList.map((c) => (
                    <tr key={c.rank} className={c.rank === 1 ? 'table-row--top' : ''}>
                      <td><span className={`rank-badge ${c.rank <= 3 ? 'rank-badge--top' : ''}`}>#{c.rank}</span></td>
                      <td>
                        <div className="table-citizen-cell">
                          <div className="fb-avatar fb-avatar--sm" aria-hidden="true">{c.name.charAt(0)}</div>
                          {c.name}
                        </div>
                      </td>
                      <td>{c.city}</td>
                      <td><strong>{c.points}</strong></td>
                      <td>{c.complaints}</td>
                      <td>{c.verified}</td>
                      <td><span className={`citizen-badge ${badgeClass[c.badge]}`}>{c.badge}</span></td>
                      <td><button className="btn-table-action">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
