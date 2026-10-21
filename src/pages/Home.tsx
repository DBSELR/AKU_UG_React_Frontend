import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { useTheme } from '../theme/ThemeContext';
import './Home.css';

interface LoginModalProps {
  type: 'UG' | 'PG';
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ type, isOpen, onClose }) => {
  const [collegeCode, setCollegeCode] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeCode.trim() || !password.trim()) {
      alert('Please enter College Code and Password.');
      return;
    }
    alert(`Attempting ${type} Degree College Login for Code: ${collegeCode}`);
  };

  return (
    <div className="aku-modal-backdrop" onClick={onClose}>
      <div className="aku-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="aku-modal-header">
          <h3>{type === 'UG' ? 'UG DEGREE COLLEGE LOGIN' : 'PG, PROFESSIONAL COLLEGE LOGIN'}</h3>
          <button className="aku-modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="aku-modal-body">
          <div className="aku-form-group">
            <label htmlFor="collegeCode">College Code / User ID</label>
            <input
              id="collegeCode"
              type="text"
              className="aku-form-control"
              placeholder="Enter College Code"
              value={collegeCode}
              onChange={(e) => setCollegeCode(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="aku-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="aku-form-control"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="aku-modal-actions">
            <button type="button" className="aku-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={`aku-btn ${type === 'UG' ? 'aku-btn-ug' : 'aku-btn-pg'}`}
              style={{ minWidth: '120px', minHeight: '40px', padding: '8px 16px' }}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode, setShowThemeModal } = useTheme();

  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; type: 'UG' | 'PG' }>({
    isOpen: false,
    type: 'UG',
  });

  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const openLogin = (type: 'UG' | 'PG') => {
    setLoginModal({ isOpen: true, type });
  };

  const closeLogin = () => {
    setLoginModal({ isOpen: false, type: 'UG' });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-page-container">
          {/* Top Header */}
          <header className="aku-header">
            {/* Left University Logo Block */}
            <div className="aku-brand-container">
              <a className="aku-brand" title="Andhra Kesari University">
                <img
                  src="/assets/logo.png"
                  alt="Andhra Kesari University"
                  className="aku-brand-logo"
                />
              </a>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              className="aku-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>

            {/* Desktop Navbar */}
            <nav className="aku-navbar">
              <ul className="aku-nav-list">
                {/* Working hours */}
                <li className="aku-nav-item">
                  <a className="aku-nav-link aku-nav-timing" title="Operating Hours">
                    <span className="aku-clock-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                    <span>Mon-Sat : 10:00 AM to 5:30 PM</span>
                  </a>
                </li>

                {/* Home */}
                <li className="aku-nav-item">
                  <a className="aku-nav-link" onClick={() => navigate('/home')}>
                    Home
                  </a>
                </li>

                {/* About Us Dropdown */}
                <li className="aku-nav-item aku-dropdown" ref={dropdownRef}>
                  <button
                    type="button"
                    className="aku-nav-link aku-dropdown-toggle"
                    onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                    aria-expanded={aboutDropdownOpen}
                  >
                    <span>About Us</span>
                    <span className={`aku-dropdown-arrow ${aboutDropdownOpen ? 'open' : ''}`}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </button>

                  {aboutDropdownOpen && (
                    <div className="aku-dropdown-menu">
                      <button
                        type="button"
                        className="aku-dropdown-item"
                        onClick={() => { setAboutDropdownOpen(false); alert('About Andhra Kesari University'); }}
                      >
                        About Us
                      </button>
                      <button
                        type="button"
                        className="aku-dropdown-item"
                        onClick={() => { setAboutDropdownOpen(false); alert('Contact Support: 9948708389'); }}
                      >
                        Contact Us
                      </button>
                      <button
                        type="button"
                        className="aku-dropdown-item"
                        onClick={() => { setAboutDropdownOpen(false); alert('Refund & Cancellation Policy'); }}
                      >
                        Refund &amp; Cancellation
                      </button>
                      <button
                        type="button"
                        className="aku-dropdown-item"
                        onClick={() => { setAboutDropdownOpen(false); alert('Terms and Conditions & Privacy Policy'); }}
                      >
                        Term and Conditions &amp; Privacy Policy
                      </button>
                    </div>
                  )}
                </li>

                {/* Challan Payment */}
                <li className="aku-nav-item">
                  <button
                    type="button"
                    onClick={() => alert('Online Challan Payment Gateway')}
                    className="aku-nav-link aku-challan-link"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                    title="Pay Challan Online"
                  >
                    <span>CHALLAN PAYMENT</span>
                    <img
                      src="/assets/anew.gif"
                      alt="New"
                      className="aku-new-badge"
                    />
                  </button>
                </li>

                {/* Quick Theme Switcher in Navbar */}
                <li className="aku-nav-item aku-header-theme-group">
                  <button
                    type="button"
                    className="aku-theme-btn"
                    onClick={() => setShowThemeModal(true)}
                    title="Open Theme Studio (Change Theme Color)"
                  >
                    <span className="aku-theme-dot"></span>
                    <span>Themes</span>
                  </button>
                  <button
                    type="button"
                    className="aku-theme-btn"
                    onClick={toggleDarkMode}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  >
                    <span>{isDark ? '☀️' : '🌙'}</span>
                  </button>
                </li>
              </ul>
            </nav>
          </header>

          {/* Mobile dropdown menu */}
          <div className={`aku-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="aku-nav-link aku-nav-timing">
              <span>🕒 Mon-Sat : 10:00 AM to 5:30 PM</span>
            </div>
            <button
              onClick={() => { setMobileMenuOpen(false); navigate('/home'); }}
              className="aku-nav-link"
              style={{ textAlign: 'left', background: 'transparent', border: 'none' }}
            >
              Home
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                alert('About Andhra Kesari University');
              }}
              className="aku-nav-link"
              style={{ textAlign: 'left', background: 'transparent', border: 'none' }}
            >
              About Us
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                alert('Contact Support: 9948708389');
              }}
              className="aku-nav-link"
              style={{ textAlign: 'left', background: 'transparent', border: 'none' }}
            >
              Contact Us
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                alert('Online Challan Payment Gateway');
              }}
              className="aku-nav-link aku-challan-link"
              style={{ textAlign: 'left', background: 'transparent', border: 'none' }}
            >
              <span>CHALLAN PAYMENT</span>
              <img src="/assets/anew.gif" alt="New" className="aku-new-badge" />
            </button>
            <button
              type="button"
              className="aku-nav-link"
              onClick={() => {
                setMobileMenuOpen(false);
                setShowThemeModal(true);
              }}
              style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#ffffff' }}
            >
              🎨 Theme Studio
            </button>
          </div>

          {/* Main Content Area */}
          <main className="aku-main-content">
            <div className="aku-card">
              <h1 className="aku-university-title">ANDHRA KESARI UNIVERSITY-ONGOLE</h1>
              <p className="aku-university-subtitle">ACT No. 21 of 2021;Govt Of AP.</p>

              {/* University Banner Image */}
              <div className="aku-banner-wrapper">
                <img
                  src="/assets/main.jpg"
                  alt="Andhra Kesari University Banner"
                  className="aku-banner-image"
                />
              </div>

              {/* Action Buttons with 3D Icons & Elevation */}
              <div className="aku-action-buttons">
                <button
                  type="button"
                  className="aku-btn aku-btn-ug"
                  onClick={() => navigate('/login')}
                  title="UG Degree College Login"
                >
                  <span className="aku-btn-icon">🎓</span>
                  <span>UG DEGREE COLLEGE LOGIN</span>
                </button>

                <button
                  type="button"
                  className="aku-btn aku-btn-pg"
                  onClick={() => openLogin('PG')}
                  title="PG, Professional College Login"
                >
                  <span className="aku-btn-icon">🏛️</span>
                  <span>PG, PROFESSIONAL COLLEGE LOGIN</span>
                </button>

                <button
                  type="button"
                  className="aku-btn aku-btn-admin"
                  onClick={() => navigate('/admin-login')}
                  title="UG Administrator Login"
                >
                  <span className="aku-btn-icon">🛡️</span>
                  <span>UG ADMIN LOGIN</span>
                </button>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="aku-footer">
            <p className="aku-footer-text">
              Copyright{' '}
              <a
                href="https://akuprakasam.ac.in/"
                target="_blank"
                rel="noreferrer"
                className="aku-footer-highlight"
              >
                &copy; 2023 Andhra Kesari University.
              </a>{' '}
              All rights reserved. Developed by{' '}
              <a
                href="http://dbasesolutions.in/"
                target="_blank"
                rel="noreferrer"
                className="aku-footer-highlight"
              >
                D Base Solutions Private Limited.,
              </a>
              <span className="aku-support-contact">
                &nbsp;&nbsp;&nbsp;&nbsp;FOR SUPPORT CONTACT : 9948708389
              </span>
            </p>
          </footer>

          {/* Floating D Base Badge */}
          <a
            href="http://dbasesolutions.in/"
            target="_blank"
            rel="noreferrer"
            className="aku-floating-badge"
            title="Developed by D Base Solutions Private Limited."
          >
            <img src="/assets/dbase.png" alt="D Base Solutions" />
          </a>

          {/* Interactive College Login Modal */}
          <LoginModal
            type={loginModal.type}
            isOpen={loginModal.isOpen}
            onClose={closeLogin}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
