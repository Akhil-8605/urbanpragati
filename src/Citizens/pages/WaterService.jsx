import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './WaterService.css';
import CitizenNavbar from '../components/CitizenNavbar';
import CitizenFooter from '../components/CitizenFooter';
import ComplaintCard from '../components/ComplaintCard';
import LocationPicker from '../components/LocationPicker';
import '../components/LocationPicker.css';
import { createComplaint, getComplaintsByDepartment } from '../../firebaseOperations/db';
import { addCitizenPoints } from '../../firebaseOperations/auth';
import { uploadImageToImageKit } from '../../utils/imagekit';
import { useNavigate } from 'react-router-dom';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ISSUE_TYPES = ['Pipe leakage', 'No water supply', 'Low water pressure', 'Water contamination', 'New connection request', 'Meter issue', 'Billing dispute'];

const INITIAL_FORM = {
  name: '', phone: '', address: '', issueType: '', description: '',
  proofImage: null, previewUrl: null,
  coordinates: null,
};

export default function WaterService() {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const navigate = useNavigate();

  // Pre-fill name and phone from logged-in user
  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const u = JSON.parse(stored);
      setFormData((f) => ({
        ...f,
        name: u.displayName || u.name || '',
        phone: u.phoneNumber || u.phone || '',
        address: u.address || '',
      }));
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try {
      const data = await getComplaintsByDepartment('Water');
      setComplaints(data);
    } catch (err) {
      console.error('[WaterService] fetchComplaints error:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setFormData((f) => ({ ...f, proofImage: file, previewUrl }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) { setError('Address is required.'); return; }
    if (!formData.issueType) { setError('Please select an issue type.'); return; }
    if (!formData.description.trim()) { setError('Please describe the issue.'); return; }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      let imageUrl = null;
      if (formData.proofImage) {
        imageUrl = await uploadImageToImageKit(formData.proofImage, '/complaints/water');
      }

      const stored = localStorage.getItem('userData');
      const user = stored ? JSON.parse(stored) : {};

      const complaintData = {
        category: 'Water',
        department: 'Water',
        issueType: formData.issueType,
        description: formData.description.trim(),
        address: formData.address.trim(),
        coordinates: formData.coordinates || null,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        userId: user.uid || null,
        userEmail: user.email || null,
        imageUrl: imageUrl,
        status: 'Pending',
      };

      await createComplaint(complaintData);

      // Award 10 points
      if (user.uid) {
        await addCitizenPoints(user.uid, 10);
        const updatedUser = { ...user, rewardPoints: (user.rewardPoints || 0) + 10 };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }

      setSuccessMsg('Complaint submitted successfully! +10 Pragati Points earned.');
      setFormData((f) => ({ ...INITIAL_FORM, name: f.name, phone: f.phone }));
      fetchComplaints();
      navigate('/citizen-dashboard');
    } catch (err) {
      console.error('[WaterService] submit error:', err);
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="water-service-page">
      <CitizenNavbar />
      <main className="water-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/citizen-dashboard">Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>Water Supply Services</span>
        </nav>

        <header className="service-page-header water-header">
          <div className="service-header-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 4C32 4 10 28 10 40a22 22 0 0 0 44 0C54 28 32 4 32 4z" fill="#0B5FFF" opacity="0.2" stroke="#0B5FFF" strokeWidth="2.5" />
              <path d="M22 44a10 10 0 0 0 14 0" stroke="#0B5FFF" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="service-header-text">
            <h1>Water Supply Services</h1>
            <p>Report water supply issues, pipe leakages, contamination, and request new connections.</p>
          </div>
        </header>

        <div className="service-two-col">
          <section className="service-left-col">
            <div className="service-info-card card">
              <h2>Report a Water Issue</h2>
              <p className="service-form-intro">Fill in the details below to register your complaint. Our team will respond within 48 hours. You earn <strong>+10 Pragati Points</strong> for each submission.</p>

              <form className="service-form" onSubmit={handleSubmit} aria-label="Water complaint form" noValidate>
                {error && <div className="form-error-box" role="alert">{error}</div>}
                {successMsg && <div className="form-success-box" role="status">{successMsg}</div>}

                <div className="form-group">
                  <label htmlFor="w-name" className="form-label">Your Full Name</label>
                  <input id="w-name" type="text" className="form-input" placeholder="Rajesh Kumar" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div className="form-group">
                  <label htmlFor="w-phone" className="form-label">Mobile Number</label>
                  <input id="w-phone" type="tel" className="form-input" placeholder="9876543210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="form-group">
                  <label htmlFor="w-address" className="form-label">Address / Location *</label>
                  <input id="w-address" type="text" className="form-input" placeholder="Street, Ward, Sector" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                </div>

                <div className="form-group">
                  <label htmlFor="w-issue" className="form-label">Issue Type *</label>
                  <select id="w-issue" className="form-select" value={formData.issueType} onChange={e => setFormData({ ...formData, issueType: e.target.value })} required>
                    <option value="">-- Select Issue Type --</option>
                    {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="w-desc" className="form-label">Description *</label>
                  <textarea id="w-desc" className="form-textarea" rows={4} placeholder="Describe your issue in detail — when it started, severity, any prior complaints..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label className="form-label">Upload Photo (optional)</label>
                  <label className={`file-upload-area ${formData.proofImage ? 'uploaded' : ''}`} htmlFor="w-photo" style={{ cursor: 'pointer' }}>
                    {formData.previewUrl ? (
                      <div className="file-preview">
                        <img src={formData.previewUrl} alt="Complaint preview" className="file-preview-img" />
                        <span className="file-preview-name">{formData.proofImage?.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        <span className="file-upload-area__text">Click to upload or drag &amp; drop</span>
                        <span className="file-upload-area__hint">JPG, PNG up to 5 MB</span>
                      </>
                    )}
                    <input id="w-photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                  </label>
                </div>

                {/* Location Picker */}
                <div className="form-group">
                  <label className="form-label">Pin Location on Map</label>
                  <LocationPicker
                    coordinates={formData.coordinates}
                    onChange={(coords) => setFormData({ ...formData, coordinates: coords })}
                  />
                </div>

                <button type="submit" disabled={submitting} className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                  {submitting ? (
                    <><span className="btn-spinner" aria-hidden="true" /> Submitting...</>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </form>
            </div>

            <div className="service-mini-stats">
              <div className="mini-stat-card">
                <span className="mini-stat-num">{complaints.length}</span>
                <span className="mini-stat-label">Total Complaints</span>
              </div>
              <div className="mini-stat-card">
                <span className="mini-stat-num">{complaints.filter(c => c.status === 'Resolved' || c.status === 'Done').length}</span>
                <span className="mini-stat-label">Resolved</span>
              </div>
              <div className="mini-stat-card">
                <span className="mini-stat-num">{complaints.filter(c => c.status === 'Pending').length}</span>
                <span className="mini-stat-label">Pending</span>
              </div>
            </div>
          </section>

          <section className="service-right-col">
            <h2 className="section-heading">Recent Water Complaints</h2>
            <div className="complaint-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {loadingComplaints ? (
                <p className="service-loading">Loading complaints...</p>
              ) : complaints.length === 0 ? (
                <p className="service-empty">No complaints filed yet.</p>
              ) : (
                complaints.map(c => (
                  <ComplaintCard key={c.id} complaint={{
                    id: c.id.slice(-6).toUpperCase(),
                    title: c.issueType || c.category,
                    location: c.address,
                    date: c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'N/A',
                    status: c.status,
                  }} />
                ))
              )}
            </div>

            <div className="map-section" style={{ marginTop: '2rem' }}>
              <h3 className="section-heading sm">Complaint Hotspots</h3>
              <div style={{ height: 300, width: '100%', borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--color-gray-100)' }}>
                <MapContainer center={[17.6868, 75.9042]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  {complaints.filter(c => c.coordinates?.lat).map(c => (
                    <Marker key={c.id} position={[c.coordinates.lat, c.coordinates.lng]}>
                      <Popup>
                        <strong>{c.issueType || 'Water Issue'}</strong><br />
                        {c.address}<br />
                        Status: <strong>{c.status}</strong>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </section>
        </div>
      </main>
      <CitizenFooter />
    </div>
  );
}
