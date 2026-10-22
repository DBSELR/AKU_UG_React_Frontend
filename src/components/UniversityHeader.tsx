import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';

const UniversityHeader: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode, setShowThemeModal } = useTheme();
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setAboutDropdownOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, []);

  const openAboutPage = (path: string) => {
    setAboutDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="aku-header">
        <div className="aku-brand-container">
          <button type="button" className="aku-brand" onClick={() => navigate('/home')} title="Go to Home">
            <img src="/assets/AKU_Ongole.png" alt="Andhra Kesari University" className="aku-brand-logo" />
            <span className="aku-brand-copy">
              <strong>ANDHRA KESARI UNIVERSITY</strong>
              <small>College Portal</small>
            </span>
          </button>
        </div>

        <button
          type="button"
          className="aku-mobile-toggle"
          onClick={() => setMobileMenuOpen(open => !open)}
          aria-label="Toggle navigation"
          aria-expanded={mobileMenuOpen}
        >
          ☰
        </button>

        <nav className="aku-navbar" aria-label="Main navigation">
          <ul className="aku-nav-list">
            <li className="aku-nav-item"><button type="button" onClick={() => navigate('/home')} className="aku-nav-link">Home</button></li>
            <li className="aku-nav-item aku-dropdown" ref={dropdownRef}>
              <button type="button" className="aku-nav-link aku-dropdown-toggle" onClick={() => setAboutDropdownOpen(open => !open)} aria-expanded={aboutDropdownOpen}>
                <span>About Us</span><span className={`aku-dropdown-arrow ${aboutDropdownOpen ? 'open' : ''}`} aria-hidden="true">⌄</span>
              </button>
              {aboutDropdownOpen && (
                <div className="aku-dropdown-menu">
                  <button type="button" className="aku-dropdown-item" onClick={() => openAboutPage('/about-us')}>About Us</button>
                  <button type="button" className="aku-dropdown-item" onClick={() => openAboutPage('/about-us/contact')}>Contact Us</button>
                  <button type="button" className="aku-dropdown-item" onClick={() => openAboutPage('/about-us/refund')}>Refund &amp; Cancellation</button>
                  <button type="button" className="aku-dropdown-item" onClick={() => openAboutPage('/about-us/terms-privacy')}>Terms and Conditions &amp; Privacy Policy</button>
                </div>
              )}
            </li>
            <li className="aku-nav-item">
              <span className="aku-nav-link aku-nav-timing" title="Operating Hours">
                <span className="aku-clock-icon" aria-hidden="true">◷</span>
                <span>Mon-Sat: 10:00 AM to 5:30 PM</span>
              </span>
            </li>
            <li className="aku-nav-item aku-header-theme-group">
              <button type="button" className="aku-theme-btn" onClick={() => setShowThemeModal(true)} title="Open Theme Studio">
                <span className="aku-theme-dot" />Themes
              </button>
              <button type="button" className="aku-theme-btn" onClick={toggleDarkMode} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                {isDark ? '☀️' : '🌙'}
              </button>
            </li>
          </ul>
        </nav>
        <div className={`aku-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button type="button" onClick={() => { setMobileMenuOpen(false); navigate('/home'); }} className="aku-nav-link">Home</button>
          <button type="button" onClick={() => openAboutPage('/about-us')} className="aku-nav-link">About Us</button>
          <button type="button" onClick={() => openAboutPage('/about-us/contact')} className="aku-nav-link">Contact Us</button>
          <button type="button" onClick={() => openAboutPage('/about-us/refund')} className="aku-nav-link">Refund &amp; Cancellation</button>
          <button type="button" onClick={() => openAboutPage('/about-us/terms-privacy')} className="aku-nav-link">Terms &amp; Privacy</button>
          <span className="aku-nav-link aku-nav-timing"><span aria-hidden="true">◷</span>Mon-Sat: 10:00 AM to 5:30 PM</span>
          <button type="button" onClick={() => { setMobileMenuOpen(false); setShowThemeModal(true); }} className="aku-nav-link">🎨 Theme Studio</button>
        </div>
      </header>
    </>
  );
};

export default UniversityHeader;
