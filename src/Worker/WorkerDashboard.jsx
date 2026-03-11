import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import './WorkerDashboard.css';
import { listenTasksByWorker, updateComplaintStatusWithNotification, submitWorkerQuotation } from '../firebaseOperations/db';
const statusClass = { Pending: 'chip-pending', 'In Progress': 'chip-inprogress', Resolved: 'chip-resolved' };
export default function WorkerDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [quotationForm, setQuotationForm] = useState({
    estimatedCost: '',
    description: '',
    timeline: '',
  }); 
  const fetchTasks = (userId) => {
    setLoading(true);
    listenTasksByWorker(userId, (data) => {
      const mappedComplaints = data.map(c => ({
        _id: c.id,
        category: c.category || c.department,
        status: c.status,
        address: c.address,
        description: c.description,
        createdAt: c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : new Date().toISOString(),
        coordinates: c.coordinates,
        userId: c.userId || null,
        imageUrl: c.imageUrl || null,
        citizenName: c.userName || 'Unknown',
        citizenPhone: c.userPhone || c.phone || 'Unknown',
        dept: c.department || c.dept || 'Unknown',
        priority: c.priority || 'Medium',
      }));
      setTasks(mappedComplaints);
      setLoading(false);
    });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      fetchTasks(parsedUser.uid);
    } else {
      setLoading(false);
    }
  }, []);
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus) return alert('Please select a status');
    try {
      const message = newStatus === 'Resolved'
        ? `Your complaint (${selectedTask.category}) has been marked as Resolved by the worker.`
        : `The status of your complaint (${selectedTask.category}) has been updated to ${newStatus}.`;

      await updateComplaintStatusWithNotification(selectedTask._id, newStatus, selectedTask.userId, message);
      alert('Status updated successfully!');
      setActiveModal(null);
      setNewStatus('');
    } catch (err) {
      alert('Error updating status');
    }
  };
  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    if (!quotationForm.estimatedCost || !quotationForm.description) {
      alert('Please fill in all required fields');
      return;
    }
    try {
      const quotationData = {
        ...quotationForm,
        submittedAt: new Date(),
      };
      await submitWorkerQuotation(selectedTask._id, quotationData, selectedTask.userId);
      alert('Quotation submitted successfully!');
      setActiveModal(null);
      setQuotationForm({ estimatedCost: '', description: '', timeline: '' });
    } catch (err) {
      console.error('[v0] Error submitting quotation:', err);
      alert('Error submitting quotation');
    }
  };

  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const resolved = tasks.filter(t => t.status === 'Resolved').length;
  return (
    <div className="worker-page">
      <header className="worker-navbar">
        <a className="worker-navbar-brand" href='/' style={{textDecoration: "none"}}>
          <div className="worker-logo-dot" aria-hidden="true" />
          <span className="worker-brand-text">Urban Pragati — Worker Portal</span>
        </a>
        <div className="worker-navbar-right">
          <span className="worker-greeting">Welcome, {userData?.displayName || 'Worker'}</span>
          <div className="worker-avatar" aria-label="User avatar">{userData?.displayName ? userData.displayName[0] : 'W'}</div>
        </div>
      </header>
      <main className="worker-content">
        <div className="worker-summary-ribbon">
          <div className="worker-summary-stat">
            <span className="worker-summary-num">{tasks.length}</span>
            <span className="worker-summary-label">Assigned Tasks</span>
          </div>
          <div className="worker-summary-stat">
            <span className="worker-summary-num worker-summary-num--amber">{pending}</span>
            <span className="worker-summary-label">Pending</span>
          </div>
          <div className="worker-summary-stat">
            <span className="worker-summary-num worker-summary-num--blue">{inProgress}</span>
            <span className="worker-summary-label">In Progress</span>
          </div>
          <div className="worker-summary-stat">
            <span className="worker-summary-num worker-summary-num--green">{resolved}</span>
            <span className="worker-summary-label">Resolved</span>
          </div>
        </div>
        <div className="worker-main-grid">
          <section aria-labelledby="worker-tasks-heading">
            <div className="worker-section-header">
              <h2 className="section-heading" id="worker-tasks-heading">Assigned Tasks</h2>
            </div>
            {loading ? <p>Loading tasks...</p> : (
              <div className="worker-task-list">
                {tasks.slice().reverse().map((t) => (
                  <div key={t._id} className="worker-task-card">
                    <div className="worker-task-card-header">
                      <div>
                        <span className="table-id">{t._id.slice(-6).toUpperCase()}</span>
                        <h3 className="worker-task-title">{t.category}</h3>
                      </div>
                      <span className={`chip ${statusClass[t.status] || 'chip-pending'}`}>{t.status}</span>
                    </div>
                    <div className="worker-task-meta">
                      <span className="cdc-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {t.address || 'Location unknown'}
                      </span>
                      <span className="cdc-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                      <p style={{ fontSize: '0.85rem', color: '#666', width: '100%', marginTop: '5px' }}>{t.description}</p>
                    </div>
                    <div className="worker-task-actions">
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/worker/tasks/${t._id}`, { state: { task: t } })}>View Details</button>
                      {t.status !== 'Resolved' && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedTask(t); setActiveModal('update'); }}>
                            Update Status
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => { setSelectedTask(t); setActiveModal('quotation'); }}>
                            Submit Quotation
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p>No tasks assigned to you right now.</p>}
              </div>
            )}
          </section>
          <aside aria-label="Worker location map">
            <h2 className="section-heading">Task Locations</h2>
            <div style={{ height: 350, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
              <MapContainer center={[28.6139, 77.209]} zoom={11} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                {tasks.filter(t => t.coordinates && t.coordinates.lat).map(t => (
                  <Marker key={t._id} position={[t.coordinates.lat, t.coordinates.lng]}>
                    <Popup>
                      <strong>{t.category}</strong><br />
                      Citizen: {t.citizenName}<br />
                      Phone: <a href={`tel:${t.citizenPhone}`}>{t.citizenPhone}</a><br />
                      {t.address}<br />
                      Status: {t.status}<br />
                      <button className="btn btn-outline btn-sm" style={{marginTop:'5px'}} onClick={() => navigate(`/worker/tasks/${t._id}`, { state: { task: t } })}>View Details</button>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </aside>
        </div>
      </main>
      {activeModal === 'update' && (
        <div className="worker-modal-overlay">
          <div className="worker-modal-content">
            <h3>Update Task Status</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>{selectedTask?.description}</p>
            <form onSubmit={handleUpdateStatus}>
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)} required>
                  <option value="">Select status</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proof of Work (Optional)</label>
                <input type="file" className="form-input" accept="image/*" onChange={()=>{}} />
                <span className="field-hint">Upload a photo if task is resolved.</span>
              </div>
              <div className="worker-modal-actions">
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'quotation' && (
        <div className="worker-modal-overlay">
          <div className="worker-modal-content">
            <h3>Submit Work Quotation</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>Task: {selectedTask?.category}</p>
            <form onSubmit={handleSubmitQuotation}>
              <div className="form-group">
                <label className="form-label">Estimated Cost *</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '600', color: '#666', marginRight: '0.5rem' }}>₹</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g., 5000"
                    min="0"
                    step="100"
                    value={quotationForm.estimatedCost}
                    onChange={e => setQuotationForm({ ...quotationForm, estimatedCost: e.target.value })}
                    required
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Work Description *</label>
                <textarea
                  className="form-input"
                  placeholder="Describe the work to be performed..."
                  rows="4"
                  value={quotationForm.description}
                  onChange={e => setQuotationForm({ ...quotationForm, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Timeline (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="e.g., 3"
                  min="1"
                  value={quotationForm.timeline}
                  onChange={e => setQuotationForm({ ...quotationForm, timeline: e.target.value })}
                />
              </div>
              <div className="worker-modal-actions">
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Submit Quotation</button>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
