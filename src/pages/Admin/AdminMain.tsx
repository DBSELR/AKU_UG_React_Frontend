import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { useTheme, THEME_COLORS, ThemeColor } from '../../theme/ThemeContext';
import {
  getAdminSession,
  clearAdminSession,
  fetchAdminNotifications,
  AdminUser,
  AdminMenuItem,
  AdminNotification
} from '../../services/akuApi';
import AdminSidebar, { AdminPageView } from './AdminSidebar';
import './AdminMain.css';

interface AffiliatedCollege {
  code: string;
  name: string;
  principal: string;
  contact: string;
  studentsEnrolled: number;
  district: string;
  status: 'Active' | 'Approved' | 'Pending Review';
}

const mockColleges: AffiliatedCollege[] = [
  { code: '001', name: '001 - GOVT DEGREE COLLEGE, ONGOLE', principal: 'Dr. V. Ramanjaneyulu', contact: '9848011221', studentsEnrolled: 1250, district: 'Prakasam', status: 'Active' },
  { code: '002', name: '002 - AKSHARA DEGREE COLLEGE, PAMUR', principal: 'Dr. K. Srinivasulu', contact: '9948889680', studentsEnrolled: 485, district: 'Prakasam', status: 'Active' },
  { code: '003', name: '003 - SRI VIVEKANANDA DEGREE COLLEGE, KANDUKUR', principal: 'Prof. M. Venkateswarlu', contact: '9440123456', studentsEnrolled: 620, district: 'Prakasam', status: 'Active' },
  { code: '004', name: '004 - KRISHNA CHAITANYA DEGREE COLLEGE, MARKAPUR', principal: 'Dr. P. Subba Rao', contact: '9849234567', studentsEnrolled: 810, district: 'Prakasam', status: 'Approved' },
  { code: '005', name: '005 - ST. ANN\'S COLLEGE FOR WOMEN, CHIRALA', principal: 'Sr. Mary Grace', contact: '9490345678', studentsEnrolled: 540, district: 'Bapatla', status: 'Active' },
  { code: '006', name: '006 - Y.A. GOVT DEGREE COLLEGE FOR WOMEN, CHIRALA', principal: 'Dr. Ch. Ramanamma', contact: '9848123890', studentsEnrolled: 720, district: 'Bapatla', status: 'Active' },
];

interface SupportTicket {
  id: string;
  collegeCode: string;
  collegeName: string;
  subject: string;
  category: string;
  priority: 'Urgent' | 'High' | 'Normal';
  status: 'Open' | 'In Progress' | 'Resolved';
  date: string;
}

const initialTickets: SupportTicket[] = [
  { id: 'AKU-TK-101', collegeCode: '002', collegeName: 'AKSHARA DEGREE COLLEGE, PAMUR', subject: 'Bulk enrollment photo upload timeout error', category: 'Exam Enrollment', priority: 'Urgent', status: 'Open', date: 'Today, 10:15 AM' },
  { id: 'AKU-TK-102', collegeCode: '004', collegeName: 'KRISHNA CHAITANYA DEGREE COLLEGE', subject: 'Challan fee reconciliation mismatch for B.Sc batch', category: 'Challan Payment', priority: 'High', status: 'In Progress', date: 'Yesterday' },
  { id: 'AKU-TK-103', collegeCode: '001', collegeName: 'GOVT DEGREE COLLEGE, ONGOLE', subject: 'Request readmission approval for transfer candidate', category: 'Readmission', priority: 'Normal', status: 'Open', date: '14-Oct-2026' },
];

interface AdminActionCard {
  id: string;
  view: AdminPageView;
  icon: string;
  category: string;
  title: string;
  desc: string;
  badgeCount?: number;
}

const ADMIN_ACTIONS: AdminActionCard[] = [
  {
    id: 'act-colleges',
    view: 'colleges-list',
    icon: '🏫',
    category: 'INSTITUTIONS',
    title: 'Affiliated Colleges Directory',
    desc: 'Review 142 affiliated degree institutions, principals, courses & intake approval status',
  },
  {
    id: 'act-tickets',
    view: 'support-tickets',
    icon: '🎫',
    category: 'SUPPORT DESK',
    title: 'College Support Tickets Desk',
    desc: 'Live college technical issues, grievance tracking & principal enquiry desk',
    badgeCount: 3,
  },
  {
    id: 'act-challan',
    view: 'challan-reconciliation',
    icon: '💳',
    category: 'FINANCE',
    title: 'SBI Challan Gateway Ledger',
    desc: 'Real-time university fee reconciliation, daily settlements & college accounts',
  },
  {
    id: 'act-gazette',
    view: 'results-gazette',
    icon: '📊',
    category: 'EXAMINATIONS',
    title: 'Results & Gazette Publication',
    desc: 'Publish semester examination results, generate TR sheets & gazette downloads',
  },
  {
    id: 'act-centers',
    view: 'exam-centers',
    icon: '🎓',
    category: 'EXAMINATIONS',
    title: 'Centers & Flying Squads',
    desc: 'Exam center allocation, chief superintendents & special observer assignments',
  },
  {
    id: 'act-rv',
    view: 'rv-desk',
    icon: '📑',
    category: 'EVALUATION',
    title: 'Revaluation & Script Cell',
    desc: 'Process personal script verification, answer book xerox copies & retotaling',
  },
  {
    id: 'act-halltickets',
    view: 'hall-tickets',
    icon: '🎫',
    category: 'STUDENT SERVICES',
    title: 'Hall Tickets Dispatch & Release',
    desc: 'Authorize eligible candidates, release hall ticket PDF downloads for colleges',
  },
  {
    id: 'act-security',
    view: 'college-users',
    icon: '🔐',
    category: 'SECURITY',
    title: 'College Portal Logins & Credentials',
    desc: 'Reset college principal login passwords, monitor IP audit trails & security sessions',
  },
];

