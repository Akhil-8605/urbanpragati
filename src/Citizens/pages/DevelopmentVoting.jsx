import React, { useState, useEffect } from 'react';
import './DevelopmentVoting.css';
import CitizenNavbar from '../components/CitizenNavbar';
import CitizenFooter from '../components/CitizenFooter';
import {
  getAllDevelopments,
  voteDevelopment,
  submitCitizenProposal,
  listenApprovedCitizenProposals,
} from '../../firebaseOperations/db';
import { addCitizenPoints } from '../../firebaseOperations/auth';

const CATEGORY_COLORS = {
  Recreation: '#006400',
  Education: '#0B5FFF',
  Infrastructure: '#FF6F00',
  Environment: '#10B981',
  Healthcare: '#EF4444',
  Transport: '#8B5CF6',
  Other: '#6B7280',
};

const CATEGORIES = ['Recreation', 'Education', 'Infrastructure', 'Environment', 'Healthcare', 'Transport', 'Other'];

const EMPTY_MODAL = { title: '', category: '', location: '', description: '', benefit: '' };

export default function DevelopmentVoting() {
  const [adminProposals, setAdminProposals] = useState([]);
  const [citizenProposals, setCitizenProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(EMPTY_MODAL);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [votingId, setVotingId] = useState(null);
  const [activeTab, setActiveTab] = useState('admin');

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    fetchAdminProposals();
    // Real-time listener for approved citizen proposals
    const unsub = listenApprovedCitizenProposals((data) => {
      setCitizenProposals(data);
    });
    return () => unsub();
  }, []);

  const fetchAdminProposals = async () => {
    setLoading(true);
    try {
      const data = await getAllDevelopments();
      setAdminProposals(data);
    } catch (err) {
      console.error('[DevelopmentVoting] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id, voteType, collection = 'admin') => {
    if (!currentUser?.uid) {
      alert('Please log in to vote.');
      return;
    }
    setVotingId(id);
    try {
      await voteDevelopment(id, currentUser.uid, voteType);
      await addCitizenPoints(currentUser.uid, 2);
      const updatedUser = { ...currentUser, rewardPoints: (currentUser.rewardPoints || 0) + 2 };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      // Refresh
      fetchAdminProposals();
    } catch (err) {
      console.error('[DevelopmentVoting] vote error:', err);
    } finally {
      setVotingId(null);
    }
  };

  const handleProposalSubmit = async (e) => {
    e.preventDefault();
    if (!modalData.title.trim()) { setModalError('Title is required.'); return; }
    if (!modalData.category) { setModalError('Category is required.'); return; }
    if (!modalData.description.trim()) { setModalError('Description is required.'); return; }

    setSubmitting(true); setModalError('');
    try {
      await submitCitizenProposal({
        title: modalData.title.trim(),
        category: modalData.category,
        location: modalData.location.trim(),
        description: modalData.description.trim(),
        benefit: modalData.benefit.trim(),
        submittedBy: currentUser?.uid || null,
        submittedByName: currentUser?.displayName || 'Anonymous',
        userEmail: currentUser?.email || null,
      });
      setModalSuccess('Your proposal has been submitted for admin review!');
      window.alert('Proposal submitted successfully! You will earn 20 Pragati Points if your proposal is approved.');
      setModalData(EMPTY_MODAL);
      setModalOpen(false); setModalSuccess('');
    } catch (err) {
      console.error('[DevelopmentVoting] proposal submit error:', err);
      setModalError('Failed to submit proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allProposals = activeTab === 'admin' ? adminProposals : citizenProposals;
  const totalVotes = adminProposals.reduce((acc, p) => acc + (p.interested_citizens?.length || 0) + (p.not_interested_citizens?.length || 0), 0);

  return (
    <div className="voting-page">
      <CitizenNavbar />

      <main className="voting-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/citizen-dashboard">Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>Development Proposals</span>
        </nav>

        <header className="voting-header">
          <div>
            <h1>Development Proposals</h1>
            <p>Vote on upcoming urban development projects. Your opinion shapes the future of your city.</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)} aria-haspopup="dialog">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
            </svg>
            Submit Proposal
          </button>
        </header>

        <div className="voting-stats-bar">
          <div className="voting-stat">
            <span className="vs-num">{adminProposals.length}</span>
            <span className="vs-label">Admin Proposals</span>
          </div>
          <div className="voting-stat">
            <span className="vs-num">{adminProposals.filter(p => p.status !== 'Completed').length}</span>
            <span className="vs-label">Active Voting</span>
          </div>
          <div className="voting-stat">
            <span className="vs-num">{totalVotes.toLocaleString()}</span>
            <span className="vs-label">Total Votes Cast</span>
          </div>
          <div className="voting-stat">
            <span className="vs-num">{citizenProposals.length}</span>
            <span className="vs-label">Citizen Proposals</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="voting-tabs">
          <button
            type="button"
            className={`voting-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            Admin Proposals
          </button>
          <button
            type="button"
            className={`voting-tab ${activeTab === 'citizen' ? 'active' : ''}`}
            onClick={() => setActiveTab('citizen')}
          >
            Citizen Proposals
          </button>
        </div>

        {loading ? (
          <div className="voting-loading">Loading proposals...</div>
        ) : allProposals.length === 0 ? (
          <div className="voting-empty">
            {activeTab === 'admin' ? 'No admin proposals yet. Check back soon.' : 'No approved citizen proposals yet.'}
          </div>
        ) : (
          <div className="proposals-grid">
            {allProposals.map((p) => {
              const interested = p.interested_citizens?.length || p.interested || 0;
              const notInterested = p.not_interested_citizens?.length || p.notInterested || 0;
              const total = interested + notInterested;
              const pct = total > 0 ? Math.round((interested / total) * 100) : 0;
              const color = CATEGORY_COLORS[p.category] || '#FF6F00';
              const userVoted = currentUser?.uid && p.interested_citizens?.includes(currentUser.uid);
              const isVoting = votingId === p.id;
              const isCompleted = p.status === 'Completed' || p.status === 'completed';

              return (
                <article className="proposal-card card" key={p.id}>
                  <div className="proposal-band" style={{ background: color }} aria-hidden="true" />
                  <div className="proposal-body">
                    <div className="proposal-top">
                      <span className="proposal-category">{p.category}</span>
                      <span className={`status-chip ${isCompleted ? 'resolved' : 'in-progress'}`}>
                        {p.status || 'Active'}
                      </span>
                    </div>
                    <h2 className="proposal-title">{p.title}</h2>
                    {p.location && <p className="proposal-location">{p.location}</p>}
                    <p className="proposal-desc">{p.description}</p>

                    <div className="vote-meter" aria-label={`${pct}% interested`}>
                      <div className="vote-meter-bar">
                        <div className="vote-meter-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="vote-pct">{pct}% Support</span>
                    </div>

                    <div className="vote-counters">
                      <div className="vote-counter interested">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span className="vote-count">{interested.toLocaleString()}</span>
                        <span className="vote-label">Interested</span>
                      </div>
                      <div className="vote-counter not-interested">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                        </svg>
                        <span className="vote-count">{notInterested.toLocaleString()}</span>
                        <span className="vote-label">Not Interested</span>
                      </div>
                    </div>

                    <div className="proposal-actions">
                      <button
                        type="button"
                        className={`btn btn-vote-yes ${userVoted ? 'voted' : ''}`}
                        disabled={isCompleted || isVoting || userVoted}
                        onClick={() => handleVote(p.id, 'interest')}
                      >
                        {isVoting ? 'Voting...' : userVoted ? 'Voted Interested' : 'Vote Interested'}
                      </button>
                      {!userVoted && !isCompleted && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={isVoting}
                          onClick={() => handleVote(p.id, 'not_interest')}
                        >
                          Not Interested
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Submit Proposal Modal */}
      {modalOpen && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) { setModalOpen(false); setModalError(''); setModalSuccess(''); } }}
        >
          <div className="modal-box">
            <div className="modal-header">
              <h2 id="modal-title">Submit a Development Proposal</h2>
              <button type="button" className="modal-close" onClick={() => { setModalOpen(false); setModalError(''); setModalSuccess(''); }} aria-label="Close">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>

            <p className="modal-subtitle">Your proposal will be reviewed by the admin. If approved, it will appear in the Citizen Proposals section for voting.</p>

            {modalError && <div className="form-error-box" role="alert" style={{ marginBottom: 12 }}>{modalError}</div>}
            {modalSuccess && <div className="form-success-box" role="status" style={{ marginBottom: 12 }}>{modalSuccess}</div>}

            <form className="modal-form" onSubmit={handleProposalSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="m-title" className="form-label">Proposal Title *</label>
                <input id="m-title" type="text" className="form-input" placeholder="e.g. Community Sports Complex" value={modalData.title} onChange={e => setModalData({ ...modalData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="m-category" className="form-label">Category *</label>
                <select id="m-category" className="form-select" value={modalData.category} onChange={e => setModalData({ ...modalData, category: e.target.value })}>
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="m-location" className="form-label">Location / Ward</label>
                <input id="m-location" type="text" className="form-input" placeholder="Sector 11, Ward 6" value={modalData.location} onChange={e => setModalData({ ...modalData, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="m-desc" className="form-label">Description *</label>
                <textarea id="m-desc" className="form-textarea" rows={4} placeholder="Describe the proposed development in detail..." value={modalData.description} onChange={e => setModalData({ ...modalData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="m-benefit" className="form-label">Expected Benefit</label>
                <textarea id="m-benefit" className="form-textarea" rows={2} placeholder="How will this benefit the community?" value={modalData.benefit} onChange={e => setModalData({ ...modalData, benefit: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => { setModalOpen(false); setModalError(''); setModalSuccess(''); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="btn-spinner" aria-hidden="true" />Submitting...</> : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CitizenFooter />
    </div>
  );
}
