import React, { lazy, Suspense } from 'react';
import { Navigate, Route } from 'react-router-dom';
import {
  IonApp,
  IonContent,
  IonPage,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ThemeProvider } from './theme/ThemeContext';
import { ThemeModal } from './theme/ThemeModal';
import { AmbientBackground } from './components/AmbientBackground';

const Home = lazy(() => import('./pages/Home'));
const CollegeLogin = lazy(() => import('./pages/College/Login'));
const UGMain = lazy(() => import('./pages/College/UGMain'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const AdminMain = lazy(() => import('./pages/Admin/AdminMain'));
const AboutUs = lazy(() => import('./pages/AboutUs'));

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables and multi-palette design */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => (
  <ThemeProvider>
    <IonApp>
      <AmbientBackground />
      <IonReactRouter>
        <Suspense fallback={
          <IonPage>
            <IonContent className="aku-ion-content">
              <div role="status" aria-live="polite" style={{ minHeight: '100%', display: 'grid', placeItems: 'center', color: 'var(--theme-text-color)' }}>
                Loading AKU Portal...
              </div>
            </IonContent>
          </IonPage>
        }>
          <IonRouterOutlet>
            <Route path="/home" element={<Home />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/about-us/contact" element={<AboutUs />} />
            <Route path="/about-us/refund" element={<AboutUs />} />
            <Route path="/about-us/terms-privacy" element={<AboutUs />} />
            <Route path="/login" element={<CollegeLogin />} />
            <Route path="/ug-login" element={<CollegeLogin />} />
            <Route path="/college-login" element={<CollegeLogin />} />
            <Route path="/ug-main" element={<UGMain />} />
            <Route path="/college/ug-main" element={<UGMain />} />
            <Route path="/UGMain" element={<UGMain />} />
            <Route path="/college/UGMain" element={<UGMain />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin_Login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-main" element={<AdminMain />} />
            <Route path="/admin/dashboard" element={<AdminMain />} />
            <Route path="/admin-dashboard" element={<AdminMain />} />
            <Route path="/admin/UGMain" element={<AdminMain />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </IonRouterOutlet>
        </Suspense>
        
        <ThemeModal />
      </IonReactRouter>
    </IonApp>
  </ThemeProvider>
);

export default App;
