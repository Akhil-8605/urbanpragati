import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ImageKit from 'imagekit-javascript';
import { resolveComplaintWithProof } from '../firebaseOperations/db';
import './WorkerTaskDetail.css';
import MapPlaceholder from '../Citizens/components/MapPlaceholder';

async function uploadToImageKit(file) {
  const authRes = await fetch(`${process.env.REACT_APP_BASE_URL}/auth`);
  const authData = await authRes.json();

  const imagekit = new ImageKit({
    publicKey: process.env.REACT_APP_IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.REACT_APP_IMAGEKIT_URL_ENDPOINT,
  });

  const result = await imagekit.upload({
    file,
    fileName: `resolution_proof_${Date.now()}_${file.name}`,
    token: authData.token,
    signature: authData.signature,
    expire: authData.expire,
    folder: '/worker-documents',
  });
  return result.url;
}
export default function WorkerTaskDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const task = location.state?.task;
  const [proofFiles, setProofFiles] = useState([]);
  const [isResolving, setIsResolving] = useState(false);

  if (!task) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Task data not found.</h2>
        <button className="btn btn-primary" onClick={() => navigate('/worker')}>Back to Dashboard</button>
      </div>
    );
  }

  const handleProofUpload = (e) => {
    const files = Array.from(e.target.files);
    setProofFiles(files);
  };

  const handleResolveTask = async () => {
    if (proofFiles.length === 0) {
      alert("Please upload a proof image before resolving the task.");
      return;
    }

    try {
      setIsResolving(true);
      const proofUrl = await uploadToImageKit(proofFiles[0]);
      
      const citizenId = task.userId || task.citizenId;
      const message = `Your complaint regarding '${task.category}' has been marked as Resolved by the assigned worker. View the proof attached.`;
      
      await resolveComplaintWithProof(task.id || task._id, citizenId, proofUrl, message);
      
      alert("Task successfully marked as resolved!");
      navigate('/worker/tasks');
    } catch (err) {
      console.error(err);
      alert("Failed to resolve task. Please try again.");
    } finally {
      setIsResolving(false);
    }
  };

  const timeline = [
    { step: 'Complaint Registered', date: new Date(task.createdAt).toLocaleString(), done: true },
    { step: 'Worker Assigned', date: task.status !== 'Pending' ? '✓' : '—', done: task.status !== 'Pending' },
    { step: 'Resolved', date: task.status === 'Resolved' ? '✓' : '—', done: task.status === 'Resolved' },
  ];
  return (
    <div className="worker-page">
      <header className="worker-navbar">
        <div className="worker-navbar-brand">
          <div className="worker-logo-dot" aria-hidden="true" />
          <span className="worker-brand-text">Urban Pragati — Task Detail</span>
        </div>
        <div className="worker-navbar-right">
          <a href="/worker/tasks" className="worker-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            My Tasks
          </a>
          <div className="worker-avatar" aria-label="User avatar">R</div>
        </div>
      </header>
      <main className="worker-content">
        <div className="wtd-layout">
          <div className="wtd-main">
            <div className="wtd-header-card">
              <div className="wtd-header-top">
                <div>
                  <p className="breadcrumb">My Tasks &rsaquo; {task._id.slice(-6).toUpperCase()}</p>
                  <h1 className="wtd-title">{task.category}</h1>
                </div>
                <span className="chip chip-inprogress">{task.status}</span>
              </div>
              <div className="wtd-badges">
                <span className={`cdc-priority cdc-priority--${task.priority.toLowerCase()}`}>{task.priority} Priority</span>
                <span className="table-dept-badge">{task.dept}</span>
              </div>
            </div>
            <div className="wtd-card">
              <h2 className="dept-section-title">Complaint Details</h2>
              <p className="wtd-description">{task.description}</p>
              <div className="wtd-info-grid">
                <div className="dept-info-item"><span className="dept-info-label">Citizen</span><span>{task.citizenName}</span></div>
                <div className="dept-info-item"><span className="dept-info-label">Phone</span>
                  <span><a href={`tel:${task.citizenPhone}`}>{task.citizenPhone}</a></span>
                </div>
                <div className="dept-info-item"><span className="dept-info-label">Location</span><span>{task.address}</span></div>
                <div className="dept-info-item"><span className="dept-info-label">Filed On</span><span>{new Date(task.createdAt).toLocaleString()}</span></div>
              </div>
            </div>
            <div className="wtd-card">
              <h2 className="dept-section-title">Photo Evidence</h2>
              <div className="wtd-gallery">
                {task.imageUrl ? (
                  <div className="wtd-gallery-item" aria-label={`Evidence photo`} style={{ padding: 0, overflow: 'hidden' }}>
                    <img src={task.imageUrl} alt="Complaint Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className="wtd-gallery-item" aria-label={`Evidence photo missing`}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>No Photo</span>
                  </div>
                )}
              </div>
            </div>
            <div className="wtd-card">
              <h2 className="dept-section-title">Upload Proof of Work</h2>
              <p className="wtd-upload-hint">Upload photos or documents as proof that the work has been completed.</p>
              <label className="wtd-upload-zone" htmlFor="proof-upload" aria-label="Upload proof files">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" aria-hidden="true">
                  <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                </svg>
                <span className="wtd-upload-label">Click to upload or drag &amp; drop</span>
                <span className="wtd-upload-sub">PNG, JPG, PDF up to 10MB</span>
                <input
                  id="proof-upload"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  className="wtd-file-input"
                  tabIndex={-1}
                  onChange={handleProofUpload}
                />
                {proofFiles.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    {proofFiles.map((file, index) => (
                      <div key={index} style={{ fontSize: "14px", color: "#444" }}>
                        📎 {file.name}
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>
            <div className="wtd-actions">
              <a href={`tel:${task.citizenPhone}`} className="btn btn-secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>Call Citizen</a>
              <button 
                className="btn btn-primary wtd-btn-resolve" 
                onClick={handleResolveTask} 
                disabled={isResolving || task.status === 'Resolved'}
              >
                {isResolving ? 'Resolving...' : 'Mark as Resolved with Proof'}
              </button>
            </div>
          </div>
          <aside className="wtd-sidebar">
            <div className="wtd-card">
              <h2 className="dept-section-title">Status Timeline</h2>
              <ol className="dept-timeline" aria-label="Task timeline">
                {timeline.map((t, i) => (
                  <li key={i} className={`dept-timeline-item ${t.done ? 'dept-timeline-item--done' : ''}`}>
                    <span className="dept-timeline-dot" aria-hidden="true" />
                    <div className="dept-timeline-content">
                      <span className="dept-timeline-step">{t.step}</span>
                      <span className="dept-timeline-date">{t.date}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="wtd-card">
              <h2 className="dept-section-title">Task Location</h2>
              <MapPlaceholder />
              {task.coordinates?.lat && (
                <a
                  href={`https://maps.google.com/?q=${task.coordinates.lat},${task.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
                  </svg>
                  Get Directions
                </a>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
