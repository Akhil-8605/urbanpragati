import { useState, useEffect } from 'react';
import './DeptPage.css';
import ComplaintDetailCard from '../components/ComplaintDetailCard';
import { listenComplaintsByDepartment, rejectComplaint, updateComplaintStatusWithNotification } from '../../firebaseOperations/db';

export default function PropertyTaxDept() {
  const [selected, setSelected] = useState(0);
  const [complaintsList, setComplaintsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = require('react-router-dom').useNavigate();

  useEffect(() => {
    let unsub = () => {};
    const fetchInitial = async () => {
      try {
        setLoading(true);
        unsub = listenComplaintsByDepartment('Property Tax', (data) => {
          const mappedComplaints = data.map(c => {
            const dateStr = c.createdAt?.toDate
              ? c.createdAt.toDate().toLocaleDateString()
              : new Date().toLocaleDateString();

            return {
              originalId: c.id,
              id: c.id.slice(-6).toUpperCase(),
              title: c.category || "Property Tax Issue",
              citizen: c.userName || c.userEmail || "Citizen",
              location: c.address || "Unknown",
              date: dateStr,
              status: c.status || "Pending",
              dept: "Property Tax",
              priority: c.priority || "Medium",
              userId: c.userId || null,
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
        setLoading(false);
      }
    };

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role === 'admin' && userData.department && userData.department !== 'Property Tax') {
      navigate('/admin');
    } else {
      fetchInitial();
    }
    return () => unsub();
  }, [navigate]);

  const active =
    complaintsList.length > 0 && complaintsList[selected]
      ? complaintsList[selected]
      : null;
  return (
    <div className="admin-layout" style={{ gridTemplateColumns: '1fr' }}>
      <div className="admin-main">
        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <p className="breadcrumb">Admin &rsaquo; Departments &rsaquo; Property Tax</p>
              <h1 className="admin-page-title">Property Tax Department</h1>
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
                    <span className={`chip ${active.status === 'Rejected' ? 'chip-rejected' : active.status === 'Pending' ? 'chip-pending' : 'chip-resolved'}`}>{active.status}</span>
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
                    <div className="dept-img-placeholder" aria-label="Document placeholder">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <span>Document / Receipt placeholder</span>
                    </div>
                  )}
                  <div className="dept-assign-section">
                    <h3 className="dept-section-title">Assign Officer</h3>
                    <div className="dept-assign-row">
                      <select className="dept-select" aria-label="Select officer"><option value="">-- Select Officer --</option></select>
                      <button className="btn btn-primary">Assign</button>
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
                        <div className="dept-timeline-content"><span className="dept-timeline-step">Review Verified</span><span className="dept-timeline-date">{active.status !== 'Pending' ? '✓' : '—'}</span></div>
                      </li>
                      <li className={`dept-timeline-item ${active.status === 'Resolved' || active.status === 'Rejected' ? 'dept-timeline-item--done' : ''}`}>
                        <span className="dept-timeline-dot" aria-hidden="true" />
                        <div className="dept-timeline-content"><span className="dept-timeline-step">Closed</span><span className="dept-timeline-date">{active.status === 'Resolved' || active.status === 'Rejected' ? '✓' : '—'}</span></div>
                      </li>
                    </ol>
                  </div>
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
                            "Your issue has been verified and marked as Resolved."
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
        </main>
      </div>
    </div>
  );
}
