import { useState, useEffect } from 'react';
import './DeptPage.css';
import AdminNavbar from '../components/AdminNavbar';
import ComplaintDetailCard from '../components/ComplaintDetailCard';
import { listenComplaintsByDepartment, getWorkersByDepartment, assignComplaintToWorkerWithNotification, recordWorkerPayment, rejectComplaint, updateComplaintStatusWithNotification } from '../../firebaseOperations/db';

export default function SanitationDept() {
  const [selected, setSelected] = useState(0);
  const [complaintsList, setComplaintsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [error, setError] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [payingRecord, setPayingRecord] = useState(null);
  const [rzpStep, setRzpStep] = useState('confirm');

  const navigate = require('react-router-dom').useNavigate();

  const fetchData = () => {};

  useEffect(() => {
    let unsub = () => {};
    const fetchInitial = async () => {
      try {
        setLoading(true);
        const wData = await getWorkersByDepartment('Sanitation');
        setWorkersList(wData);
        
        unsub = listenComplaintsByDepartment('Sanitation', (data) => {
          const mappedComplaints = data.map(c => {
            const dateStr = c.createdAt?.toDate
              ? c.createdAt.toDate().toLocaleDateString()
              : new Date().toLocaleDateString();

            return {
              originalId: c.id,
              id: c.id.slice(-6).toUpperCase(),
              title: c.category || "Sanitation Issue",
              citizen: c.userName || "Unknown",
              location: c.address || "Unknown",
              date: dateStr,
              status: c.status || "Pending",
              dept: "Sanitation",
              priority: "Medium",
              userId: c.userId || null,
              workerId: c.workerId || null,
              quotation: c.quotation || null,
              imageUrl: c.imageUrl || null,
              description: c.description || '',
              phone: c.userPhone || c.phone || ''
            };
          });
          setComplaintsList(mappedComplaints);
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        setError("Could not load data.");
        setLoading(false);
      }
    };

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role === 'admin' && userData.department && userData.department !== 'Sanitation') {
      navigate('/admin');
    } else {
      fetchInitial();
    }
    return () => unsub();
  }, [navigate]);
  const active = complaintsList[selected] || null;

  const handleDummyPayment = async () => {
    setRzpStep('processing');
    setTimeout(async () => {
      try {
        const paymentData = {
          transactionId: 'TXN' + Date.now().toString().slice(-8).toUpperCase(),
          amount: payingRecord.quotation.estimatedCost,
          date: new Date().toISOString()
        };
        await recordWorkerPayment(payingRecord.originalId, paymentData);
        setRzpStep('success');
      } catch (err) {
        console.error('Payment Error', err);
        alert('Payment failed.');
        setShowRazorpay(false);
      }
    }, 2000);
  };

  const closeRazorpay = () => {
    setShowRazorpay(false);
    setPayingRecord(null);
    setRzpStep('confirm');
  };

  return (
    <div className="admin-layout" style={{ gridTemplateColumns: '1fr' }}>
      <div className="admin-main">
        <AdminNavbar />
        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <p className="breadcrumb">Admin &rsaquo; Departments &rsaquo; Sanitation</p>
              <h1 className="admin-page-title">Sanitation Department</h1>
            </div>
            <button className="btn btn-primary">Export</button>
          </div>
          <div className="dept-layout">
            <div className="dept-list">
              <div className="dept-list-header">
                <span className="dept-count">{complaintsList.length} Complaints</span>
                <div className="dept-filter-row">
                  <button className="filter-chip filter-chip--active">All</button>
                  <button className="filter-chip">Pending</button>
                  <button className="filter-chip">Resolved</button>
                </div>
              </div>
              <div className="dept-list-scroll">
                {loading && <p>Loading...</p>}
                {!loading && complaintsList.map((c, i) => (
                  <ComplaintDetailCard key={c.id} complaint={c} isSelected={selected === i} onClick={() => setSelected(i)} />
                ))}
              </div>
            </div>
            <div className="dept-detail">
              {active ? (
                <>
                  <div className="dept-detail-header">
                    <div><span className="cdc-id">{active.id}</span><h2 className="dept-detail-title">{active.title}</h2></div>
                    <span className={`chip chip-${active.status === 'Pending' ? 'pending' : active.status === 'In Progress' ? 'inprogress' : 'resolved'}`}>{active.status}</span>
                  </div>
                  <div className="dept-info-grid">
                    <div className="dept-info-item"><span className="dept-info-label">Citizen</span><span>{active.citizen}</span></div>
                    <div className="dept-info-item"><span className="dept-info-label">Location</span><span>{active.location}</span></div>
                    <div className="dept-info-item"><span className="dept-info-label">Date Filed</span><span>{active.date}</span></div>
                    <div className="dept-info-item"><span className="dept-info-label">Priority</span><span>{active.priority}</span></div>
                  </div>
                  {active.imageUrl ? (
                    <div className="dept-img-container" style={{ margin: '1rem 0', borderRadius: '8px', overflow: 'hidden' }}>
                      <img src={active.imageUrl} alt="Complaint Evidence" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className="dept-img-placeholder" aria-label="Photo placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                      <span>Photo evidence placeholder</span>
                    </div>
                  )}
                  <div className="dept-assign-section">
                    <h3 className="dept-section-title">Assign Worker</h3>
                    <div className="dept-assign-row">
                      <select
                        className="dept-select"
                        aria-label="Select worker"
                        value={selectedWorkerId}
                        onChange={(e) => setSelectedWorkerId(e.target.value)}
                        disabled={active.status !== 'Pending'}
                      >
                        <option value="">-- Select Worker --</option>
                        {workersList.map(w => (
                          <option key={w.id} value={w.id}>{w.displayName || w.name || w.email}</option>
                        ))}
                      </select>
                      <button
                        className="btn btn-primary"
                        disabled={!selectedWorkerId || active.status !== 'Pending'}
                        onClick={async () => {
                          try {
                            const worker = workersList.find(w => w.id === selectedWorkerId);
                            const workerName = worker?.displayName || worker?.name || 'Worker';
                            await assignComplaintToWorkerWithNotification(
                              active.originalId,
                              selectedWorkerId,
                              workerName,
                              active.userId
                            );
                            alert('Worker assigned successfully');
                            setSelectedWorkerId('');
                          } catch (err) {
                            alert('Failed to assign worker');
                          }
                        }}
                      >Assign</button>
                    </div>
                  </div>
                  <div className="dept-timeline-section">
                    <h3 className="dept-section-title">Status Timeline</h3>
                    <ol className="dept-timeline">
                      <li className="dept-timeline-item dept-timeline-item--done">
                        <span className="dept-timeline-dot" aria-hidden="true" />
                        <div className="dept-timeline-content"><span className="dept-timeline-step">Complaint Registered</span><span className="dept-timeline-date">{active.date}</span></div>
                      </li>
                      <li className={`dept-timeline-item ${active.status !== 'Pending' ? 'dept-timeline-item--done' : ''}`}>
                        <span className="dept-timeline-dot" aria-hidden="true" />
                        <div className="dept-timeline-content"><span className="dept-timeline-step">Worker Assigned</span><span className="dept-timeline-date">{active.status !== 'Pending' ? '✓' : '—'}</span></div>
                      </li>
                      <li className={`dept-timeline-item ${active.status === 'Resolved' ? 'dept-timeline-item--done' : ''}`}>
                        <span className="dept-timeline-dot" aria-hidden="true" />
                        <div className="dept-timeline-content"><span className="dept-timeline-step">Resolved</span><span className="dept-timeline-date">{active.status === 'Resolved' ? '✓' : '—'}</span></div>
                      </li>
                    </ol>
                  </div>
                  {active.quotation && (
                    <div className="dept-timeline-section" style={{ marginTop: '1.5rem', background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <h3 className="dept-section-title" style={{ fontSize: '1rem', color: '#111827', marginBottom: '0.75rem', fontWeight: '600' }}>Worker Quotation</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', color: '#4b5563' }}>
                        <div><strong>Description:</strong> {active.quotation.description}</div>
                        <div><strong>Timeline:</strong> {active.quotation.timeline} Days</div>
                        <div><strong>Estimated Cost:</strong> ₹{active.quotation.estimatedCost}</div>
                        <div>
                          <strong>Payment:</strong> <span style={{ color: active.quotation.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{active.quotation.paymentStatus || 'Pending'}</span>
                        </div>
                      </div>
                      {active.quotation.paymentStatus !== 'Paid' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ marginTop: '1rem' }}
                          onClick={() => {
                            setPayingRecord(active);
                            setRzpStep('confirm');
                            setShowRazorpay(true);
                          }}
                        >
                          Pay Worker (₹{active.quotation.estimatedCost})
                        </button>
                      )}
                    </div>
                  )}

                  <div className="dept-action-row">
                    <button 
                      className="btn btn-secondary"
                      onClick={async () => {
                        const reason = prompt("Enter reason for rejection:");
                        if (reason !== null) {
                          await rejectComplaint(active.originalId, reason, active.userId);
                          alert("Complaint rejected.");
                        }
                      }}
                    >
                      Reject
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={async () => {
                        if (window.confirm("Mark as resolved?")) {
                          await updateComplaintStatusWithNotification(
                            active.originalId, 
                            "Resolved", 
                            active.userId, 
                            "Your complaint has been verified and marked as Resolved by the department admin."
                          );
                          alert("Complaint marked resolved.");
                        }
                      }}
                    >
                      Mark Resolved
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <p>Select a complaint to view details.</p>
                </div>
              )}
            </div>
          </div>

          {showRazorpay && payingRecord && (
            <div className="worker-modal-overlay">
              <div className="worker-modal-content" style={{ maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#2563eb" />
                    <path d="M11 7h2v5h-2zm0 6h2v2h-2z" fill="#2563eb" />
                  </svg>
                  <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 'bold', marginBottom: '0.5rem' }}>Secure Payment</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Urban Pragati Admin Portal</p>
                </div>

                {rzpStep === 'confirm' && (
                  <>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#64748b' }}>Paying To:</span>
                        <span style={{ fontWeight: '500', color: '#334155' }}>{payingRecord.workerName || payingRecord.workerId}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Amount:</span>
                        <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>₹{payingRecord.quotation.estimatedCost}</span>
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', justifyContent: 'center' }} onClick={handleDummyPayment}>
                      Pay Now
                    </button>
                    <button className="btn btn-outline" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', justifyContent: 'center' }} onClick={closeRazorpay}>
                      Cancel
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      Secured by Razorpay Dummy
                    </div>
                  </>
                )}

                {rzpStep === 'processing' && (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div className="login-spinner" style={{ width: '40px', height: '40px', borderTopColor: '#2563eb', margin: '0 auto 1.5rem' }} aria-hidden="true" />
                    <h4 style={{ color: '#1e293b', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Processing Payment...</h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please do not close this window.</p>
                  </div>
                )}

                {rzpStep === 'success' && (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="24" height="24"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <h4 style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Payment Successful!</h4>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Worker has been paid ₹{payingRecord.quotation.estimatedCost}.</p>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={closeRazorpay}>Done</button>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
