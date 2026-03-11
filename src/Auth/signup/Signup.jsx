import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../firebaseOperations/auth';
import './Signup.css';
import Modi from '../modi.webp';

const DEPARTMENTS = ['Water', 'Electricity', 'Road Repair', 'Property Tax', 'Sanitation', 'Development'];


function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('citizen');
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmpass: '',
    address: '',
    city: '',
    ward: '',
    workerId: '',
    department: '',
    zone: '',
    workingAddress: '',
    adminDepartment: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    if (!formData.fullname.trim()) return 'Full name is required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!formData.phone.trim()) return 'Phone number is required.';
    if (!formData.city) return 'Please select a city.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirmpass) return 'Passwords do not match.';

    if (role === 'citizen') {
      if (!formData.address.trim()) return 'Residential address is required.';
    }

    if (role === 'worker') {
      if (!formData.workerId.trim()) return 'Worker ID is required.';
      if (!formData.department) return 'Department is required.';
      if (!formData.workingAddress.trim()) return 'Working address is required.';
    }
    return null;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const extraData = {
        displayName: formData.fullname.trim(),
        phoneNumber: formData.phone.trim(),
        dob: formData.dob,
        city: formData.city,
      };

      if (role === 'citizen') {
        extraData.address = formData.address.trim();
        extraData.ward = formData.ward.trim();
      }

      if (role === 'worker') {
        extraData.workerId = formData.workerId.trim();
        extraData.department = formData.department;
        extraData.zone = formData.zone.trim();
        extraData.workingAddress = formData.workingAddress.trim();
      }

      const { user } = await registerUser(formData.email.trim(), formData.password, role, extraData);
      const token = await user.getIdToken();

      const userData = { ...extraData, uid: user.uid, email: user.email, role };
      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', role);
      localStorage.setItem('userData', JSON.stringify(userData));

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (role === 'citizen') navigate('/citizen-dashboard');
        else if (role === 'worker') navigate('/worker');
      }, 1200);

    } catch (err) {
      console.error('[Signup] Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 8 characters.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <header className="signup-hero">
        <div className="signup-hero__overlay" />
        <img src={Modi} alt="Urban Pragati" className="signup-hero__bg" />
        <div className="signup-hero__content container">
          <div className="signup-badge">Portal Registration</div>
          <h1 className="signup-hero__title">
            Join the Network
            <br />
            <span className="text-saffron" style={{ fontWeight: '800' }}>Urban Pragati</span>
          </h1>
          <p className="signup-hero__sub">Empowering citizens and workers to build better cities.</p>
        </div>
      </header>

      <main className="signup-main">
        <div className="signup-card">
          <div className="signup-card__header">
            <h2 className="section-title">Create an Account</h2>
            <p className="section-subtitle">Sign up to access your digital governance services.</p>
          </div>

          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${role === 'citizen' ? 'active' : ''}`}
              onClick={() => setRole('citizen')}
            >
              Citizen
            </button>
            <button
              type="button"
              className={`role-btn ${role === 'worker' ? 'active' : ''}`}
              onClick={() => setRole('worker')}
            >
              Municipal Worker
            </button>
          </div>

          <form className="signup-form" onSubmit={handleSignup} noValidate>
            {error && (
              <div className="form-error-box" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="form-success-box" role="status">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                {success}
              </div>
            )}

            {/* Personal Info */}
            <div className="signup-section-label">Personal Information</div>

            <div className="signup-row">
              <div className="form-group">
                <label htmlFor="fullname" className="form-label">Full Name *</label>
                <input id="fullname" type="text" className="form-input" placeholder="Rajesh Kumar" value={formData.fullname} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input id="email" type="email" className="form-input" placeholder="email@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="signup-row">
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input id="phone" type="tel" className="form-input" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="dob" className="form-label">Date of Birth</label>
                <input id="dob" type="date" className="form-input" value={formData.dob} onChange={handleChange} />
              </div>
            </div>

            {/* Address Info */}
            <div className="signup-section-label">Location Details</div>

            <div className="signup-row">
              <div className="form-group">
                <label htmlFor="city" className="form-label">City *</label>
                <select id="city" className="form-select" value={formData.city} onChange={handleChange} required>
                  <option value="">Select city</option>
                  <option>Solapur</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor={role === 'citizen' ? 'address' : 'workingAddress'} className="form-label">
                  {role === 'citizen' ? 'Residential Address *' : 'Working Address *'}
                </label>
                <input
                  id={role === 'citizen' ? 'address' : 'workingAddress'}
                  type="text"
                  className="form-input"
                  placeholder="Street, Ward, Sector"
                  value={role === 'citizen' ? formData.address : formData.workingAddress}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {role === 'citizen' && (
              <div className="form-group">
                <label htmlFor="ward" className="form-label">Ward / Zone</label>
                <input id="ward" type="text" className="form-input" placeholder="Ward 14 — North Zone" value={formData.ward} onChange={handleChange} />
              </div>
            )}

            {/* Worker Fields */}
            {role === 'worker' && (
              <>
                <div className="signup-section-label">Worker Details</div>
                <div className="signup-row">
                  <div className="form-group">
                    <label htmlFor="workerId" className="form-label">Worker ID *</label>
                    <input id="workerId" type="text" className="form-input" placeholder="WRK-XXX" value={formData.workerId} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zone" className="form-label">Assigned Zone</label>
                    <input id="zone" type="text" className="form-input" placeholder="North Zone" value={formData.zone} onChange={handleChange} />
                  </div>
                <div className="form-group">
                  <label htmlFor="department" className="form-label">Department *</label>
                  <select id="department" className="form-select" value={formData.department} onChange={handleChange} required>
                    <option value="">Select your department</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              </>
            )}

            {/* Password */}
            <div className="signup-section-label">Security</div>
            <div className="signup-row">
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password *</label>
                <input id="password" type="password" className="form-input" placeholder="Min. 8 characters" autoComplete="new-password" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="confirmpass" className="form-label">Confirm Password *</label>
                <input id="confirmpass" type="password" className="form-input" placeholder="Repeat password" autoComplete="new-password" value={formData.confirmpass} onChange={handleChange} required />
              </div>
            </div>

            <div className="signup-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {loading ? (
                  <>
                    <span className="login-spinner" aria-hidden="true" />
                    Creating Account...
                  </>
                ) : (
                  role === 'citizen' ? 'Create Citizen Account' : 'Register as Worker'
                )}
              </button>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ flex: 1, justifyContent: 'center' }}>
                Already have an account?
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="signup-footer">
        <p>© 2026 Urban Pragati — Ministry of Housing and Urban Affairs, Government of India</p>
      </footer>
    </div>
  );
}

export default Signup;
