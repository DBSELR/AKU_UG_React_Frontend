import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { useTheme } from '../../theme/ThemeContext';
import {
  collegeLogin,
  fetchCollegeMenu,
  fetchAdminNotifications,
  saveCollegeSession,
  AdminNotification,
  CollegeMenuItem
} from '../../services/akuApi';
import './Login.css';
import '../Home.css';

const generateCaptchaText = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode, setShowThemeModal } = useTheme();

  // Form states
  const [username, setUsername] = useState('023');
  const [password, setPassword] = useState('023');
  const [verificationCode, setVerificationCode] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<AdminNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Header states
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw captcha on canvas
  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.45)`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Add noise dots
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, ${Math.floor(Math.random() * 180)}, 0.4)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with rotation
    ctx.font = 'bold 22px "Courier New", Courier, monospace';
    const colors = ['#0f766e', '#1d4ed8', '#b91c1c', '#7c3aed', '#c2410c'];

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const x = 14 + i * 16;
      const y = 26;
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  const refreshCaptcha = () => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    drawCaptcha(newText);
    setVerificationCode('');
  };

  useEffect(() => {
    const newText = generateCaptchaText();
    setCaptchaText(newText);
    setTimeout(() => {
      drawCaptcha(newText);
    }, 60);
  }, []);

  // Fetch live university notifications from API
  useEffect(() => {
    let isMounted = true;
    setLoadingNotifs(true);
    fetchAdminNotifications()
      .then((notifs) => {
        if (isMounted && notifs && notifs.length > 0) {
          setLiveNotifications(notifs);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch live notifications:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingNotifs(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!username.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Username / College Code.' });
      return;
    }

    if (!password.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your Password.' });
      return;
    }

    if (verificationCode.trim().toUpperCase() !== captchaText.toUpperCase()) {
      setStatusMessage({ type: 'error', text: 'Invalid Verification Code. Please try again.' });
      refreshCaptcha();
      return;
    }

    setIsLoading(true);
    try {
      const response = await collegeLogin(username.trim(), password.trim());
      if (response.status === 'Success' && response.admin) {
        // Fetch official dynamic menu for this college code
        let menuItems: CollegeMenuItem[] = [];
        try {
          menuItems = await fetchCollegeMenu(response.admin.colCode);
        } catch (menuErr) {
          console.warn('Could not load college menu:', menuErr);
        }

        // Save session in local storage
        saveCollegeSession(response.admin, menuItems);

        setStatusMessage({
          type: 'success',
          text: `Welcome, ${response.admin.colname}! Principal: ${response.admin.princname}. Redirecting to UGMain...`
        });

        setTimeout(() => {
          setIsLoading(false);
          navigate('/ug-main', { state: { collegeUser: response.admin, menuItems } });
        }, 600);
      } else {
        setIsLoading(false);
        setStatusMessage({
          type: 'error',
          text: response.message || 'Invalid Credentials. Please enter valid College Code and Password.'
        });
        refreshCaptcha();
      }
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to connect to AKU server. Please check your network connection.'
      });
      refreshCaptcha();
    }
  };

  const handleFillOfficialCollege = () => {
    setUsername('023');
    setPassword('023');
    setVerificationCode(captchaText);
    setStatusMessage({
      type: 'success',
      text: 'Official credentials loaded: College 023 (GOVT DEGREE COLLEGE, CUMBUM).'
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-login-page">
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

          {/* Mobile Menu Panel */}
          <div className={`aku-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <div className="aku-nav-link aku-nav-timing">
              <span>🕒 Mon-Sat : 10:00 AM to 5:30 PM</span>
            </div>
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

          {/* Main Area */}
          <main className="aku-login-main">
            <div className="aku-login-container">
              {/* Left Column: UG College Login Card */}
              <div className="aku-login-card">
                <div className="aku-login-header">
                  <div className="aku-login-emblem-wrap">
                    <img
                      src="/assets/AKU_Ongole.png"
                      alt="Andhra Kesari University Emblem"
                      className="aku-login-emblem"
                    />
                  </div>
                  <h1 className="aku-login-title">ANDHRA KESARI UNIVERSITY</h1>
                  <div className="aku-login-badge">
                    <span>🎓</span>
                    <span>UG College Login</span>
                  </div>
                </div>

                <div className="aku-login-divider"></div>

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

                <form onSubmit={handleLoginSubmit} className="aku-form">
                  {/* Username Field */}
                  <div className="aku-input-group">
                    <label htmlFor="username" className="aku-label">
                      <span>👤</span>
                      <span>Username</span>
                    </label>
                    <div className="aku-input-wrapper">
                      <span className="aku-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      <input
                        id="username"
                        type="text"
                        className="aku-input"
                        placeholder="Enter Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="aku-input-group">
                    <label htmlFor="password" className="aku-label">
                      <span>🔒</span>
                      <span>Password</span>
                    </label>
                    <div className="aku-input-wrapper">
                      <span className="aku-input-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        className="aku-input"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="aku-password-toggle"
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

                  {/* Verification Code / Captcha */}
                  <div className="aku-input-group">
                    <label htmlFor="verificationCode" className="aku-label">
                      <span>🛡️</span>
                      <span>Verification Code</span>
                    </label>
                    <div className="aku-captcha-row">
                      <div className="aku-captcha-display" title="Verification Code Captcha">
                        <canvas
                          ref={canvasRef}
                          width="95"
                          height="36"
                          className="aku-captcha-canvas"
                        />
                        <button
                          type="button"
                          className="aku-captcha-refresh"
                          onClick={refreshCaptcha}
                          title="Generate new Captcha"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10" />
                            <polyline points="1 20 1 14 7 14" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                          </svg>
                        </button>
                      </div>
                      <input
                        id="verificationCode"
                        type="text"
                        className="aku-input aku-captcha-input"
                        placeholder="Enter Code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                        required
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  {/* Login Button with 3D Shine */}
                  <button
                    type="submit"
                    className="aku-login-btn"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? 'Verifying...' : 'Login'}</span>
                    <span style={{ fontSize: '1.2rem' }}>➔</span>
                  </button>

                  {/* Quick Test College Login Option */}
                  <button
                    type="button"
                    className="aku-btn-action-outline"
                    onClick={handleFillOfficialCollege}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      padding: '10px',
                      justifyContent: 'center',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      borderRadius: '8px'
                    }}
                    title="Directly fill Live Credentials (023 - GOVT DEGREE COLLEGE, CUMBUM)"
                  >
                    <span>⚡ Fill Official Credentials (023 / 023)</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Notifications Card */}
              <div className="aku-notif-card">
                <div className="aku-notif-header">
                  <h2>
                    <span className="aku-notif-bell">🔔</span>
                    <span>Notifications</span>
                  </h2>
                  <span className="aku-notif-count-badge">
                    {loadingNotifs ? 'Loading...' : `${liveNotifications.length > 0 ? liveNotifications.length : 3} Updates`}
                  </span>
                </div>

                <div className="aku-notif-body">
                  {liveNotifications.length > 0 ? (
                    liveNotifications.map((notif) => {
                      const colorClass = notif.colour.toLowerCase() === 'red'
                        ? 'aku-notif-red'
                        : notif.colour.toLowerCase() === 'green'
                        ? 'aku-notif-green'
                        : 'aku-notif-blue';

                      return (
                        <div
                          key={notif.sno}
                          className="aku-notif-item"
                          onClick={() => {
                            if (notif.url.endsWith('.pdf')) {
                              window.open(`https://akuexams.com/${notif.url}`, '_blank');
                            } else {
                              alert(`Notification [${notif.sno}]: ${notif.description}\nTarget: ${notif.url}`);
                            }
                          }}
                          title={`Click to view ${notif.description}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="hand-anim">👉</span>
                          <div className="aku-notif-content">
                            <div className={`aku-notif-title ${colorClass}`}>
                              <span>{notif.description}</span>
                              {notif.gif === 'True' && (
                                <img
                                  src="/assets/anew.gif"
                                  alt="New"
                                  className="aku-notif-badge-new"
                                />
                              )}
                            </div>
                            <div className="aku-notif-meta">
                              <span>{notif.notificationType === 'File' ? '📄 Document' : '🔗 Portal Link'}</span>
                              <span>•</span>
                              <span>Priority {notif.order}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      {/* Fallback Notification 1 */}
                      <div
                        className="aku-notif-item"
                        onClick={() => alert('UG III & V Semesters Exam Notification Schedule')}
                        title="Click to view Notification details"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="hand-anim">👉</span>
                        <div className="aku-notif-content">
                          <div className="aku-notif-title aku-notif-blue">
                            <span>CLICK HERE for UG III AND V SEMESTERS EXAM NOTIFICATION Revised (Click to View)</span>
                            <img
                              src="/assets/anew.gif"
                              alt="New"
                              className="aku-notif-badge-new"
                            />
                          </div>
                          <div className="aku-notif-meta">
                            <span>📋 Examination Branch</span>
                            <span>•</span>
                            <span>Revised Schedule</span>
                          </div>
                        </div>
                      </div>

                      {/* Fallback Notification 2 */}
                      <div
                        className="aku-notif-item"
                        onClick={() => alert('UG II Semester Results Portal')}
                        title="Click to view UG II Semester Results"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="hand-anim">👉</span>
                        <div className="aku-notif-content">
                          <div className="aku-notif-title aku-notif-red">
                            <span>CLICK HERE for UG II SEMESTER Results</span>
                            <img
                              src="/assets/anew.gif"
                              alt="New"
                              className="aku-notif-badge-new"
                            />
                          </div>
                          <div className="aku-notif-meta">
                            <span>📊 Results Portal</span>
                            <span>•</span>
                            <span>Declared Online</span>
                          </div>
                        </div>
                      </div>

                      {/* Fallback Notification 3 */}
                      <div
                        className="aku-notif-item"
                        onClick={() => alert('UG IV Semester Revaluation Results Portal')}
                        title="Click to view UG IV Semester Revaluation Results"
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="hand-anim">👉</span>
                        <div className="aku-notif-content">
                          <div className="aku-notif-title aku-notif-green">
                            <span>CLICK HERE for UG IV SEMESTER Revaluation Results</span>
                            <img
                              src="/assets/anew.gif"
                              alt="New"
                              className="aku-notif-badge-new"
                            />
                          </div>
                          <div className="aku-notif-meta">
                            <span>📝 Revaluation Portal</span>
                            <span>•</span>
                            <span>Published</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
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

export default Login;
