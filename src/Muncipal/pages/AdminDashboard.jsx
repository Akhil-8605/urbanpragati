import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';
import AdminSidebar from '../components/AdminSidebar';
import AdminNavbar from '../components/AdminNavbar';
import DeptStatsCard from '../components/DeptStatsCard';
import { getAllComplaints, assignComplaintToWorker, approveComplaint } from '../../firebaseOperations/db';
const statusClass = {
  Pending: 'chip-pending',
  'In Progress': 'chip-inprogress',
  Assigned: 'chip-inprogress',
  Resolved: 'chip-resolved',
  Done: 'chip-resolved',
  Approved: 'chip-resolved',
  Rejected: 'chip-rejected',
};
const depts = [
  { name: 'Water', icon: '💧' },
  { name: 'Electricity', icon: '⚡' },
  { name: 'Sanitation', icon: '🗑️' },
  { name: 'Property Tax', icon: '🏠' },
  { name: 'Road Repair', icon: '🛣️' },
  { name: 'Development', icon: '🏗️' }
];
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const [selectedComp, setSelectedComp] = useState(null);
  const [workerId, setWorkerId] = useState('');
  const [points, setPoints] = useState('');
  const [adminDepartment, setAdminDepartment] = useState('');

  useEffect(() => {
    // Check user's department and redirect if applicable
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.department) {
      setAdminDepartment(userData.department);
      // Redirect department admins to their specific dashboard
      const deptRoute = userData.department.toLowerCase().replace(/\s+/g, '-');
      navigate(`/admin/${deptRoute}`);
    }
    fetchComplaints();
  }, [navigate]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints();
      const mappedComplaints = data.map(c => {
        const dateStr = c.createdAt?.toDate ? c.createdAt.toDate().toISOString() : new Date().toISOString();
        return {
          _id: c.id,
          createdAt: dateStr,
          category: c.category || c.department,
          description: c.description || c.issue,
          status: c.status,
          assignedWorker: c.workerId || '',
          coordinates: c.coordinates || {}
        };
      });
      setComplaints(mappedComplaints);
    } catch (err) {
      console.error(err);
      setError('Could not load complaints from server.');
    } finally {
      setLoading(false);
    }
  };
  const handleAssignWorker = async () => {
    if (!workerId) return alert('Enter Worker ID');
    try {
      await assignComplaintToWorker(selectedComp._id, workerId);
      alert('Worker assigned successfully');
      setActiveModal(null);
      fetchComplaints();
    } catch (err) {
      alert('Error assigning worker');
    }
  };
  const handleApprove = async () => {
    if (!points) return alert('Enter points to award');
    try {
      await approveComplaint(selectedComp._id);
      alert('Complaint approved!');
      setActiveModal(null);
      fetchComplaints();
    } catch (err) {
      alert('Error approving');
    }
  };
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => ['In Progress', 'Assigned'].includes(c.status)).length;
  const resolved = complaints.filter(c => ['Resolved', 'Done', 'Approved'].includes(c.status)).length;
  const deptStats = depts.map(d => {
    const dComps = complaints.filter(c => c.category === d.name);
    return {
      dept: d.name,
      icon: d.icon,
      total: dComps.length,
      pending: dComps.filter(c => c.status === 'Pending').length,
      inProgress: dComps.filter(c => ['In Progress', 'Assigned'].includes(c.status)).length,
      resolved: dComps.filter(c => ['Resolved', 'Done', 'Approved'].includes(c.status)).length,
    };
  });
  const chartData = deptStats.map(d => ({
    name: d.dept,
    Pending: d.pending,
    'In Progress': d.inProgress,
    Resolved: d.resolved,
  }));
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminNavbar />
        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <h1 className="admin-page-title">Urban Pragati — Central Admin Dashboard {adminDepartment? adminDepartment : ''}</h1>
              <p className="admin-page-sub">System-wide overview of all departments and complaints</p>
            </div>
          </div>
          <div className="admin-summary-ribbon">
            <div className="admin-ribbon-stat">
              <span className="admin-ribbon-num">{total}</span>
              <span className="admin-ribbon-label">Total Complaints</span>
            </div>
            <div className="admin-ribbon-divider" />
            <div className="admin-ribbon-stat">
              <span className="admin-ribbon-num admin-ribbon-num--pending">{pending}</span>
              <span className="admin-ribbon-label">Pending</span>
            </div>
            <div className="admin-ribbon-divider" />
            <div className="admin-ribbon-stat">
              <span className="admin-ribbon-num admin-ribbon-num--inprogress">{inProgress}</span>
              <span className="admin-ribbon-label">In Progress</span>
            </div>
            <div className="admin-ribbon-divider" />
            <div className="admin-ribbon-stat">
              <span className="admin-ribbon-num admin-ribbon-num--resolved">{resolved}</span>
              <span className="admin-ribbon-label">Resolved</span>
            </div>
          </div>
          <div className="admin-charts-grid">
            <div className="admin-chart-card">
              <h2 className="section-heading">Complaints by Department</h2>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f4f6fb' }} />
                    <Legend />
                    <Bar dataKey="Pending" fill="#e65100" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="In Progress" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="admin-chart-card">
              <h2 className="section-heading">Live Map View</h2>
              <div className="admin-map-container">
                <MapContainer center={[28.6139, 77.209]} zoom={11} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  {complaints.filter(c => c.coordinates && c.coordinates.lat).map(c => (
                    <Marker key={c._id} position={[c.coordinates.lat, c.coordinates.lng]}>
                      <Popup>
                        <strong>{c.category}</strong><br />
                        Status: {c.status}<br />
                        {c.description}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
          <section aria-labelledby="dept-stats-heading">
            <h2 className="section-heading" id="dept-stats-heading">Department Statistics</h2>
            <div className="admin-dept-grid">
              {deptStats.map((d) => (
                <DeptStatsCard key={d.dept} {...d} />
              ))}
            </div>
          </section>
          <section aria-labelledby="complaints-table-heading" className="admin-table-section">
            <div className="admin-table-header">
              <h2 className="section-heading" id="complaints-table-heading">Recent Complaints</h2>
            </div>
            {loading ? <p>Loading complaints...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
              <div className="admin-table-wrapper">
                <table className="admin-table" aria-label="Complaints list">
                  <thead>
                    <tr>
                      <th>ID / Date</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Worker</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.slice().reverse().map((c) => (
                      <tr key={c._id}>
                        <td>
                          <div className="table-id">{c._id.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>{new Date(c.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td><span className="table-dept-badge">{c.category}</span></td>
                        <td className="table-issue">{c.description}</td>
                        <td><span className={`chip ${statusClass[c.status] || 'chip-pending'}`}>{c.status}</span></td>
                        <td style={{ fontSize: '0.8rem' }}>{c.assignedWorker || <span style={{ color: '#999' }}>Unassigned</span>}</td>
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-table-action" onClick={() => { setSelectedComp(c); setActiveModal('assign'); }}>Assign</button>
                          <button className="btn-table-action" style={{ borderColor: '#10b981', color: '#10b981' }} onClick={() => { setSelectedComp(c); setActiveModal('approve'); }}>Approve</button>
                        </td>
                      </tr>
                    ))}
                    {complaints.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>No complaints found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
      {activeModal === 'assign' && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3>Assign Worker</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>Complaint: {selectedComp?.description}</p>
            <div className="form-group">
              <label className="form-label">Worker ID / Name</label>
              <input type="text" className="form-input" value={workerId} onChange={e => setWorkerId(e.target.value)} placeholder="e.g. Suresh Verma" />
            </div>
            <div className="admin-modal-actions">
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleAssignWorker}>Assign</button>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'approve' && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h3>Approve & Award Points</h3>
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>Approve resolution and grant Gamification points to Citizen.</p>
            <div className="form-group">
              <label className="form-label">Points to Award</label>
              <input type="number" className="form-input" value={points} onChange={e => setPoints(e.target.value)} placeholder="e.g. 50" />
            </div>
            <div className="admin-modal-actions">
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', background: '#10b981', borderColor: '#10b981' }} onClick={handleApprove}>Approve & Award</button>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setActiveModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
