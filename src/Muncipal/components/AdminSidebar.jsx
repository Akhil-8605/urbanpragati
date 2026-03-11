import './AdminSidebar.css';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h4a1 1 0 110 2H4a1 1 0 01-1-1z"/>
      </svg>
    ),
  },
  {
    label: 'Water Dept',
    path: '/admin/water',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: 'Electricity',
    path: '/admin/electricity',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: 'Sanitation',
    path: '/admin/sanitation',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: 'Property Tax',
    path: '/admin/property-tax',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
      </svg>
    ),
  },
  {
    label: 'Road Repair',
    path: '/admin/road-repair',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: 'Development',
    path: '/admin/development',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
      </svg>
    ),
  },
  {
    label: 'Feedback',
    path: '/admin/feedback',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd"/>
      </svg>
    ),
  },
  {
    label: 'Best Citizen',
    path: '/admin/best-citizen',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ),
  },
];

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
      <div className="sidebar-logo">
        <div>
          <span className="sidebar-logo-text">Urban Pragati</span>
          <span className="sidebar-logo-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="sidebar-nav-label">Navigation</p>
        <ul role="list">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
              >
                <span className="sidebar-nav-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
