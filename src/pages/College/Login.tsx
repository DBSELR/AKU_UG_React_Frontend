import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
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
import UniversityHeader from '../../components/UniversityHeader';
import UniversityFooter from '../../components/UniversityFooter';

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
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState<AdminNotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

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

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-login-page">
          <UniversityHeader />

          {/* Main Area */}
          <main className="aku-login-main">
            <div className="aku-login-container">
              <section className="aku-login-hero" aria-labelledby="aku-welcome-title">
                <div className="aku-login-hero-copy">
                  <p className="aku-login-eyebrow">LEARN <span>•</span> GROW <span>•</span> ACHIEVE</p>
                  <h2 id="aku-welcome-title">Welcome to <strong>Andhra Kesari University</strong></h2>
                  <p className="aku-login-hero-portal">UG College Portal</p>
                  <p className="aku-login-hero-description">
                    Your gateway to examination services, academic updates and college support.
                  </p>
                </div>

                <div className="aku-campus-art" aria-hidden="true">
                  <div className="aku-campus-sun" />
                  <div className="aku-campus-hill aku-campus-hill-back" />
                  <div className="aku-campus-hill aku-campus-hill-front" />
                  <div className="aku-campus-tree aku-campus-tree-one"><i /><b /></div>
                  <div className="aku-campus-tree aku-campus-tree-two"><i /><b /></div>
                  <div className="aku-campus-building">
                    <div className="aku-campus-roof" />
                    <div className="aku-campus-pediment"><span>AKU</span></div>
                    <div className="aku-campus-columns">
                      <i /><i /><i /><i /><i />
                    </div>
                    <div className="aku-campus-steps" />
                  </div>
                  <div className="aku-campus-path" />
                  <div className="aku-campus-student aku-campus-student-one"><i /><b /></div>
                  <div className="aku-campus-student aku-campus-student-two"><i /><b /></div>
                </div>

                <div className="aku-login-benefits">
                  <div className="aku-login-benefit">
                    <span className="aku-benefit-icon" aria-hidden="true">🎓</span>
                    <strong>Student Services</strong>
                    <small>Enrollment, exams and results</small>
                  </div>
                  <div className="aku-login-benefit">
                    <span className="aku-benefit-icon" aria-hidden="true">▤</span>
                    <strong>Academic Updates</strong>
                    <small>Notices, timetables, circulars</small>
                  </div>
                  <div className="aku-login-benefit">
                    <span className="aku-benefit-icon" aria-hidden="true">♧</span>
                    <strong>Student Support</strong>
                    <small>Help and guidance</small>
                  </div>
                  <div className="aku-login-benefit">
                    <span className="aku-benefit-icon" aria-hidden="true">✓</span>
                    <strong>Secure &amp; Reliable</strong>
                    <small>Your data, our priority</small>
                  </div>
                </div>
                <p className="aku-login-hero-footnote">ANDHRA KESARI UNIVERSITY <span>•</span> ONGOLE</p>
              </section>

              <div className="aku-auth-column">
              {/* College login panel */}
              <div className="aku-login-card">
                <div className="aku-login-header">
                  <div className="aku-login-emblem-wrap">
                    <img
                      src="/assets/AKU_Ongole.png"
                      alt="Andhra Kesari University Emblem"
                      className="aku-login-emblem"
                    />
                  </div>
                  <div className="aku-login-card-heading">
                    <p className="aku-login-university-name">ANDHRA KESARI UNIVERSITY</p>
                    <h1 className="aku-login-title">UG College Portal</h1>
                    <p className="aku-login-card-subtitle">Sign in with your college credentials</p>
                  </div>
                  <div className="aku-login-badge">
                    <span>College access</span>
                  </div>
                </div>
 

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
                        autoComplete="username"
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
                        autoComplete="current-password"
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
                          role="img"
                          aria-label="Verification code image"
                        />
                        <button
                          type="button"
                          className="aku-captcha-refresh"
                          onClick={refreshCaptcha}
                          title="Generate new Captcha"
                          aria-label="Refresh verification code"
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
                        placeholder="Enter verification code"
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
                    <span>{isLoading ? 'Signing in...' : 'Login to portal'}</span>
                    <span style={{ fontSize: '1.2rem' }}>➔</span>
                  </button>
                </form>
                <div className="aku-login-card-note">
                  <span aria-hidden="true">✓</span>
                  For authorized UG college use
                </div>
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
            </div>
          </main>

          <UniversityFooter />

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
