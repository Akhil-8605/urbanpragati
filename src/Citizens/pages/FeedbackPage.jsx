import React, { useState, useEffect } from 'react';
import './FeedbackPage.css';
import CitizenNavbar from '../components/CitizenNavbar';
import CitizenFooter from '../components/CitizenFooter';
import { submitFeedback, getAllFeedbacks } from '../../firebaseOperations/db';
import { addCitizenPoints } from '../../firebaseOperations/auth';

const DEPARTMENTS = ['Water Dept', 'Electricity', 'Sanitation', 'Property tax', 'Road Repair', 'Development'];

const EMPTY_FORM = { name: '', department: '', comment: '', rating: 0 };

function StarRating({ value, size = 'md', interactive = false, onChange }) {
  const [hovered, setHovered] = useState(0);
  const px = size === 'lg' ? 28 : size === 'sm' ? 14 : 18;
  const active = interactive ? (hovered || value) : value;

  return (
    <div
      className={`star-rating star-${size}`}
      aria-label={interactive ? `Select rating, currently ${value} of 5 stars` : `${value} out of 5 stars`}
      role={interactive ? 'radiogroup' : undefined}
    >
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type={interactive ? 'button' : undefined}
          className={`star-btn${interactive ? ' interactive' : ''}`}
          tabIndex={interactive ? 0 : -1}
          aria-label={interactive ? `${s} star${s > 1 ? 's' : ''}` : undefined}
          aria-pressed={interactive ? s === value : undefined}
          onClick={interactive && onChange ? () => onChange(s) : undefined}
          onMouseEnter={interactive ? () => setHovered(s) : undefined}
          onMouseLeave={interactive ? () => setHovered(0) : undefined}
          style={{ background: 'none', border: 'none', padding: '2px', cursor: interactive ? 'pointer' : 'default' }}
        >
          <svg
            viewBox="0 0 20 20"
            fill={s <= active ? '#FF6F00' : '#e2e8f0'}
            width={px}
            height={px}
            style={{ transition: 'fill 0.12s', display: 'block' }}
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function timeAgo(seconds) {
  if (!seconds) return '';
  const diff = Math.floor(Date.now() / 1000 - seconds);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = new Date(seconds * 1000);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name = '') {
  return name.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?';
}

function computeOverall(feedbacks) {
  if (!feedbacks.length) return { score: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };
  const counts = [0, 0, 0, 0, 0];
  let sum = 0;
  feedbacks.forEach(f => {
    const r = Math.min(5, Math.max(1, Math.round(f.rating || 0)));
    counts[r - 1]++;
    sum += r;
  });
  const total = feedbacks.length;
  const breakdown = [5, 4, 3, 2, 1].map(s => Math.round((counts[s - 1] / total) * 100));
  return { score: (sum / total).toFixed(1), total, breakdown };
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Pre-fill name from logged-in user
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const u = JSON.parse(stored);
      setForm(f => ({ ...f, name: u.displayName || u.name || '' }));
    }
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const data = await getAllFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error('[FeedbackPage] load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setSubmitError('Please enter your name.'); return; }
    if (!form.rating) { setSubmitError('Please select a star rating.'); return; }
    if (!form.comment.trim()) { setSubmitError('Please write your feedback.'); return; }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const stored = localStorage.getItem('userData');
      const user = stored ? JSON.parse(stored) : {};

      await submitFeedback({
        name: form.name.trim(),
        department: form.department,
        rating: form.rating,
        comment: form.comment.trim(),
        userId: user.uid || null,
        userEmail: user.email || null,
      });

      // Award 5 points for submitting feedback
      if (user.uid) {
        await addCitizenPoints(user.uid, 5);
        localStorage.setItem('userData', JSON.stringify({
          ...user,
          rewardPoints: (user.rewardPoints || 0) + 5,
        }));
      }

      setSubmitSuccess('Feedback submitted! +5 Pragati Points earned.');
      setForm(f => ({ ...EMPTY_FORM, name: f.name }));
      loadFeedbacks();
      setTimeout(() => setSubmitSuccess(''), 4000);
    } catch (err) {
      console.error('[FeedbackPage] submit error:', err);
      setSubmitError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const { score, total, breakdown } = computeOverall(feedbacks);

  return (
    <div className="feedback-page">
      <CitizenNavbar />

      <main className="feedback-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/citizen-dashboard">Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>Citizen Feedback</span>
        </nav>

        <header className="feedback-header">
          <h1>Citizen Feedback Portal</h1>
          <p>Share your experience with municipal services. Your feedback drives improvement across all departments.</p>
        </header>

        <div className="feedback-layout">
          {/* Feed */}
          <section className="feedback-feed-col">
            <h2 className="section-heading">
              Recent Feedback
              {total > 0 && (
                <span className="feedback-count-badge">{total} review{total !== 1 ? 's' : ''}</span>
              )}
            </h2>

            <div className="feedback-list">
              {loading ? (
                <div className="feedback-skeleton-list">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="feedback-skeleton card" aria-hidden="true">
                      <div className="skel-avatar" />
                      <div className="skel-lines">
                        <div className="skel-line w60" />
                        <div className="skel-line w40" />
                        <div className="skel-line w80" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="feedback-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  <p>No feedback yet. Be the first to share your experience!</p>
                </div>
              ) : (
                feedbacks.map(f => (
                  <article className="card feedback-card" key={f.id}>
                    <div className="feedback-card-top">
                      <div className="feedback-avatar" style={{ background: `hsl(${(f.name?.charCodeAt(0) || 0) * 37 % 360}, 55%, 55%)` }} aria-hidden="true">
                        {getInitials(f.name)}
                      </div>
                      <div className="feedback-meta">
                        <span className="feedback-name">{f.name || 'Anonymous'}</span>
                        <span className="feedback-date">{timeAgo(f.createdAt?.seconds)}</span>
                      </div>
                      <span className="feedback-dept-chip">{f.department}</span>
                    </div>
                    <div className="feedback-stars-row">
                      <StarRating value={f.rating} />
                      <span className="feedback-rating-text">{f.rating}/5</span>
                    </div>
                    <p className="feedback-comment">{f.comment}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          {/* Sidebar */}
          <aside className="feedback-sidebar">
            {/* Overall Rating */}
            <div className="card rating-overview-card">
              <h2>Overall Rating</h2>
              {total === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>No reviews yet.</p>
              ) : (
                <>
                  <div className="rating-big">
                    <span className="rating-big-num">{score}</span>
                    <div>
                      <StarRating value={Math.round(Number(score))} size="lg" />
                      <p className="rating-total">Based on {total.toLocaleString()} review{total !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="rating-breakdown">
                    {breakdown.map((pct, i) => (
                      <div className="rb-row" key={i}>
                        <span className="rb-label">{5 - i} star</span>
                        <div className="rb-bar-wrap" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
                          <div className="rb-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="rb-pct">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Submit Feedback */}
            <div className="card submit-feedback-card">
              <h2>Submit Your Feedback</h2>
              <p>Rate your recent experience. You earn <strong>+5 Pragati Points</strong> per submission.</p>

              <form className="feedback-form" onSubmit={handleSubmit} aria-label="Submit feedback form" noValidate>
                {submitError && (
                  <div className="form-error-box" role="alert" style={{ marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    {submitError}
                  </div>
                )}
                {submitSuccess && (
                  <div className="form-success-box" role="status" style={{ marginBottom: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    {submitSuccess}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="fb-name" className="form-label">Your Name *</label>
                  <input
                    id="fb-name"
                    type="text"
                    className="form-input"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fb-dept" className="form-label">Department (Optional)</label>
                  <select
                    id="fb-dept"
                    className="form-select"
                    value={form.department}
                    onChange={e => setForm({ ...form, department: e.target.value })}
                  >
                    <option value="">-- Select Department --</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Rating *</label>
                  <div style={{ paddingTop: 4 }}>
                    <StarRating
                      value={form.rating}
                      size="lg"
                      interactive
                      onChange={r => setForm({ ...form, rating: r })}
                    />
                    {form.rating > 0 && (
                      <p className="feedback-rating-selected">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fb-comment" className="form-label">Your Feedback *</label>
                  <textarea
                    id="fb-comment"
                    className="form-textarea"
                    rows={4}
                    placeholder="Share your experience with the service..."
                    value={form.comment}
                    onChange={e => setForm({ ...form, comment: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
                  {submitting ? (
                    <><span className="btn-spinner" aria-hidden="true" />Submitting...</>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>

      <CitizenFooter />
    </div>
  );
}
