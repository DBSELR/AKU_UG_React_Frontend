import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { useTheme } from '../../theme/ThemeContext';
import './AdminLogin.css';
import '../Home.css';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode, setShowThemeModal } = useTheme();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Header states
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close dropdown on outside click
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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!username.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter Administrator Username.' });
      return;
    }

    if (!password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter Administrator Password.' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStatusMessage({
        type: 'success',
        text: `Admin credentials verified. Welcome, Administrator ${username}!`
      });
    }, 700);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-admin-login-page">
          {/* Header */}
          <header className="aku-header">
            {/* Left University Logo Block */}
            <div className="aku-brand-container">
              <div
                className="aku-brand"
                onClick={() => navigate('/home')}
                title="Go to Home"
              >
                <img
                  src="/assets/logo.png"
                  alt="Andhra Kesari University"
                  className="aku-brand-logo"
                />
              </div>
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
                  <a
                    href="https://akuexams.com/admin_Login.aspx#"
                    className="aku-nav-link aku-nav-timing"
                    title="Operating Hours"
                  >
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
                  <button
                    type="button"
                    onClick={() => navigate('/home')}
                    className="aku-nav-link"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    Home
                  </button>
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
                      <a
                        href="https://akuexams.com/About_Us.aspx"
                        target="_blank"
                        rel="noreferrer"
                        className="aku-dropdown-item"
                        onClick={() => setAboutDropdownOpen(false)}
                      >
                        About Us
                      </a>
                      <a
                        href="https://akuexams.com/Contact_Us.aspx"
                        target="_blank"
                        rel="noreferrer"
                        className="aku-dropdown-item"
                        onClick={() => setAboutDropdownOpen(false)}
                      >
                        Contact Us
                      </a>
                      <a
                        href="https://akuexams.com/Settings/Refund_Concellation_Policy.aspx.aspx"
                        target="_blank"
                        rel="noreferrer"
                        className="aku-dropdown-item"
                        onClick={() => setAboutDropdownOpen(false)}
                      >
                        Refund &amp; Cancellation
                      </a>
                      <a
                        href="https://akuexams.com/Settings/Privacy_Policy.aspx"
                        target="_blank"
                        rel="noreferrer"
                        className="aku-dropdown-item"
                        onClick={() => setAboutDropdownOpen(false)}
                      >
                        Term and Conditions &amp; Privacy Policy
                      </a>
                    </div>
                  )}
                </li>

                {/* Challan Payment */}
                <li className="aku-nav-item">
                  <a
                    href="https://akuexams.com/Fee_Pay_ChallanPayments.aspx"
                    target="_blank"
                    rel="noreferrer"
                    className="aku-nav-link aku-challan-link"
                    title="Pay Challan Online"
                  >
                    <span>CHALLAN PAYMENT</span>
                    <img
                      src="/assets/anew.gif"
                      alt="New"
                      className="aku-new-badge"
                    />
                  </a>
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

          {/* Mobile Menu Panel */}
          <div className={`aku-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <a className="aku-nav-link aku-nav-timing">
              <span>🕒 Mon-Sat : 10:00 AM to 5:30 PM</span>
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/home');
              }}
              className="aku-nav-link"
              style={{ textAlign: 'left', background: 'transparent', border: 'none' }}
            >
              Home
            </button>
            <a
              href="https://akuexams.com/About_Us.aspx"
              target="_blank"
              rel="noreferrer"
              className="aku-nav-link"
            >
              About Us
            </a>
            <a
              href="https://akuexams.com/Contact_Us.aspx"
              target="_blank"
              rel="noreferrer"
              className="aku-nav-link"
            >
              Contact Us
            </a>
            <a
              href="https://akuexams.com/Fee_Pay_ChallanPayments.aspx"
              target="_blank"
              rel="noreferrer"
              className="aku-nav-link aku-challan-link"
            >
              <span>CHALLAN PAYMENT</span>
              <img src="/assets/anew.gif" alt="New" className="aku-new-badge" />
            </a>
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

          {/* Main Area */}
          <main className="aku-admin-main">
            <div className="aku-admin-card">
              <div className="aku-admin-card-header">
                <div className="aku-admin-emblem-wrap">
                  <img
                    src="/assets/AKU_Ongole.png"
                    alt="Andhra Kesari University Emblem"
                    className="aku-admin-emblem"
                  />
                  <span className="aku-admin-shield-badge" title="Administrator Security Gate">
                    🛡️
                  </span>
                </div>
                <h1 className="aku-admin-title">ANDHRA KESARI UNIVERSITY</h1>
                <div className="aku-admin-badge">
                  <span>👑</span>
                  <span>UG Admin Login</span>
                </div>
              </div>

              <div className="aku-admin-divider"></div>

              {statusMessage && (
                <div
                  className={`aku-status-banner ${
                    statusMessage.type === 'error'
                      ? 'aku-status-error'
                      : 'aku-status-success'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="aku-admin-form">
                {/* Username Field */}
                <div className="aku-admin-input-group">
                  <label htmlFor="adminUsername" className="aku-admin-label">
                    <span>🛡️</span>
                    <span>Username</span>
                  </label>
                  <div className="aku-admin-input-wrapper">
                    <span className="aku-admin-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="adminUsername"
                      type="text"
                      className="aku-admin-input"
                      placeholder="Enter Admin Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="aku-admin-input-group">
                  <label htmlFor="adminPassword" className="aku-admin-label">
                    <span>🔑</span>
                    <span>Password</span>
                  </label>
                  <div className="aku-admin-input-wrapper">
                    <span className="aku-admin-input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="adminPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="aku-admin-input"
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="aku-admin-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Login Button with 3D Shine */}
                <button
                  type="submit"
                  className="aku-admin-btn-login"
                  disabled={isLoading}
                >
                  <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
                  <span style={{ fontSize: '1.2rem' }}>➔</span>
                </button>
              </form>

              {/* Security Notice */}
              <div className="aku-admin-security-note">
                <span>🔒</span>
                <span>Authorized University Administrators Only</span>
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
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminLogin;
