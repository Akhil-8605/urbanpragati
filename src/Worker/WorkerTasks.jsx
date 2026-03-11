import { useState } from 'react';
import './WorkerTasks.css';
const allTasks = [
  { id: 'CMP-1042', title: 'Water Leak Near Block C', location: 'Sector 14, Noida', date: '12 Mar 2025', status: 'Pending', priority: 'High', dept: 'Water' },
  { id: 'CMP-1039', title: 'Pothole on NH-24 Near Bridge', location: 'NH-24, Ghaziabad', date: '10 Mar 2025', status: 'In Progress', priority: 'High', dept: 'Road Repair' },
  { id: 'CMP-1036', title: 'Broken Pipeline at Sector 7', location: 'Sector 7, Noida', date: '08 Mar 2025', status: 'Pending', priority: 'Medium', dept: 'Water' },
  { id: 'CMP-1030', title: 'Contaminated Water Supply', location: 'Block B, Ghaziabad', date: '05 Mar 2025', status: 'In Progress', priority: 'High', dept: 'Water' },
  { id: 'CMP-1023', title: 'No Road Markings in School Zone', location: 'DLF Phase 1, Gurgaon', date: '03 Mar 2025', status: 'Resolved', priority: 'Low', dept: 'Road Repair' },
  { id: 'CMP-1018', title: 'Exposed Wires Near Park', location: 'Green Park, Delhi', date: '28 Feb 2025', status: 'Resolved', priority: 'High', dept: 'Electricity' },
];
const filters = ['All', 'Pending', 'In Progress', 'Resolved'];
const statusClass = { Pending: 'chip-pending', 'In Progress': 'chip-inprogress', Resolved: 'chip-resolved' };
const priorityClass = { High: 'cdc-priority--high', Medium: 'cdc-priority--medium', Low: 'cdc-priority--low' };
export default function WorkerTasks() {
  const [activeFilter, setActiveFilter] = useState('All');
  const filtered = activeFilter === 'All' ? allTasks : allTasks.filter((t) => t.status === activeFilter);
  return (
    <div className="worker-page">
      <header className="worker-navbar">
        <div className="worker-navbar-brand">
          <div className="worker-logo-dot" aria-hidden="true" />
          <span className="worker-brand-text">Urban Pragati — My Tasks</span>
        </div>
        <div className="worker-navbar-right">
          <a href="/worker/dashboard" className="worker-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            Dashboard
          </a>
          <div className="worker-avatar" aria-label="User avatar">R</div>
        </div>
      </header>
      <main className="worker-content">
        <div className="worker-tasks-header">
          <h1 className="admin-page-title">My Tasks</h1>
          <p className="admin-page-sub">{filtered.length} task{filtered.length !== 1 ? 's' : ''} shown</p>
        </div>
        <div className="worker-filter-row" role="group" aria-label="Filter tasks">
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-chip ${activeFilter === f ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveFilter(f)}
              aria-pressed={activeFilter === f}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="worker-tasks-grid">
          {filtered.map((t) => (
            <div key={t.id} className="worker-task-card-full">
              <div className="worker-task-card-header">
                <div>
                  <span className="table-id">{t.id}</span>
                  <h3 className="worker-task-title">{t.title}</h3>
                </div>
                <span className={`chip ${statusClass[t.status]}`}>{t.status}</span>
              </div>
              <div className="worker-task-meta">
                <span className="cdc-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  {t.location}
                </span>
                <span className="cdc-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  {t.date}
                </span>
                <span className={`cdc-priority ${priorityClass[t.priority]}`}>{t.priority}</span>
                <span className="table-dept-badge">{t.dept}</span>
              </div>
              <div className="worker-task-actions">
                <a href="/worker/task-detail" className="btn btn-primary btn-sm">View Detail</a>
                {t.status === 'Pending' && <button className="btn btn-secondary btn-sm">Start Work</button>}
                {t.status === 'In Progress' && <button className="btn btn-secondary btn-sm">Mark Resolved</button>}
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="worker-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>No tasks found for this filter.</p>
          </div>
        )}
      </main>
    </div>
  );
}
