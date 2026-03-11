import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './SanitationService.css';
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

const ISSUE_TYPES = ['Garbage not collected', 'Open drain / nala', 'Sewage blockage', 'Public toilet maintenance', 'Littering / Illegal dumping', 'Dead animal on road', 'Overflowing bin'];
const URGENCY_LEVELS = ['Normal (within 3 days)', 'Urgent (within 24 hours)', 'Emergency (immediate)'];

const INITIAL_FORM = { name: '', phone: '', address: '', issueType: '', urgency: '', description: '', proofImage: null, previewUrl: null, coordinates: null };

export default function SanitationService() {
  const [complaints, setComplaints] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const u = JSON.parse(stored);
      setFormData((f) => ({ ...f, name: u.displayName || u.name || '', phone: u.phoneNumber || u.phone || '', address: u.address || '' }));
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    try { setComplaints(await getComplaintsByDepartment('Sanitation')); }
    catch (err) { console.error('[SanitationService] fetch error:', err); }
    finally { setLoadingComplaints(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    setFormData((f) => ({ ...f, proofImage: file, previewUrl: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.address.trim()) { setError('Address is required.'); return; }
    if (!formData.issueType) { setError('Please select an issue type.'); return; }
    if (!formData.description.trim()) { setError('Please describe the issue.'); return; }

    setSubmitting(true); setError(''); setSuccessMsg('');
    try {
      let imageUrl = null;
      if (formData.proofImage) imageUrl = await uploadImageToImageKit(formData.proofImage, '/complaints/sanitation');

      const stored = localStorage.getItem('userData');
      const user = stored ? JSON.parse(stored) : {};

      await createComplaint({
        category: 'Sanitation', department: 'Sanitation',
        issueType: formData.issueType, urgency: formData.urgency,
        description: formData.description.trim(), address: formData.address.trim(),
        coordinates: formData.coordinates || null, name: formData.name.trim(),
        phone: formData.phone.trim(), userId: user.uid || null,
        userEmail: user.email || null, imageUrl, status: 'Pending',
      });

      if (user.uid) {
        await addCitizenPoints(user.uid, 10);
        localStorage.setItem('userData', JSON.stringify({ ...user, rewardPoints: (user.rewardPoints || 0) + 10 }));
      }

      setSuccessMsg('Complaint submitted! +10 Pragati Points earned.');
      setFormData((f) => ({ ...INITIAL_FORM, name: f.name, phone: f.phone }));
      fetchComplaints();
      navigate('/citizen-dashboard');
    } catch (err) {
      console.error('[SanitationService] submit error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="san-service-page">
      <CitizenNavbar />
      <main className="san-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/citizen-dashboard">Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>Sanitation Services</span>
        </nav>

        <header className="service-page-header san-header">
          <div className="service-header-icon">
            <svg viewBox="0 0 64 64" fill="none">
              <rect x="16" y="24" width="32" height="28" rx="4" fill="#006400" opacity="0.15" stroke="#006400" strokeWidth="2.5" />
              <path d="M24 24V18a8 8 0 0 1 16 0v6" stroke="#006400" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M32 34v8" stroke="#006400" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="service-header-text">
            <h1>Sanitation Services</h1>
            <p>Report garbage collection failures, open drains, sewage blockages, and public toilet maintenance issues.</p>
          </div>
        </header>

        <div className="service-two-col">
          <section className="service-left-col">
            <div className="service-info-card card">
              <h2>Report a Sanitation Issue</h2>
              <p className="service-form-intro">Help us keep your city clean. Emergency reports are prioritized within 24 hours. Earn <strong>+10 Pragati Points</strong> per complaint.</p>

              <form className="service-form" onSubmit={handleSubmit} noValidate>
                {error && <div className="form-error-box" role="alert">{error}</div>}
                {successMsg && <div className="form-success-box" role="status">{successMsg}</div>}

                <div className="form-group">
                  <label htmlFor="s-name" className="form-label">Full Name</label>
                  <input id="s-name" type="text" className="form-input" placeholder="Priya Verma" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="s-phone" className="form-label">Mobile Number</label>
                  <input id="s-phone" type="tel" className="form-input" placeholder="9876543210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label htmlFor="s-address" className="form-label">Address / Location *</label>
                  <input id="s-address" type="text" className="form-input" placeholder="Street, Ward, Sector" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label htmlFor="s-issue" className="form-label">Issue Type *</label>
                  <select id="s-issue" className="form-select" value={formData.issueType} onChange={e => setFormData({ ...formData, issueType: e.target.value })} required>
                    <option value="">-- Select Issue --</option>
                    {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="s-urgency" className="form-label">Urgency Level</label>
                  <select id="s-urgency" className="form-select" value={formData.urgency} onChange={e => setFormData({ ...formData, urgency: e.target.value })}>
                    <option value="">-- Select Urgency --</option>
                    {URGENCY_LEVELS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="s-desc" className="form-label">Description *</label>
                  <textarea id="s-desc" className="form-textarea" rows={4} placeholder="Describe the sanitation issue in detail..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload Photo (optional)</label>
                  <label className={`file-upload-area ${formData.proofImage ? 'uploaded' : ''}`} htmlFor="s-photo" style={{ cursor: 'pointer' }}>
                    {formData.previewUrl ? (
                      <div className="file-preview">
                        <img src={formData.previewUrl} alt="Preview" className="file-preview-img" />
                        <span className="file-preview-name">{formData.proofImage?.name}</span>
                      </div>
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                        <span className="file-upload-area__text">Click to upload or drag &amp; drop</span>
                        <span className="file-upload-area__hint">JPG, PNG up to 5 MB</span>
                      </>
                    )}
                    <input id="s-photo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">Pin Location on Map</label>
                  <LocationPicker coordinates={formData.coordinates} onChange={(coords) => setFormData({ ...formData, coordinates: coords })} />
                </div>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
                  {submitting ? <><span className="btn-spinner" aria-hidden="true" /> Submitting...</> : 'Submit Complaint'}
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
            <h2 className="section-heading">Recent Sanitation Complaints</h2>
            <div className="complaint-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              {loadingComplaints ? <p className="service-loading">Loading...</p>
                : complaints.length === 0 ? <p className="service-empty">No complaints filed yet.</p>
                  : complaints.map(c => (
                    <ComplaintCard key={c.id} complaint={{
                      id: c.id.slice(-6).toUpperCase(), title: c.issueType || c.category,
                      location: c.address, status: c.status,
                      date: c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('en-IN') : 'N/A',
                    }} />
                  ))
              }
            </div>
            <div className="map-section" style={{ marginTop: '2rem' }}>
              <h3 className="section-heading sm">Issue Hotspots</h3>
              <div style={{ height: 300, borderRadius: 10, overflow: 'hidden', border: '1.5px solid var(--color-gray-100)' }}>
                <MapContainer center={[17.6868, 75.9042]} zoom={12} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  {complaints.filter(c => c.coordinates?.lat).map(c => (
                    <Marker key={c.id} position={[c.coordinates.lat, c.coordinates.lng]}>
                      <Popup><strong>{c.issueType || 'Sanitation'}</strong><br />{c.address}<br />Status: <strong>{c.status}</strong></Popup>
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
