import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { adminLogin, fetchAdminMenu, saveAdminSession, AdminMenuItem } from '../../services/akuApi';
import './AdminLogin.css';
import '../Home.css';
import UniversityHeader from '../../components/UniversityHeader';
import UniversityFooter from '../../components/UniversityFooter';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
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
    try {
      const response = await adminLogin(username.trim(), password);
      if (response.status !== 'Success' || !response.admin) {
        setStatusMessage({
          type: 'error',
          text: response.message || 'Login failed. Check your administrator credentials and try again.'
        });
        return;
      }

      let menuItems: AdminMenuItem[] = [];
      try {
        menuItems = await fetchAdminMenu(response.admin.userid);
      } catch (menuError) {
        console.warn('Could not load administrator menu:', menuError);
      }

      saveAdminSession(response.admin, menuItems);
      navigate('/admin-main', { state: { adminUser: response.admin, menuItems }, replace: true });
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error instanceof Error
          ? error.message
          : 'Could not connect to the AKU server. Check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-admin-login-page">
          <UniversityHeader />

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

export default AdminLogin;
