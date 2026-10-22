import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import './Home.css';
import UniversityHeader from '../components/UniversityHeader';
import UniversityFooter from '../components/UniversityFooter';

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
  const [loginModal, setLoginModal] = useState<{ isOpen: boolean; type: 'UG' | 'PG' }>({
    isOpen: false,
    type: 'UG',
  });

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
          <div className="home-floating-shapes" aria-hidden="true">
            <span className="home-glow home-glow-one" />
            <span className="home-glow home-glow-two" />
            <span className="home-glow home-glow-three" />
            <span className="home-decor-dots" />
            <span className="home-decor-building" />
            <span className="home-decor-books" />
            <span className="home-decor-leaves" />
            <span className="home-decor-wave" />
          </div>
          <UniversityHeader />

          <main className="aku-main-content">
            <section className="home-hero" aria-label="Andhra Kesari University">
              <img src="/assets/main.jpg" alt="Andhra Kesari University, Ongole. Act No. 21 of 2021, Government of Andhra Pradesh." />
            </section>

            <section className="aku-card home-portal-panel" aria-labelledby="portal-heading">
              <div className="home-portal-heading">
                <span aria-hidden="true" />
                <h1 id="portal-heading">Choose Your Portal to Continue</h1>
                <span aria-hidden="true" />
              </div>
              <p className="home-portal-description">Select your login type below to access the respective portal</p>
              <div className="aku-action-buttons">
                <button
                  type="button"
                  className="aku-btn aku-btn-ug home-portal-card"
                  onClick={() => navigate('/login')}
                  title="UG Degree College Login"
                >
                  <span className="aku-btn-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m2 9 10-5 10 5-10 5L2 9Zm4 2.1v5.2c3.7 2.7 8.3 2.7 12 0v-5.2M22 9v6" /></svg></span>
                  <span className="home-portal-copy"><strong>UG Degree<br />College Login</strong><small>Undergraduate Colleges</small></span>
                  <span className="home-portal-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
                </button>

                <button
                  type="button"
                  className="aku-btn aku-btn-pg home-portal-card"
                  onClick={() => openLogin('PG')}
                  title="PG, Professional College Login"
                >
                  <span className="aku-btn-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m2 8 10-5 10 5-10 5L2 8Z" /><path d="M6 10v5c3.7 2.7 8.3 2.7 12 0v-5M22 8v6" /><rect x="14" y="16" width="8" height="5" rx="1" /><path d="M16 16v-1h4v1" /></svg></span>
                  <span className="home-portal-copy"><strong>PG, Professional<br />College Login</strong><small>Postgraduate &amp; Professional Colleges</small></span>
                  <span className="home-portal-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
                </button>

                <button
                  type="button"
                  className="aku-btn aku-btn-admin home-portal-card"
                  onClick={() => navigate('/admin-login')}
                  title="UG Administrator Login"
                >
                  <span className="aku-btn-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 2.7a2 2 0 0 1 2 1.5l.3 1.1 1.1.5 1-.5a2 2 0 0 1 2.5.4l.7.7a2 2 0 0 1 .4 2.5l-.5 1 .5 1.1 1.1.3a2 2 0 0 1 1.5 2v1a2 2 0 0 1-1.5 2l-1.1.3-.5 1.1.5 1a2 2 0 0 1-.4 2.5l-.7.7a2 2 0 0 1-2.5.4l-1-.5-1.1.5-.3 1.1a2 2 0 0 1-2 1.5h-1a2 2 0 0 1-2-1.5l-.3-1.1-1.1-.5-1 .5a2 2 0 0 1-2.5-.4l-.7-.7a2 2 0 0 1-.4-2.5l.5-1-.5-1.1-1.1-.3a2 2 0 0 1-1.5-2v-1a2 2 0 0 1 1.5-2l1.1-.3.5-1.1-.5-1a2 2 0 0 1 .4-2.5l.7-.7a2 2 0 0 1 2.5-.4l1 .5 1.1-.5.3-1.1a2 2 0 0 1 2-1.5h1Z" transform="translate(1 1) scale(.92)" /><circle cx="12" cy="12" r="3.2" /></svg></span>
                  <span className="home-portal-copy"><strong>UG Admin<br />Login</strong><small>University Administration</small></span>
                  <span className="home-portal-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></span>
                </button>
              </div>
            </section>
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
