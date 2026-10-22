import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { Link, useLocation } from 'react-router-dom';
import UniversityHeader from '../components/UniversityHeader';
import UniversityFooter from '../components/UniversityFooter';
import AboutUsContent, { ABOUT_SECTION_LINKS } from '../components/about/AboutUsContent';
import type { AboutSectionId } from '../components/about/AboutUsContent';
import './Home.css';
import './AboutUs.css';

const getSectionFromPath = (pathname: string): AboutSectionId => {
  if (pathname.endsWith('/contact')) return 'contact';
  if (pathname.endsWith('/refund')) return 'refund';
  if (pathname.endsWith('/terms-privacy')) return 'terms-privacy';
  return 'overview';
};

const AboutUs: React.FC = () => {
  const location = useLocation();
  const activeSection = getSectionFromPath(location.pathname);

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-about-page">
          <UniversityHeader />
          <main className="about-main">
            <div className="about-page-shell">
              <header className="about-page-header">
                <div className="about-page-heading">
                  <p className="about-page-label">ANDHRA KESARI UNIVERSITY</p>
                  <h1>University Information</h1>
                  <p>Explore university details, contact information, and portal policies.</p>
                </div>
                <nav className="about-tabs" aria-label="University information pages">
                  {ABOUT_SECTION_LINKS.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className={`about-tab ${activeSection === item.id ? 'active' : ''}`}
                      aria-current={activeSection === item.id ? 'page' : undefined}
                    >
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </header>
              <AboutUsContent key={activeSection} section={activeSection} />
            </div>
          </main>
          <UniversityFooter />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AboutUs;
