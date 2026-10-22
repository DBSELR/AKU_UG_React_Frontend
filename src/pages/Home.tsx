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
          <UniversityHeader />

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