export const AdminMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeId, setThemeId, isDark, toggleDarkMode, setShowThemeModal } = useTheme();

  // Load Admin user profile and dynamic menu from session or location state
  const [adminUser] = useState<AdminUser | null>(() => {
    return (location.state as any)?.adminUser || getAdminSession().user;
  });
  const [adminMenu] = useState<AdminMenuItem[]>(() => {
    return (location.state as any)?.menuItems || getAdminSession().menu;
  });
  const [liveNotifications, setLiveNotifications] = useState<AdminNotification[]>([]);

  useEffect(() => {
    if (!adminUser) navigate('/admin-login', { replace: true });
  }, [adminUser, navigate]);

  useEffect(() => {
    if (!adminUser) return;
    let isMounted = true;
    fetchAdminNotifications()
      .then((notifs) => {
        if (isMounted && notifs && notifs.length > 0) {
          setLiveNotifications(notifs);
        }
      })
      .catch((err) => {
        console.warn('Could not load live notifications in AdminMain:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/admin-login');
  };

  const [activeView, setActiveView] = useState<AdminPageView>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeStatusFilter, setCollegeStatusFilter] = useState('ALL');
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>(initialTickets);
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState('ALL');

  // Support Ticket Modal states
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketCategory, setNewTicketCategory] = useState('Exam Enrollment');
  const [newTicketDesc, setNewTicketDesc] = useState('');
  const [newTicketCollege, setNewTicketCollege] = useState('023 - GOVERNMENT DEGREE COLLEGE, CUMBUM');
  const [newTicketPriority, setNewTicketPriority] = useState<'Urgent' | 'High' | 'Normal'>('High');

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim()) {
      alert('Please enter a ticket subject.');
      return;
    }
    const newId = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: SupportTicket = {
      id: newId,
      collegeCode: newTicketCollege.split(' - ')[0] || '023',
      collegeName: newTicketCollege,
      category: newTicketCategory,
      subject: newTicketSubject.trim(),
      date: new Date().toISOString().split('T')[0],
      priority: newTicketPriority,
      status: 'Open',
    };
    setTicketsList((prev) => [newTicket, ...prev]);
    alert(`Support Ticket #${newId} created successfully! Technical support will contact the college.`);
    setTicketModalOpen(false);
    setNewTicketSubject('');
    setNewTicketDesc('');
  };

  const handleSelectView = (view: AdminPageView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResolveTicket = (ticketId: string) => {
    setTicketsList(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status: 'Resolved' } : t))
    );
  };

  const filteredColleges = mockColleges.filter(col => {
    const matchesSearch =
      col.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      col.code.includes(collegeSearch) ||
      col.principal.toLowerCase().includes(collegeSearch.toLowerCase());
    const matchesStatus =
      collegeStatusFilter === 'ALL' || col.status === collegeStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTickets = ticketsList.filter(tk => {
    if (ticketPriorityFilter === 'ALL') return true;
    if (ticketPriorityFilter === 'RESOLVED') return tk.status === 'Resolved';
    if (ticketPriorityFilter === 'UNRESOLVED') return tk.status !== 'Resolved';
    return tk.priority === ticketPriorityFilter;
  });

  const unresolvedCount = ticketsList.filter(t => t.status !== 'Resolved').length;

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-admin-page">
          {/* Top Navbar */}
          <header className="aku-admin-header">
            <div className="aku-admin-header-left">
              <button
                type="button"
                className="aku-admin-toggle-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Toggle Sidebar Navigation"
              >
                ☰
              </button>

              <div
                className="aku-admin-brand"
                onClick={() => navigate('/home')}
                title="Go to University Portal Home"
              >
                <img
                  src="/assets/logo.png"
                  alt="AKU Logo"
                  className="aku-admin-logo"
                />
                <div className="aku-admin-header-title">
                  <span className="aku-admin-header-heading">ANDHRA KESARI UNIVERSITY</span>
                  <span className="aku-admin-header-sub">UG Examination Control Cell &bull; Admin Portal</span>
                </div>
              </div>
            </div>

            <div className="aku-admin-header-right">
              <div className="aku-admin-officer-pill">
                <span>🛡️</span>
                <span>{adminUser ? `${adminUser.userid} (${adminUser.userGroup})` : 'AKUADMIN (DBSAdmin)'}</span>
                {adminUser?.mobile && (
                  <span style={{ fontSize: '0.75rem', opacity: 0.85, marginLeft: '6px' }}>
                    📞 {adminUser.mobile}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="aku-admin-theme-btn"
                onClick={() => setShowThemeModal(true)}
                title="Change Theme Color Palette"
              >
                <span>🎨</span>
                <span>Themes</span>
              </button>

              <button
                type="button"
                className="aku-admin-theme-btn"
                onClick={toggleDarkMode}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span>{isDark ? '☀️' : '🌙'}</span>
              </button>

              <button
                type="button"
                className="aku-admin-btn-logout"
                onClick={handleLogout}
                title="Log out of Admin Portal"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* COE Helpline & Control Room Ticker Bar */}
          <div className="aku-admin-support-bar">
            <div className="aku-admin-live-badge">
              <span className="aku-admin-pulse-dot-green"></span>
              <span>COE CONTROL ROOM</span>
            </div>

            <div
              className="aku-admin-scroller-viewport"
              title="Continuous Helpline Ticker (Hover to pause)"
            >
              <div className="aku-admin-scroller-track">
                <div className="aku-admin-ticker-pill">
                  <span style={{ fontSize: '1.05rem' }}>📞</span>
                  <span style={{ color: 'var(--theme-primary, #0369a1)', fontWeight: 800 }}>
                    COE HELPLINE :
                  </span>
                  <a
                    href="tel:9948889680"
                    style={{
                      color: '#0284c7',
                      fontWeight: 900,
                      textDecoration: 'underline',
                    }}
                  >
                    9948889680
                  </a>
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span style={{ color: '#f59e0b' }}>🕒</span>
                  <span style={{ fontWeight: 700 }}>Mon-Sat : 10:00 AM to 5:30 PM</span>
                  <span style={{ opacity: 0.6 }}>|</span>
                  <span>📍 Controller of Examinations Branch, Andhra Kesari University, Ongole</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="aku-admin-btn-emergency"
              onClick={() =>
                alert('COE Broadcast Channel: All affiliated colleges have been notified regarding the UG Semester Exam Schedule 2025-2026.')
              }
              title="Broadcast notification to all colleges"
            >
              <span>🚨</span>
              <span>Broadcast Notice</span>
            </button>
          </div>

          {/* Main Layout: Full Width Layout with Separate Admin Sidebar */}
          <div className="aku-admin-layout">
            <AdminSidebar
              activeView={activeView}
              onSelectView={handleSelectView}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              pendingTicketCount={unresolvedCount}
              menuItems={adminMenu}
              adminInfo={{
                name: adminUser?.userid || 'AKUADMIN',
                role: adminUser?.userGroup || 'DBSAdmin',
                department: 'UG Examination Branch, AKU',
                mobile: adminUser?.mobile || '9177011550',
              }}
            />

            {/* Dynamic Full-Width Content Area */}
            <main className="aku-admin-content">
              {/* Breadcrumb Bar */}
              <div className="aku-admin-breadcrumbs">
                <div className="aku-admin-breadcrumb-trail">
                  <span
                    className="aku-admin-breadcrumb-link"
                    onClick={() => handleSelectView('overview')}
                  >
                    Admin Home
                  </span>
                  <span>/</span>
                  <span className="aku-admin-breadcrumb-active">
                    {activeView.replace(/-/g, ' ').toUpperCase()}
                  </span>
                </div>

                {activeView !== 'overview' && (
                  <button
                    type="button"
                    className="aku-admin-btn-back"
                    onClick={() => handleSelectView('overview')}
                  >
                    <span>← Back to Admin Overview</span>
                  </button>
                )}
              </div>

              {/* Top 4 KPI Metrics Row */}
              <div className="aku-admin-metrics-row">
                <div
                  className="aku-admin-metric-card"
                  onClick={() => handleSelectView('colleges-list')}
                  title="View Affiliated Colleges"
                >
                  <div className="aku-admin-metric-icon" style={{ background: 'rgba(3, 105, 161, 0.1)', color: '#0284c7' }}>
                    🏫
                  </div>
                  <div className="aku-admin-metric-info">
                    <span className="aku-admin-metric-value">142</span>
                    <span className="aku-admin-metric-label">Affiliated UG Colleges</span>
                  </div>
                </div>

                <div
                  className="aku-admin-metric-card"
                  onClick={() => handleSelectView('session-mgmt')}
                  title="View Enrolled Candidates"
                >
                  <div className="aku-admin-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                    🎓
                  </div>
                  <div className="aku-admin-metric-info">
                    <span className="aku-admin-metric-value">48,250</span>
                    <span className="aku-admin-metric-label">Enrolled Candidates</span>
                  </div>
                </div>

                <div
                  className="aku-admin-metric-card"
                  onClick={() => handleSelectView('challan-reconciliation')}
                  title="View Challan Settlements"
                >
                  <div className="aku-admin-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                    💳
                  </div>
                  <div className="aku-admin-metric-info">
                    <span className="aku-admin-metric-value">₹ 2.45 Cr</span>
                    <span className="aku-admin-metric-label">Challan Fee Settled</span>
                  </div>
                </div>

                <div
                  className="aku-admin-metric-card"
                  onClick={() => handleSelectView('support-tickets')}
                  title="View Support Tickets"
                >
                  <div className="aku-admin-metric-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    🎫
                  </div>
                  <div className="aku-admin-metric-info">
                    <span className="aku-admin-metric-value">{unresolvedCount}</span>
                    <span className="aku-admin-metric-label">Active Support Tickets</span>
                  </div>
                </div>
              </div>

              {/* View 1: Main Admin Overview & Dedicated Dashboards (Dashboard, Enrollment Dashboard, ABC ID Dashboard) */}
              {(activeView === 'overview' || activeView === 'enrollment-dashboard' || activeView === 'abc-id-dashboard') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Official 3-Button Hub Card from AKU Controller Portal */}
                  <div
                    style={{
                      background: '#ffffff',
                      border: '1px solid #d2dbe5',
                      borderRadius: '4px',
                      padding: '28px 30px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                      textAlign: 'center',
                    }}
                  >
                    {/* Top Support Prompt with Red Starburst New Badge */}
                    <div
                      style={{
                        marginBottom: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        onClick={() => setTicketModalOpen(true)}
                        style={{
                          color: '#002699',
                          fontSize: '1.08rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          letterSpacing: '0.2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="Click here if you have any issues to raise a support ticket"
                      >
                        If You have Any Issue Please Raise Ticket
                      </span>

                      {/* Red Starburst Explosion Badge with New */}
                      <span
                        onClick={() => setTicketModalOpen(true)}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          verticalAlign: 'middle',
                        }}
                        title="Raise Support Ticket"
                      >
                        <svg
                          width="30"
                          height="26"
                          viewBox="0 0 40 34"
                          style={{ filter: 'drop-shadow(0 1px 2px rgba(229, 57, 53, 0.4))' }}
                        >
                          <polygon
                            points="20,0 25,7 34,4 33,13 40,17 35,23 38,31 30,31 27,39 20,33 13,39 10,31 2,31 5,23 0,17 7,13 6,4 15,7"
                            fill="#e53935"
                          />
                          <text
                            x="20"
                            y="22"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="Arial, sans-serif"
                            textAnchor="middle"
                          >
                            New
                          </text>
                        </svg>
                      </span>
                    </div>

                    {/* 3 Main Action Buttons Row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Green: CLICK HERE FOR DASHBOARD */}
                      <button
                        type="button"
                        onClick={() => handleSelectView('overview')}
                        style={{
                          backgroundColor: activeView === 'overview' ? '#449d44' : '#5cb85c',
                          color: '#ffffff',
                          border: '1px solid #4cae4c',
                          borderRadius: '4px',
                          padding: '11px 26px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          letterSpacing: '0.4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          boxShadow:
                            activeView === 'overview'
                              ? '0 0 0 3px rgba(92, 184, 92, 0.4)'
                              : '0 2px 4px rgba(0,0,0,0.14)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#449d44')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            activeView === 'overview' ? '#449d44' : '#5cb85c')
                        }
                        title="Click here for University Examination Dashboard"
                      >
                        CLICK HERE FOR DASHBOARD
                      </button>

                      {/* Blue: CLICK HERE FOR ENROLLMENT DASHBOARD */}
                      <button
                        type="button"
                        onClick={() => handleSelectView('enrollment-dashboard')}
                        style={{
                          backgroundColor:
                            activeView === 'enrollment-dashboard' ? '#286090' : '#337ab7',
                          color: '#ffffff',
                          border: '1px solid #2e6da4',
                          borderRadius: '4px',
                          padding: '11px 26px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          letterSpacing: '0.4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          boxShadow:
                            activeView === 'enrollment-dashboard'
                              ? '0 0 0 3px rgba(51, 122, 183, 0.4)'
                              : '0 2px 4px rgba(0,0,0,0.14)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#286090')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            activeView === 'enrollment-dashboard' ? '#286090' : '#337ab7')
                        }
                        title="Click here for College-wise Enrollment Dashboard"
                      >
                        CLICK HERE FOR ENROLLMENT DASHBOARD
                      </button>

                      {/* Red/Orange: CLICK HERE FOR ABC ID DASHBOARD */}
                      <button
                        type="button"
                        onClick={() => handleSelectView('abc-id-dashboard')}
                        style={{
                          backgroundColor:
                            activeView === 'abc-id-dashboard' ? '#d84315' : '#ff5722',
                          color: '#ffffff',
                          border: '1px solid #e64a19',
                          borderRadius: '4px',
                          padding: '11px 26px',
                          fontSize: '0.88rem',
                          fontWeight: 700,
                          letterSpacing: '0.4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          boxShadow:
                            activeView === 'abc-id-dashboard'
                              ? '0 0 0 3px rgba(255, 87, 34, 0.4)'
                              : '0 2px 4px rgba(0,0,0,0.14)',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d84315')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            activeView === 'abc-id-dashboard' ? '#d84315' : '#ff5722')
                        }
                        title="Click here for Academic Bank of Credits (ABC ID) Dashboard"
                      >
                        CLICK HERE FOR ABC ID DASHBOARD
                      </button>
                    </div>
                  </div>

                  {/* Subview 1: University Examination Executive Dashboard */}
                  {activeView === 'overview' && (
                    <div className="aku-admin-panel-card">
                      <div className="aku-admin-panel-header">
                        <div className="aku-admin-panel-title-wrap">
                          <span className="aku-admin-panel-icon">📊</span>
                          <div>
                            <h2 className="aku-admin-panel-title">University Examination Executive Dashboard</h2>
                            <p className="aku-admin-panel-subtitle">
                              Controller of Examinations &bull; Andhra Kesari University Central Administration
                            </p>
                          </div>
                        </div>
                        <span className="aku-admin-badge-approved">Active Session 2025-2026</span>
                      </div>

                      {/* Live University Circulars from /LoadAdminNotifications */}
                      <div
                        style={{
                          background: 'var(--theme-card-bg-subtle, #f8fafc)',
                          border: '1px solid var(--theme-card-border, #e2e8f0)',
                          borderRadius: '12px',
                          padding: '18px 20px',
                          marginBottom: '20px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.25rem' }}>📢</span>
                            <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--theme-text-color, #0f172a)' }}>
                              Live Notifications &amp; Circulars (/LoadAdminNotifications)
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.74rem',
                              background: 'rgba(3, 105, 161, 0.12)',
                              color: '#0284c7',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontWeight: 700,
                            }}
                          >
                            {liveNotifications.length > 0 ? `${liveNotifications.length} Active` : '3 Active'}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                          {(liveNotifications.length > 0
                            ? liveNotifications
                            : [
                                {
                                  sno: '30',
                                  description: 'CLICK HERE for UG III AND V SEMESTERS EXAM NOTIFICATION Revised',
                                  notificationType: 'File',
                                  colour: 'Blue',
                                  order: '3',
                                  gif: 'True',
                                  url: 'Notification_20261003_172542.pdf',
                                  isActive: 'True',
                                },
                                {
                                  sno: '29',
                                  description: 'CLICK HERE for UG II SEMESTER Results',
                                  notificationType: 'Link',
                                  colour: 'RED',
                                  order: '2',
                                  gif: 'True',
                                  url: '/Student_Results.aspx',
                                  isActive: 'True',
                                },
                                {
                                  sno: '27',
                                  description: 'CLICK HERE for UG IV SEMESTER Revaluation Results',
                                  notificationType: 'Link',
                                  colour: 'Green',
                                  order: '1',
                                  gif: 'True',
                                  url: '/Student_RV_Results.aspx',
                                  isActive: 'True',
                                },
                              ]
                          ).map((notif) => (
                            <div
                              key={notif.sno}
                              onClick={() => {
                                if (notif.url.endsWith('.pdf')) {
                                  window.open(`https://akuexams.com/${notif.url}`, '_blank');
                                } else {
                                  alert(`Notification: ${notif.description}\nTarget: ${notif.url}`);
                                }
                              }}
                              style={{
                                background: 'var(--theme-card-bg, #ffffff)',
                                border: '1px solid var(--theme-card-border, #e2e8f0)',
                                borderRadius: '8px',
                                padding: '12px 14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '10px',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0284c7')}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                            >
                              <div style={{ minWidth: 0, flex: 1 }}>
                                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--theme-text-color, #0f172a)', display: 'block', lineHeight: 1.3 }}>
                                  {notif.description}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--theme-text-muted, #64748b)' }}>
                                  Priority {notif.order} &bull; {notif.url}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  background:
                                    notif.colour.toLowerCase() === 'red'
                                      ? '#ef4444'
                                      : notif.colour.toLowerCase() === 'green'
                                      ? '#10b981'
                                      : '#0284c7',
                                  color: '#ffffff',
                                  flexShrink: 0,
                                }}
                              >
                                {notif.notificationType.toUpperCase()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Summary KPI Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        <div style={{ background: 'var(--theme-card-bg, #ffffff)', border: '1px solid var(--theme-card-border, #e2e8f0)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--theme-text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>Affiliated Colleges</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#0284c7' }}>142</h3>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>● 100% Recognized</span>
                        </div>
                        <div style={{ background: 'var(--theme-card-bg, #ffffff)', border: '1px solid var(--theme-card-border, #e2e8f0)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--theme-text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>Enrolled Students</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#059669' }}>48,250</h3>
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>● Regular + Backlog</span>
                        </div>
                        <div style={{ background: 'var(--theme-card-bg, #ffffff)', border: '1px solid var(--theme-card-border, #e2e8f0)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--theme-text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>ABC ID Compliance</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#ff5722' }}>96.8%</h3>
                          <span style={{ fontSize: '0.72rem', color: '#ff5722', fontWeight: 700 }}>● APAAR Integrated</span>
                        </div>
                        <div style={{ background: 'var(--theme-card-bg, #ffffff)', border: '1px solid var(--theme-card-border, #e2e8f0)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--theme-text-muted, #64748b)', fontWeight: 700, textTransform: 'uppercase' }}>Fee Reconciliation</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#d97706' }}>₹ 2.45 Cr</h3>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>● SBI Settled</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subview 2: Candidate Enrollment Dashboard */}
                  {activeView === 'enrollment-dashboard' && (
                    <div className="aku-admin-panel-card">
                      <div className="aku-admin-panel-header">
                        <div className="aku-admin-panel-title-wrap">
                          <span className="aku-admin-panel-icon">📝</span>
                          <div>
                            <h2 className="aku-admin-panel-title">University Candidate Enrollment Dashboard</h2>
                            <p className="aku-admin-panel-subtitle">College-wise, Degree-wise &amp; Semester-wise Candidate Enrollment Analytics</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => alert('Exporting full university enrollment summary report to Excel...')}
                            style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            📥 Export Excel Report
                          </button>
                        </div>
                      </div>

                      {/* Course Breakdown Table */}
                      <div style={{ overflowX: 'auto', marginTop: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--theme-card-bg-subtle, #f1f5f9)', borderBottom: '2px solid var(--theme-card-border, #cbd5e1)' }}>
                              <th style={{ padding: '10px 14px' }}>Course / Program</th>
                              <th style={{ padding: '10px 14px' }}>Affiliated Colleges</th>
                              <th style={{ padding: '10px 14px' }}>Regular Enrolled</th>
                              <th style={{ padding: '10px 14px' }}>Supplementary</th>
                              <th style={{ padding: '10px 14px' }}>Total Candidates</th>
                              <th style={{ padding: '10px 14px' }}>Approval Rate</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { course: 'B.Sc (Computer Science / Data Science)', colleges: 118, regular: 16840, suppl: 2310, total: 19150, rate: '99.4%' },
                              { course: 'B.Com (General & Computer Applications)', colleges: 132, regular: 14220, suppl: 1890, total: 16110, rate: '98.8%' },
                              { course: 'B.A (HEP / Computers / Journalism)', colleges: 84, regular: 7420, suppl: 980, total: 8400, rate: '97.9%' },
                              { course: 'B.B.A (Business Administration)', colleges: 42, regular: 2840, suppl: 320, total: 3160, rate: '99.1%' },
                              { course: 'B.C.A (Computer Applications)', colleges: 36, regular: 1290, suppl: 140, total: 1430, rate: '100.0%' },
                            ].map((row, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--theme-card-border, #e2e8f0)' }}>
                                <td style={{ padding: '12px 14px', fontWeight: 700 }}>{row.course}</td>
                                <td style={{ padding: '12px 14px' }}>{row.colleges} Colleges</td>
                                <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 700 }}>{row.regular.toLocaleString()}</td>
                                <td style={{ padding: '12px 14px', color: '#d97706', fontWeight: 700 }}>{row.suppl.toLocaleString()}</td>
                                <td style={{ padding: '12px 14px', fontWeight: 800 }}>{row.total.toLocaleString()}</td>
                                <td style={{ padding: '12px 14px' }}>
                                  <span style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669', padding: '2px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '0.74rem' }}>
                                    {row.rate}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Subview 3: Academic Bank of Credits (ABC ID / APAAR) Dashboard */}
                  {activeView === 'abc-id-dashboard' && (
                    <div className="aku-admin-panel-card">
                      <div className="aku-admin-panel-header">
                        <div className="aku-admin-panel-title-wrap">
                          <span className="aku-admin-panel-icon">🎯</span>
                          <div>
                            <h2 className="aku-admin-panel-title">Academic Bank of Credits (ABC ID / APAAR) Dashboard</h2>
                            <p className="aku-admin-panel-subtitle">National Academic Depository (NAD) &bull; DigiLocker APAAR Integration Status</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => alert('Triggering APAAR DigiLocker reconciliation sync...')}
                            style={{ background: '#ff5722', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                          >
                            🔄 Re-Sync with DigiLocker API
                          </button>
                        </div>
                      </div>

                      {/* Compliance Stats Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px', marginBottom: '20px' }}>
                        <div style={{ background: 'rgba(255, 87, 34, 0.06)', border: '1px solid rgba(255, 87, 34, 0.25)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 800, textTransform: 'uppercase' }}>ABC ID Generated</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#ff5722' }}>46,706</h3>
                          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>● 96.8% Complete</span>
                        </div>
                        <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#1e40af', fontWeight: 800, textTransform: 'uppercase' }}>Pending Generation</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#2563eb' }}>1,544</h3>
                          <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>● 3.2% Pending</span>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '16px' }}>
                          <span style={{ fontSize: '0.74rem', color: '#065f46', fontWeight: 800, textTransform: 'uppercase' }}>100% Compliant Colleges</span>
                          <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900, color: '#059669' }}>128 / 142</h3>
                          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>● 14 colleges pending</span>
                        </div>
                      </div>

                      {/* Pending Colleges Table */}
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.96rem', fontWeight: 800 }}>Colleges Pending ABC ID Verification</h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--theme-card-bg-subtle, #f1f5f9)', borderBottom: '2px solid var(--theme-card-border, #cbd5e1)' }}>
                              <th style={{ padding: '8px 12px' }}>Code</th>
                              <th style={{ padding: '8px 12px' }}>College Name</th>
                              <th style={{ padding: '8px 12px' }}>District</th>
                              <th style={{ padding: '8px 12px' }}>Enrolled</th>
                              <th style={{ padding: '8px 12px' }}>ABC Verified</th>
                              <th style={{ padding: '8px 12px' }}>Pending</th>
                              <th style={{ padding: '8px 12px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { code: '042', name: 'SRI PRATAP DEGREE COLLEGE, MARKAPUR', district: 'Prakasam', enrolled: 420, verified: 360, pending: 60 },
                              { code: '078', name: 'V.V. & M. DEGREE COLLEGE, ONGOLE', district: 'Prakasam', enrolled: 680, verified: 610, pending: 70 },
                              { code: '105', name: 'SRI HARSHA DEGREE COLLEGE, CHIRALA', district: 'Bapatla', enrolled: 510, verified: 472, pending: 38 },
                              { code: '119', name: 'BAPATLA COLLEGE OF ARTS & SCIENCES', district: 'Bapatla', enrolled: 790, verified: 745, pending: 45 },
                            ].map((col) => (
                              <tr key={col.code} style={{ borderBottom: '1px solid var(--theme-card-border, #e2e8f0)' }}>
                                <td style={{ padding: '10px 12px', fontWeight: 800 }}>{col.code}</td>
                                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{col.name}</td>
                                <td style={{ padding: '10px 12px' }}>{col.district}</td>
                                <td style={{ padding: '10px 12px' }}>{col.enrolled}</td>
                                <td style={{ padding: '10px 12px', color: '#16a34a', fontWeight: 700 }}>{col.verified}</td>
                                <td style={{ padding: '10px 12px', color: '#dc2626', fontWeight: 800 }}>{col.pending}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <button
                                    type="button"
                                    onClick={() => alert(`Sending automated SMS & Email reminder to Principal of College ${col.code}...`)}
                                    style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    Send Reminder
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Colleges Directory */}
              {activeView === 'colleges-list' && (
                <div className="aku-admin-panel-card">
                  <div className="aku-admin-panel-header">
                    <div className="aku-admin-panel-title-wrap">
                      <span className="aku-admin-panel-icon">🏫</span>
                      <div>
                        <h2 className="aku-admin-panel-title">Affiliated Degree Colleges Directory</h2>
                        <p className="aku-admin-panel-subtitle">Official Directory of 142 Recognized Degree Institutions</p>
                      </div>
                    </div>
                    <span className="aku-admin-badge-approved">Total: {mockColleges.length} Loaded</span>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="aku-admin-toolbar">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setCollegeStatusFilter('ALL')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: collegeStatusFilter === 'ALL' ? 'none' : '1px solid #cbd5e1',
                          background: collegeStatusFilter === 'ALL' ? 'var(--theme-primary, #0369a1)' : '#ffffff',
                          color: collegeStatusFilter === 'ALL' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        All Colleges ({mockColleges.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollegeStatusFilter('Active')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: collegeStatusFilter === 'Active' ? 'none' : '1px solid #cbd5e1',
                          background: collegeStatusFilter === 'Active' ? 'var(--theme-primary, #0369a1)' : '#ffffff',
                          color: collegeStatusFilter === 'Active' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        Active ({mockColleges.filter(c => c.status === 'Active').length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollegeStatusFilter('Approved')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: collegeStatusFilter === 'Approved' ? 'none' : '1px solid #cbd5e1',
                          background: collegeStatusFilter === 'Approved' ? 'var(--theme-primary, #0369a1)' : '#ffffff',
                          color: collegeStatusFilter === 'Approved' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        Approved ({mockColleges.filter(c => c.status === 'Approved').length})
                      </button>
                    </div>

                    <div style={{ minWidth: '260px' }}>
                      <input
                        type="text"
                        placeholder="Search by code, college name, or principal..."
                        value={collegeSearch}
                        onChange={e => setCollegeSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--theme-card-border, #cbd5e1)',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.84rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  {/* Colleges Table */}
                  <div className="aku-admin-table-wrap">
                    <table className="aku-admin-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>College Name</th>
                          <th>District</th>
                          <th>Principal</th>
                          <th>Official Contact</th>
                          <th>Enrolled Candidates</th>
                          <th>Affiliation Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredColleges.map(col => (
                          <tr key={col.code}>
                            <td>
                              <strong style={{ color: 'var(--theme-primary, #0369a1)' }}>
                                {col.code}
                              </strong>
                            </td>
                            <td>
                              <strong style={{ fontSize: '0.9rem' }}>{col.name}</strong>
                            </td>
                            <td>{col.district}</td>
                            <td>{col.principal}</td>
                            <td>
                              <a
                                href={`tel:${col.contact}`}
                                style={{ color: '#0284c7', fontWeight: 700 }}
                              >
                                {col.contact}
                              </a>
                            </td>
                            <td>
                              <strong>{col.studentsEnrolled}</strong> students
                            </td>
                            <td>
                              <span
                                className={
                                  col.status === 'Active'
                                    ? 'aku-admin-badge-approved'
                                    : 'aku-admin-badge-pending'
                                }
                              >
                                {col.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() =>
                                  alert(`College Profile: ${col.name}\nCode: ${col.code}\nPrincipal: ${col.principal}\nContact: ${col.contact}\nEnrolled: ${col.studentsEnrolled}`)
                                }
                                style={{
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  background: 'var(--theme-card-bg-subtle, #f1f5f9)',
                                  border: '1px solid var(--theme-card-border, #cbd5e1)',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  color: 'var(--theme-primary, #0369a1)'
                                }}
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                    <button
                      type="button"
                      onClick={() => alert('Exporting full 142 affiliated colleges list to Excel...')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: '#059669',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '0.84rem'
                      }}
                    >
                      📥 Export Excel (CSV)
                    </button>
                  </div>
                </div>
              )}

              {/* View 3: Support Tickets */}
              {activeView === 'support-tickets' && (
                <div className="aku-admin-panel-card">
                  <div className="aku-admin-panel-header">
                    <div className="aku-admin-panel-title-wrap">
                      <span className="aku-admin-panel-icon">🎫</span>
                      <div>
                        <h2 className="aku-admin-panel-title">College Helpdesk Support Tickets</h2>
                        <p className="aku-admin-panel-subtitle">
                          Review, respond, and resolve technical issues submitted by affiliated degree colleges
                        </p>
                      </div>
                    </div>
                    <span className="aku-admin-badge-urgent">{unresolvedCount} Pending Attention</span>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="aku-admin-toolbar">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => setTicketPriorityFilter('ALL')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: ticketPriorityFilter === 'ALL' ? 'none' : '1px solid #cbd5e1',
                          background: ticketPriorityFilter === 'ALL' ? 'var(--theme-primary, #0369a1)' : '#ffffff',
                          color: ticketPriorityFilter === 'ALL' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        All ({ticketsList.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketPriorityFilter('UNRESOLVED')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: ticketPriorityFilter === 'UNRESOLVED' ? 'none' : '1px solid #cbd5e1',
                          background: ticketPriorityFilter === 'UNRESOLVED' ? '#ef4444' : '#ffffff',
                          color: ticketPriorityFilter === 'UNRESOLVED' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        Unresolved ({unresolvedCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketPriorityFilter('Urgent')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: ticketPriorityFilter === 'Urgent' ? 'none' : '1px solid #cbd5e1',
                          background: ticketPriorityFilter === 'Urgent' ? '#d97706' : '#ffffff',
                          color: ticketPriorityFilter === 'Urgent' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        Urgent Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketPriorityFilter('RESOLVED')}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: ticketPriorityFilter === 'RESOLVED' ? 'none' : '1px solid #cbd5e1',
                          background: ticketPriorityFilter === 'RESOLVED' ? '#059669' : '#ffffff',
                          color: ticketPriorityFilter === 'RESOLVED' ? '#ffffff' : '#334155',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        Resolved ({ticketsList.filter(t => t.status === 'Resolved').length})
                      </button>
                    </div>
                  </div>

                  <div className="aku-admin-table-wrap">
                    <table className="aku-admin-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Institution</th>
                          <th>Category</th>
                          <th>Subject / Issue Description</th>
                          <th>Logged At</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Resolution Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map(tk => (
                          <tr key={tk.id}>
                            <td>
                              <strong style={{ color: 'var(--theme-primary, #0369a1)', fontSize: '0.9rem' }}>
                                {tk.id}
                              </strong>
                            </td>
                            <td>
                              <div><strong>{tk.collegeCode}</strong></div>
                              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{tk.collegeName}</div>
                            </td>
                            <td>
                              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{tk.category}</span>
                            </td>
                            <td>
                              <strong style={{ fontSize: '0.88rem', display: 'block' }}>{tk.subject}</strong>
                            </td>
                            <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                              {tk.date}
                            </td>
                            <td>
                              <span
                                className={
                                  tk.priority === 'Urgent'
                                    ? 'aku-admin-badge-urgent'
                                    : 'aku-admin-badge-pending'
                                }
                              >
                                {tk.priority}
                              </span>
                            </td>
                            <td>
                              <span
                                className={
                                  tk.status === 'Resolved'
                                    ? 'aku-admin-badge-approved'
                                    : 'aku-admin-badge-pending'
                                }
                              >
                                {tk.status}
                              </span>
                            </td>
                            <td>
                              {tk.status !== 'Resolved' ? (
                                <button
                                  type="button"
                                  onClick={() => handleResolveTicket(tk.id)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '6px',
                                    background: '#10b981',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    fontSize: '0.78rem'
                                  }}
                                >
                                  Mark Resolved ✓
                                </button>
                              ) : (
                                <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.82rem' }}>
                                  ✓ Closed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 4: Challan Reconciliation */}
              {activeView === 'challan-reconciliation' && (
                <div className="aku-admin-panel-card">
                  <div className="aku-admin-panel-header">
                    <div className="aku-admin-panel-title-wrap">
                      <span className="aku-admin-panel-icon">💳</span>
                      <div>
                        <h2 className="aku-admin-panel-title">SBI Payment Gateway Challan Settlement</h2>
                        <p className="aku-admin-panel-subtitle">Real-time Automated Bank Reconciliation &amp; Fee Receipts</p>
                      </div>
                    </div>
                    <span className="aku-admin-badge-approved">Gateway Status: Live &amp; Connected</span>
                  </div>

                  <p style={{ color: 'var(--theme-text-muted, #64748b)', margin: '0 0 20px 0', fontSize: '0.92rem' }}>
                    Reconciled collection records for UG Semester Examination Enrollment, Supplementary exam fees, and Revaluation Xerox applications.
                  </p>

                  <div className="aku-admin-table-wrap">
                    <table className="aku-admin-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Institution</th>
                          <th>Challan Purpose</th>
                          <th>Amount (INR)</th>
                          <th>Bank Ref Number</th>
                          <th>Transaction Date</th>
                          <th>Settlement Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>TXN-2026-9812</strong></td>
                          <td>002 (Akshara DC, Pamur)</td>
                          <td>UG III &amp; V Sem Regular Bulk Fee</td>
                          <td><strong>₹ 1,42,800.00</strong></td>
                          <td>SBI-88123719</td>
                          <td>15-Oct-2026 11:20 AM</td>
                          <td><span className="aku-admin-badge-approved">Reconciled</span></td>
                        </tr>
                        <tr>
                          <td><strong>TXN-2026-9813</strong></td>
                          <td>001 (Govt DC, Ongole)</td>
                          <td>UG III Sem Supplementary Batch</td>
                          <td><strong>₹ 68,400.00</strong></td>
                          <td>SBI-88123720</td>
                          <td>15-Oct-2026 10:45 AM</td>
                          <td><span className="aku-admin-badge-approved">Reconciled</span></td>
                        </tr>
                        <tr>
                          <td><strong>TXN-2026-9814</strong></td>
                          <td>004 (Krishna Chaitanya, Markapur)</td>
                          <td>Revaluation Scripts Verification</td>
                          <td><strong>₹ 34,000.00</strong></td>
                          <td>SBI-88123721</td>
                          <td>14-Oct-2026 04:12 PM</td>
                          <td><span className="aku-admin-badge-approved">Reconciled</span></td>
                        </tr>
                        <tr>
                          <td><strong>TXN-2026-9815</strong></td>
                          <td>003 (Sri Vivekananda, Kandukur)</td>
                          <td>Exam Enrollment Chalana List Batch</td>
                          <td><strong>₹ 95,200.00</strong></td>
                          <td>SBI-88123722</td>
                          <td>14-Oct-2026 02:30 PM</td>
                          <td><span className="aku-admin-badge-approved">Reconciled</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* View 5: Theme Studio */}
              {activeView === 'theme-studio' && (
                <div className="aku-admin-panel-card">
                  <div className="aku-admin-panel-header">
                    <div className="aku-admin-panel-title-wrap">
                      <span className="aku-admin-panel-icon">🎨</span>
                      <div>
                        <h2 className="aku-admin-panel-title">Theme Studio &bull; University Visual Engine</h2>
                        <p className="aku-admin-panel-subtitle">Select portal aesthetic palette and toggle dark/light contrast</p>
                      </div>
                    </div>
                  </div>

                  <p style={{ color: 'var(--theme-text-muted, #64748b)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
                    Choose from 12 curated university color schemes designed with harmonious contrast and sleek glassmorphism.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '16px' }}>
                    {THEME_COLORS.map((t: ThemeColor) => (
                      <div
                        key={t.id}
                        onClick={() => setThemeId(t.id)}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: themeId === t.id ? '2.5px solid var(--theme-primary, #0369a1)' : '1.5px solid var(--theme-card-border, #cbd5e1)',
                          background: 'var(--theme-card-bg, #ffffff)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: themeId === t.id ? '0 6px 16px rgba(3, 105, 161, 0.25)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: t.primary,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            flexShrink: 0
                          }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.92rem', display: 'block', color: 'var(--theme-text-color, #0f172a)' }}>
                            {t.name}
                          </strong>
                          <span style={{ fontSize: '0.76rem', color: 'var(--theme-text-muted, #64748b)' }}>
                            {t.primary}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View 6: Generic Fallback for other subpages */}
              {!['overview', 'enrollment-dashboard', 'abc-id-dashboard', 'colleges-list', 'support-tickets', 'challan-reconciliation', 'theme-studio'].includes(activeView) && (
                <div className="aku-admin-panel-card">
                  <div className="aku-admin-panel-header">
                    <div className="aku-admin-panel-title-wrap">
                      <span className="aku-admin-panel-icon">⚙️</span>
                      <div>
                        <h2 className="aku-admin-panel-title">
                          {activeView.replace(/-/g, ' ').toUpperCase()}
                        </h2>
                        <p className="aku-admin-panel-subtitle">Controller of Examinations Subsystem Console</p>
                      </div>
                    </div>
                    <span className="aku-admin-badge-approved">Module Operational</span>
                  </div>

                  <p style={{ color: 'var(--theme-text-muted, #64748b)', margin: '0 0 20px 0', fontSize: '0.94rem', lineHeight: 1.6 }}>
                    The administrative module for <strong>{activeView.replace(/-/g, ' ').toUpperCase()}</strong> is configured and linked to the active university database for Academic Session 2025-2026.
                  </p>

                  <button
                    type="button"
                    onClick={() => handleSelectView('overview')}
                    style={{
                      background: 'var(--theme-primary, #0369a1)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                      boxShadow: '0 4px 12px rgba(3, 105, 161, 0.3)'
                    }}
                  >
                    ← Back to Admin Overview
                  </button>
                </div>
              )}

              {/* Official AKU Teal Footer Bar from user image */}
              <footer
                style={{
                  background: '#1797a6',
                  color: '#ffffff',
                  padding: '12px 24px',
                  marginTop: '40px',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  borderRadius: '4px',
                  boxShadow: '0 -2px 6px rgba(0,0,0,0.06)',
                }}
              >
                <div>
                  <span>Copyright &copy; </span>
                  <strong style={{ color: '#ffff00', fontWeight: 'bold' }}>2023 Andhra Kesari University.</strong>
                  <span> All rights reserved. Developed by </span>
                  <strong style={{ color: '#ffff00', fontWeight: 'bold' }}>D Base Solutions Private Limited.,</strong>
                </div>
                <div style={{ fontWeight: 700, letterSpacing: '0.3px' }}>
                  FOR TECHNICAL SUPPORT CONTACT : <a href="tel:9948708389" style={{ color: '#ffffff', textDecoration: 'underline' }}>9948708389</a>
                </div>
              </footer>
            </main>
          </div>

          {/* Raise Support Ticket Modal */}
          {ticketModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '20px',
              }}
              onClick={() => setTicketModalOpen(false)}
            >
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  maxWidth: '520px',
                  width: '100%',
                  padding: '28px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.4rem' }}>🎫</span>
                    <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#0f172a' }}>Raise Support Ticket</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTicketModalOpen(false)}
                    style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTicketSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      College / Department
                    </label>
                    <select
                      value={newTicketCollege}
                      onChange={(e) => setNewTicketCollege(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                    >
                      <option value="023 - GOVERNMENT DEGREE COLLEGE, CUMBUM">023 - GOVERNMENT DEGREE COLLEGE, CUMBUM</option>
                      <option value="001 - V.R.S. DEGREE COLLEGE, VEERAPURAM">001 - V.R.S. DEGREE COLLEGE, VEERAPURAM</option>
                      <option value="042 - SRI PRATAP DEGREE COLLEGE, MARKAPUR">042 - SRI PRATAP DEGREE COLLEGE, MARKAPUR</option>
                      <option value="078 - V.V. & M. DEGREE COLLEGE, ONGOLE">078 - V.V. & M. DEGREE COLLEGE, ONGOLE</option>
                      <option value="119 - BAPATLA COLLEGE OF ARTS & SCIENCES">119 - BAPATLA COLLEGE OF ARTS & SCIENCES</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Issue Category
                    </label>
                    <select
                      value={newTicketCategory}
                      onChange={(e) => setNewTicketCategory(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem' }}
                    >
                      <option value="Exam Enrollment">Exam Enrollment</option>
                      <option value="Challan / Payment Status">Challan / Payment Status</option>
                      <option value="ABC ID / APAAR Issue">ABC ID / APAAR Issue</option>
                      <option value="Student Correction">Student Correction</option>
                      <option value="Results / TR Sheet">Results / TR Sheet</option>
                      <option value="Portal Login / Password">Portal Login / Password</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Subject / Issue Summary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Unable to submit supplementary student enrollment batch..."
                      value={newTicketSubject}
                      onChange={(e) => setNewTicketSubject(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                      Detailed Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Provide specific roll numbers, transaction IDs, or error codes..."
                      value={newTicketDesc}
                      onChange={(e) => setNewTicketDesc(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setTicketModalOpen(false)}
                      style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AdminMain;
