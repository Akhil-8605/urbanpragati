import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, getAdminDepartmentFromEmail } from '../../firebaseOperations/auth';
import './LoginPage.css';
import Modi from '../modi.webp';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewPassword, setViewPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Intercept Hardcoded Department Admin Login
      const emailPattern = /^urbanpragati\.([a-z-]+)@gmail\.com$/i;
      const match = email.match(emailPattern);
      
      if (match && password === 'urbanpragati') {
        const deptSlug = match[1];
        const departmentName = deptSlug.charAt(0).toUpperCase() + deptSlug.slice(1).replace('-', ' ');
        const role = 'admin';
        
        const fullUserData = {
          uid: `hardcoded-admin-${deptSlug}`,
          email: email,
          role: role,
          department: departmentName,
          displayName: `${departmentName} Admin`
        };

        const dummyToken = `dummy-token-${deptSlug}-${Date.now()}`;

        localStorage.setItem('userToken', dummyToken);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userData', JSON.stringify(fullUserData));

        navigate(`/admin/${deptSlug}`);
        return;
      }

      // Firebase login — auto-detects role
      const { user, userData, role } = await loginUser(email, password);
      const token = await user.getIdToken();

      const fullUserData = { ...userData, uid: user.uid, email: user.email };

      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userData', JSON.stringify(fullUserData));

      if (role === 'citizen') navigate('/citizen-dashboard');
      else if (role === 'worker') navigate('/worker');
      else if (role === 'admin') {
        const dept = userData.department || getAdminDepartmentFromEmail(email);
        if (dept) {
          const deptRoute = dept.toLowerCase().replace(/\s+/g, '-');
          navigate(`/admin/${deptRoute}-dept`);
        } else {
          navigate('/admin');
        }
      } else {
        navigate('/admin');
      }

    } catch (err) {
      console.error('[LoginPage] Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait and try again.');
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero" role="banner">
        <div className="login-hero__overlay" />
        <img
          src={Modi}
          alt="Urban Pragati — Prime Minister of India"
          className="login-hero__img"
        />
        <div className="login-hero__content">
          <div className="login-hero__badge">Government of India</div>
          <h1 className="login-hero__title">Urban Pragati</h1>
          <p className="login-hero__tagline">Empowering Citizens, Improving Cities</p>
          <div className="login-hero__stats">
            <div className="login-stat">
              <span className="login-stat__num">2.4M+</span>
              <span className="login-stat__label">Citizens Served</span>
            </div>
            <div className="login-stat">
              <span className="login-stat__num">98K+</span>
              <span className="login-stat__label">Issues Resolved</span>
            </div>
            <div className="login-stat">
              <span className="login-stat__num">150+</span>
              <span className="login-stat__label">Cities</span>
            </div>
          </div>
        </div>
      </div>

      <main className="login-panel">
        <div className="login-form-wrap">
          <div className="login-header">
            <h2 className="login-header__title">Welcome Back</h2>
            <p className="login-header__sub">Sign in to continue to your portal</p>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            {error && (
              <div className="login-error-box" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email" className="form-label">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="yourname@example.com"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="input-eye-wrap">
                <input
                  id="login-password"
                  type={viewPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="eye-btn"
                  aria-label={viewPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setViewPassword(!viewPassword)}
                >
                  {viewPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-form__row">
              <label className="check-label">
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <span className="login-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="signup-cta">
            New user?{' '}
            <Link to="/signup" className="login-link">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
