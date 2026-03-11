import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CitizenNavbar.css';

function CitizenNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const token = localStorage.getItem('userToken');
  const role = localStorage.getItem('userRole');
  const user = JSON.parse(localStorage.getItem('userData') || '{}');

  return (
    <header className="cnavbar" role="banner">
      <nav className="cnavbar__inner container" aria-label="Primary navigation">
        <Link to="/" className="cnavbar__logo" aria-label="Urban Pragati Home">
          <div className="cnavbar__emblem" aria-hidden="true">
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="19" cy="19" r="19" fill="#FF6F00" />
              <text x="19" y="25" textAnchor="middle" fontSize="15" fill="white" fontWeight="bold">UP</text>
            </svg>
          </div>
          <div className="cnavbar__brand">
            <span className="cnavbar__brand-name">Urban Pragati</span>
            <span className="cnavbar__brand-sub">Smart City Portal</span>
          </div>
        </Link>

        <div className="cnavbar__actions">
          {!token ? (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/signup/citizen" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          ) : (
            <>
              <div
                className="profile-avatar"
                onClick={() => setOpenProfile(!openProfile)}
              >
                {user?.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'UP'}
              </div>
              {openProfile && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-name">{user?.displayName || 'User'}</div>

                  <Link to={role === 'citizen' ? '/citizen-dashboard' : role === 'worker' ? '/worker' : '/admin'} className="profile-item">
                    Go to Dashboard
                  </Link>

                  <div className="profile-divider" />

                  <button
                    onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
                    className="profile-item logout"
                    style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}

          <button
            className="cnavbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </nav>
    </header>
  );
}

export default CitizenNavbar;
