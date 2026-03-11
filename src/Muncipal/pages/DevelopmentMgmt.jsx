import { useState, useEffect } from 'react';
import './DevelopmentMgmt.css';
import AdminNavbar from '../components/AdminNavbar';
import { listenAllDevelopments } from '../../firebaseOperations/db';
const statusClass = { Active: 'chip-inprogress', 'Under Review': 'chip-pending', Approved: 'chip-resolved', 'Pending Approval': 'chip-pending' };
export default function DevelopmentMgmt() {
  const [proposalsList, setProposalsList] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, active: 0, votes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = require('react-router-dom').useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.role === 'admin' && userData.department && userData.department !== 'Development') {
      navigate('/admin');
    } else {
      fetchData();
    }
  }, [navigate]);
  const fetchData = () => {
    setLoading(true);
    listenAllDevelopments((data) => {
      const mappedProposals = data.map(d => ({
        id: d.id.slice(-6).toUpperCase(),
        title: d.title || "Development Proposal",
        submitted: d.userName || "Citizen",
        date: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString(),
        interested: d.interested_citizens ? d.interested_citizens.length : 0,
        notInterested: d.not_interested_citizens ? d.not_interested_citizens.length : 0,
        status: d.status || "Under Review"
      }));

      setProposalsList(mappedProposals);
      setStats({
        total: mappedProposals.length,
        approved: mappedProposals.filter(p => p.status === "Approved").length,
        active: mappedProposals.filter(p => p.status === "Active" || p.status === "Under Review").length,
        votes: mappedProposals.reduce((sum, p) => sum + p.interested + p.notInterested, 0)
      });
      setLoading(false);
    });
  };
  return (
    <div className="admin-layout" style={{ gridTemplateColumns: '1fr' }}>
      <div className="admin-main">
        <AdminNavbar />
        <main className="admin-content">
          <div className="admin-page-header">
            <div>
              <p className="breadcrumb">Admin &rsaquo; Development Management</p>
              <h1 className="admin-page-title">Development Management</h1>
            </div>
            <button className="btn btn-primary">+ Add Proposal</button>
          </div>
          <div className="devmgmt-summary">
            <div className="devmgmt-stat"><span className="devmgmt-num">{stats.total}</span><span className="devmgmt-label">Total Proposals</span></div>
            <div className="devmgmt-stat"><span className="devmgmt-num devmgmt-num--green">{stats.approved}</span><span className="devmgmt-label">Approved</span></div>
            <div className="devmgmt-stat"><span className="devmgmt-num devmgmt-num--amber">{stats.active}</span><span className="devmgmt-label">Active / Under Review</span></div>
            <div className="devmgmt-stat"><span className="devmgmt-num devmgmt-num--blue">{stats.votes.toLocaleString()}</span><span className="devmgmt-label">Total Votes Cast</span></div>
          </div>
          <section className="admin-table-section" aria-labelledby="devmgmt-table-heading">
            <h2 className="section-heading" id="devmgmt-table-heading">All Proposals</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table" aria-label="Development proposals">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Proposal Title</th>
                    <th>Submitted By</th>
                    <th>Date</th>
                    <th>Interested</th>
                    <th>Not Interested</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading proposals...</td></tr>}
                  {!loading && proposalsList.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No proposals found.</td></tr>}
                  {!loading && proposalsList.map((p) => (
                    <tr key={p.id}>
                      <td><span className="table-id">{p.id}</span></td>
                      <td>{p.title}</td>
                      <td>{p.submitted}</td>
                      <td>{p.date}</td>
                      <td><span className="vote-count vote-count--yes">{p.interested}</span></td>
                      <td><span className="vote-count vote-count--no">{p.notInterested}</span></td>
                      <td><span className={`chip ${statusClass[p.status]}`}>{p.status}</span></td>
                      <td>
                        <div className="devmgmt-actions">
                          <button className="btn-table-action">Approve</button>
                          <button className="btn-table-action btn-table-action--danger">Reject</button>
                        </div>
                      </td>
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
