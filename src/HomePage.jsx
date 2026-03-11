import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CitizenNavbar from './Citizens/components/CitizenNavbar';
import CitizenFooter from './Citizens/components/CitizenFooter';
import ComplaintCard from './Citizens/components/ComplaintCard';
import LeaderboardCard from './Citizens/components/LeaderboardCard';
import { getAllComplaints, getTopCitizens, getAllFeedbacks } from './firebaseOperations/db';
import './HomePage.css';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const steps = [
  { num: '01', title: 'Register', desc: 'Create your free citizen account in minutes.', icon: '👤' },
  { num: '02', title: 'Report', desc: 'Log any civic issue with a photo and your location.', icon: '📷' },
  { num: '03', title: 'Track', desc: 'Watch real-time status updates as your complaint is resolved.', icon: '📡' },
  { num: '04', title: 'Rate & Earn', desc: 'Rate resolved issues and earn Pragati Points for being proactive.', icon: '⭐' },
];
function HomePage() {
  const [complaints, setComplaints] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [stats, setStats] = useState({
    registered: 0,
    resolved: 0,
    rating: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const compData = await getAllComplaints();
      const mappedComplaints = compData.map(c => {
        const dateStr = c.createdAt?.toDate ? c.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString();
        return {
          id: c.id.slice(-6).toUpperCase(),
          title: c.category || c.department,
          location: c.address,
          date: dateStr,
          status: c.status,
          dept: c.department || c.category,
          lat: c.coordinates?.lat,
          lng: c.coordinates?.lng
        };
      });
      setComplaints(mappedComplaints);

      const citData = await getTopCitizens();
      setCitizens(citData);

      const feedData = await getAllFeedbacks();
      
      const resolvedCount = compData.filter(c => c.status === 'Resolved' || c.status === 'Completed').length;
      
      let sumRating = 0;
      let countRating = 0;
      feedData.forEach(f => {
        if (f.rating) {
          sumRating += Number(f.rating);
          countRating++;
        }
      });
      const avgRating = countRating > 0 ? (sumRating / countRating).toFixed(1) : "0";

      setStats({
        registered: citData.length,
        resolved: resolvedCount,
        rating: avgRating,
      });

    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="cdash-page">
      <CitizenNavbar />
      <section className="cdash-hero" aria-labelledby="hero-title">
        <img
          src="https://images.unsplash.com/photo-1531219572328-a0171b4448a3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNpdHl8ZW58MHwwfDB8fHww"
          alt="Smart City"
          className="cdash-hero__bg"
        />
        <div className="cdash-hero__overlay" />
        <div className="container cdash-hero__content">
          <div className="cdash-hero-top">
            <div className="cdash-hero__badge">
              Government of India — Smart City Initiative
            </div>
          </div>
          <h1 className="cdash-hero__title" id="hero-title">
            Urban Pragati
          </h1>
          <p className="cdash-hero__tagline">
            Empowering Citizens, Improving Cities
          </p>
          <p className="cdash-hero__sub">
            Report civic issues, track resolutions, pay taxes, and vote on city
            projects — all in one unified digital platform.
          </p>
          <div className="cdash-hero__ctas">
            {localStorage.getItem('userToken') ? (
              <a href="/citizen-dashboard" className="btn-primary">
                Explore Citizen Dashboard
              </a>
            ) : (
              <a href="/login" className="btn-primary">
                Get Started by Login/Signup
              </a>
            )}
          </div>
          <div className="cdash-hero__stats">
            {[
              { num: stats.registered, label: "Citizens Registered" },
              { num: stats.resolved, label: "Issues Resolved" },
              { num: `${stats.rating}★`, label: "Average Rating" },
            ].map((s, i) => (
              <div key={i} className="cdash-hero-stat">
                <span className="cdash-hero-stat__num">{s.num}</span>
                <span className="cdash-hero-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <main>
        <section className="cdash-how" aria-labelledby="how-heading">
          <div className="container">
            <div className="text-center" style={{ marginBottom: 'var(--space-10)' }}>
              <h2 className="section-title" id="how-heading">How It Works</h2>
              <p className="section-subtitle">Four simple steps to a better city</p>
            </div>
            <div className="cdash-steps">
              {steps.map((step, i) => (
                <div key={i} className="cdash-step fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="cdash-step__num">{step.num}</div>
                  <div className="cdash-step__icon" aria-hidden="true">{step.icon}</div>
                  <h3 className="cdash-step__title">{step.title}</h3>
                  <p className="cdash-step__desc">{step.desc}</p>
                  {i < steps.length - 1 && (
                    <div className="cdash-step__arrow" aria-hidden="true">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="cdash-section" aria-labelledby="complaints-heading">
          <div className="container">
            <div className="cdash-2col">
              <div>
                <div className="cdash-section-header" style={{ marginBottom: 'var(--space-4)' }}>
                  <div>
                    <h2 className="section-title" id="complaints-heading">Recent Complaints</h2>
                    <p className="section-subtitle">Your latest civic reports</p>
                  </div>
                  <button className="btn btn-outline btn-sm">View All</button>
                </div>
                <div className="cdash-complaints-list" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {complaints.map((c, i) => (
                    <ComplaintCard key={i} complaint={c} />
                  ))}
                  {complaints.length === 0 && <p>No recent complaints found.</p>}
                </div>
              </div>
              <div>
                <div className="cdash-section-header" style={{ marginBottom: 'var(--space-4)' }}>
                  <div>
                    <h2 className="section-title">Complaint Map</h2>
                    <p className="section-subtitle">Issues near your location</p>
                  </div>
                </div>
                <div style={{ height: 360, width: '100%', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                  <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {complaints.filter(pin => pin.lat && pin.lng).map((pin) => (
                      <Marker key={pin.id} position={[pin.lat, pin.lng]}>
                        <Popup>
                          <strong>{pin.title}</strong><br />
                          {pin.location}<br />
                          <span style={{ color: '#ff7a18' }}>{pin.status}</span>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="cdash-leaderboard" aria-labelledby="lb-heading">
          <div className="container">
            <div className="cdash-section-header" style={{ marginBottom: 'var(--space-6)' }}>
              <div>
                <h2 className="section-title" id="lb-heading">Best Citizens of the Month</h2>
                <p className="section-subtitle">Celebrating proactive civic contributors</p>
              </div>
              <a href="/citizen/best-citizen" className="btn btn-ghost btn-sm">Full Leaderboard</a>
            </div>
            <div className="cdash-lb-grid">
              {citizens.map((c, i) => (
                <LeaderboardCard 
                  key={c.uid || i} 
                  entry={{
                    name: c.displayName || c.name || 'Citizen',
                    city: c.city || 'India',
                    points: c.points || c.rewardPoints || 0,
                    complaints: c.totalComplaints || 0,
                    verified: c.resolvedComplaints || 0,
                    avatar: c.photoURL || null,
                  }} 
                  rank={i + 1} 
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <CitizenFooter />
    </div>
  );
}
export default HomePage;
