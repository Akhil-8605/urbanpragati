import { Link } from 'react-router-dom';
import './CitizenFooter.css';
import Modi from "../../Auth/modi.webp";

const quickLinks = [
  { to: '/citizen/water',        label: 'Water Services'    },
  { to: '/citizen/electricity',  label: 'Electricity'       },
  { to: '/citizen/sanitation',   label: 'Sanitation'        },
  { to: '/citizen/property-tax', label: 'Property Tax'      },
  { to: '/citizen/road-repair',  label: 'Road Repair'       },
  { to: '/citizen/development',  label: 'Development Plans' },
];

function CitizenFooter() {
  return (
    <footer className="cfooter" role="contentinfo">
      <div className="cfooter__main container">
        <div className="cfooter__brand">
          <div className="cfooter__logo">
            <img
              src={Modi}
              alt="Prime Minister — Urban Pragati"
              className="cfooter__portrait"
            />
            <div>
              <div className="cfooter__brand-name">Urban Pragati</div>
              <div className="cfooter__brand-sub">Smart City Citizens Portal</div>
            </div>
          </div>
          <p className="cfooter__mission">
            Empowering millions of citizens with transparent, efficient, and
            tech-enabled urban services across India's growing cities.
          </p>
          <div className="cfooter__gov-seal">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 21h18M3 10h18M12 3L3 10v11M9 21V10m6 11V10"/>
            </svg>
            <span>Ministry of Housing and Urban Affairs<br />Government of India</span>
          </div>
        </div>

        <nav className="cfooter__col" aria-label="Quick links">
          <h3 className="cfooter__col-title">Services</h3>
          <ul role="list">
            {quickLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="cfooter__link">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="cfooter__col">
          <h3 className="cfooter__col-title">Contact</h3>
          <address className="cfooter__contact">
            <div className="cfooter__contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.97 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.88 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <span>1234567890</span>
            </div>
            <div className="cfooter__contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>urbanpragati@gmail.com</span>
            </div>
            <div className="cfooter__contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Solapur</span>
            </div>
          </address>

        </div>
      </div>

      <div className="cfooter__bottom">
        <div className="container cfooter__bottom-inner">
          <p>© 2026 Urban Pragati by LowIQBoys. All rights reserved. Government of India.</p>
        </div>
      </div>
    </footer>
  );
}

export default CitizenFooter;
