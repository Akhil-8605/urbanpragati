import { useState, useEffect } from 'react';
import './FeedbackMgmt.css';
import AdminNavbar from '../components/AdminNavbar';
import { getFeedbacksByDepartment } from '../../firebaseOperations/db';
import { getAdminDepartmentFromEmail } from '../../firebaseOperations/auth';
function StarRating({ rating }) {
  return (
    <span className="star-rating" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star star--filled' : 'star'} aria-hidden="true">★</span>
      ))}
    </span>
  );
}
export default function FeedbackMgmt() {
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalFeedbacks: 0 });
  const [ratingCounts, setRatingCounts] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = require('react-router-dom').useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role === 'admin' && userData.department && userData.department !== 'Feedback') {
      navigate('/admin');
    } else {
      fetchData();
    }
  }, [navigate]);
  const fetchData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const adminDept = userData.department || getAdminDepartmentFromEmail(userData.email || '');
      
      const data = await getFeedbacksByDepartment(adminDept);
      const mappedFeedbacks = data.map(f => {
        const dateStr = f.createdAt?.toDate ? f.createdAt.toDate().toLocaleDateString() : 'Unknown Date';
        return {
          id: f.id.slice(-6).toUpperCase(),
          citizen: f.userName || 'Anonymous',
          rating: f.rating || 5,
          comment: f.comments || f.comment || '',
          date: dateStr,
          dept: f.department || 'General'
        };
      });
      const totalFeedbacks = mappedFeedbacks.length;
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sum = 0;
      mappedFeedbacks.forEach(f => {
        counts[f.rating] = (counts[f.rating] || 0) + 1;
        sum += f.rating;
      });
      const avg = totalFeedbacks > 0 ? (sum / totalFeedbacks).toFixed(1) : 0;

      setStats({ averageRating: avg, totalFeedbacks: totalFeedbacks });
      setRatingCounts(counts);
      setFeedbacksList(mappedFeedbacks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="admin-layout" style={{ gridTemplateColumns: '1fr' }}>
      <div className="admin-main">
        <AdminNavbar />
        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <p className="breadcrumb">Admin &rsaquo; Feedback Management</p>
              <h1 className="admin-page-title">Feedback Management</h1>
            </div>
            <button className="btn btn-secondary">Export CSV</button>
          </div>
          <div className="fb-rating-overview">
            <div className="fb-avg-card">
              <span className="fb-avg-num">{Number(stats.averageRating).toFixed(1)}</span>
              <StarRating rating={Math.round(stats.averageRating)} />
              <span className="fb-avg-label">Average Rating</span>
              <span className="fb-avg-total">Based on {stats.totalFeedbacks} feedbacks</span>
            </div>
            <div className="fb-bar-section">
              {[5, 4, 3, 2, 1].map((r) => {
                const count = ratingCounts[r] || 0;
                const percent = stats.totalFeedbacks > 0 ? (count / stats.totalFeedbacks) * 100 : 0;
                return (
                  <div key={r} className="fb-bar-row">
                    <span className="fb-bar-label">{r} star</span>
                    <div className="fb-bar-track">
                      <div className="fb-bar-fill" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="fb-bar-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <section aria-labelledby="fb-list-heading">
            <h2 className="section-heading" id="fb-list-heading">All Feedbacks</h2>
            <div className="fb-list">
              {loading && <p>Loading feedbacks...</p>}
              {!loading && feedbacksList.length === 0 && <p>No feedbacks available.</p>}
              {!loading && feedbacksList.map((f) => (
                <div key={f.id} className="fb-item">
                  <div className="fb-item-header">
                    <div className="fb-avatar" aria-hidden="true">{f.citizen.charAt(0)}</div>
                    <div>
                      <p className="fb-citizen">{f.citizen}</p>
                      <p className="fb-meta">{f.date} &bull; {f.dept}</p>
                    </div>
                    <div className="fb-item-rating">
                      <StarRating rating={f.rating} />
                    </div>
                  </div>
                  <p className="fb-comment">"{f.comment}"</p>
                  <div className="fb-item-actions">
                    <button className="btn-table-action">Mark Featured</button>
                    <button className="btn-table-action btn-table-action--danger">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
