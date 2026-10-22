import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IonPage, IonContent } from '@ionic/react';
import { useTheme, THEME_COLORS } from '../../theme/ThemeContext';
import { getCollegeSession, clearCollegeSession, CollegeUser, CollegeMenuItem } from '../../services/akuApi';
import CollegeSidebar, { CollegePageView } from './CollegeSidebar';
import './UGMain.css';
import '../Home.css';
import UniversityFooter from '../../components/UniversityFooter';

// Type definitions for subpages
type PageView = CollegePageView;

interface MockStudent {
  regNo: string;
  name: string;
  course: string;
  sem: string;
  status: string;
  feeStatus: string;
}

interface ExamLinkItem {
  id: string;
  view: PageView;
  icon: string;
  category: 'REGISTRATION' | 'CHALLAN' | 'RESULTS' | 'REVALUATION' | 'STUDENTS';
  title: string;
  desc: string;
  isNew: boolean;
}

const EXAM_LINKS_DATA: ExamLinkItem[] = [
  {
    id: 'bulk-enroll',
    view: 'exam-enrollment-bulk',
    icon: '📋',
    category: 'REGISTRATION',
    title: 'CLICK HERE for Exam Enrollment Bulk Registrations',
    desc: 'Register regular batch candidates in bulk with single consolidated submission',
    isNew: true,
  },
  {
    id: 'suppl-enroll',
    view: 'exam-enrollment-single',
    icon: '📝',
    category: 'REGISTRATION',
    title: 'CLICK HERE for Exam Enrollment Supplumentary',
    desc: 'Enroll backlog and supplementary subject candidates for semester exams',
    isNew: true,
  },
  {
    id: 'checklist',
    view: 'exam-enrollment-checklist',
    icon: '✔️',
    category: 'REGISTRATION',
    title: 'CLICK HERE for ExamEnrollment Checklist',
    desc: 'Generate, verify, and download student enrollment checklist reports',
    isNew: true,
  },
  {
    id: 'chalana-list',
    view: 'chalana-list',
    icon: '🧾',
    category: 'CHALLAN',
    title: 'CLICK HERE for Exam Enrollment ChalanaList',
    desc: 'Print SBI/University payment challan statement and bank receipts',
    isNew: true,
  },
  {
    id: 'minor-selection',
    view: 'student-minor-details',
    icon: '🎯',
    category: 'STUDENTS',
    title: 'Click Here for Student Minor Selection for 2025 ADMITTED BATCH',
    desc: 'Assign and update multidisciplinary minor subjects for 2025 admissions',
    isNew: true,
  },
  {
    id: 'results-bulk',
    view: 'exam-results-bulk',
    icon: '📊',
    category: 'RESULTS',
    title: 'CLICK HERE for Exam Results Bulk',
    desc: 'Consolidated marks statements and semester result gazettes',
    isNew: true,
  },
  {
    id: 'readmission-transfer',
    view: 'readmission-transfer',
    icon: '🔄',
    category: 'STUDENTS',
    title: 'CLICK HERE for Student Readmission/Transfer',
    desc: 'College transfers, course changes and syllabus readmission approvals',
    isNew: true,
  },
  {
    id: 'rv-script',
    view: 'rv-script-verification',
    icon: '📑',
    category: 'REVALUATION',
    title: 'CLICK HERE for RV or Obtaining Xerox Copy Registration (for individual student only)',
    desc: 'Apply for personal script verification, answer book xerox, and re-totaling',
    isNew: true,
  },
  {
    id: 'enroll-remove',
    view: 'exam-enrollment-remove',
    icon: '❌',
    category: 'REGISTRATION',
    title: 'Exam Registration Enrollment Remove',
    desc: 'Cancel duplicate or erroneous candidate examination applications',
    isNew: true,
  },
  {
    id: 'rv-report',
    view: 'rv-pv-xc-list',
    icon: '📈',
    category: 'REVALUATION',
    title: 'CLICK HERE for Report for RV or Obtaining Xerox Copy Registration Report',
    desc: 'Consolidated tracking and status reporting for all revaluation batches',
    isNew: true,
  },
  {
    id: 'student-checklist',
    view: 'student-check-list',
    icon: '👥',
    category: 'STUDENTS',
    title: 'CLICK HERE for Student Check List(s)',
    desc: 'Complete enrolled candidate profiles, regulations, and roll numbers',
    isNew: true,
  },
  {
    id: 'payment-status',
    view: 'check-payment-status',
    icon: '💳',
    category: 'CHALLAN',
    title: 'Check Payment Status',
    desc: 'Verify live challan transaction reconciliation and payment confirmation',
    isNew: true,
  },
];

const mockStudentsData: MockStudent[] = [
  { regNo: 'Y23AKU101001', name: 'K. SIVA RAMA KRISHNA', course: 'B.Sc (Computer Science)', sem: 'III', status: 'Enrolled', feeStatus: 'Paid' },
  { regNo: 'Y23AKU101002', name: 'M. VENKATA SAI TEJA', course: 'B.Sc (Computer Science)', sem: 'III', status: 'Enrolled', feeStatus: 'Paid' },
  { regNo: 'Y23AKU101003', name: 'P. LAKSHMI PRASANNA', course: 'B.Com (General)', sem: 'III', status: 'Enrolled', feeStatus: 'Paid' },
  { regNo: 'Y23AKU101004', name: 'V. ANIL KUMAR REDDY', course: 'B.Com (Computer Apps)', sem: 'V', status: 'Enrolled', feeStatus: 'Pending' },
  { regNo: 'Y23AKU101005', name: 'T. BHAVANI SANKAR', course: 'B.A (HEP)', sem: 'V', status: 'Enrolled', feeStatus: 'Paid' },
  { regNo: 'Y23AKU101006', name: 'CH. SWETHA REDDY', course: 'B.Sc (Data Science)', sem: 'III', status: 'Approved', feeStatus: 'Paid' },
  { regNo: 'Y23AKU101007', name: 'B. PAVAN KALYAN', course: 'B.Sc (Computer Science)', sem: 'V', status: 'Enrolled', feeStatus: 'Paid' },
];

const UGMain: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeId, setThemeId, isDark, toggleDarkMode, setShowThemeModal } = useTheme();

  // Active view / side page
  const [activeView, setActiveView] = useState<PageView>('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Exam Links filter & search states
  const [examCategory, setExamCategory] = useState<string>('ALL');
  const [examSearch, setExamSearch] = useState<string>('');

  // Raise Ticket Modal State
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketCategory, setTicketCategory] = useState('Exam Enrollment');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Filter / Search states for data tables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedSem, setSelectedSem] = useState('ALL');

  // Load College profile & menu from active session or navigation state
  const [collegeUser] = useState<CollegeUser | null>(() => {
    return (location.state as any)?.collegeUser || getCollegeSession().user;
  });
  const [collegeMenu] = useState<CollegeMenuItem[]>(() => {
    return (location.state as any)?.menuItems || getCollegeSession().menu;
  });

  // College details bound to verified live API login
  const collegeInfo = collegeUser
    ? {
        code: collegeUser.colCode,
        name: `${collegeUser.colCode} - ${collegeUser.colname}`,
        location: `${collegeUser.district} District`,
        principal: collegeUser.princname,
        contact: collegeUser.mobile1,
        district: collegeUser.district,
        mobile1: collegeUser.mobile1,
        mobile2: collegeUser.mobile2,
        affiliation: 'Affiliated to Andhra Kesari University, Ongole'
      }
    : {
        code: '023',
        name: '023 - GOVERNMENT DEGREE COLLEGE, CUMBUM',
        location: 'Cumbum, Prakasam District',
        principal: 'DR.C.H.SUDHAKAR REDDY',
        contact: '9291275355',
        district: 'PRAKASAM',
        mobile1: '9291275355',
        mobile2: '',
        affiliation: 'Affiliated to Andhra Kesari University, Ongole'
      };

  const handleLogout = () => {
    clearCollegeSession();
    navigate('/login');
  };

  const handleSelectView = (view: PageView) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered Exam Links based on category and search
  const filteredExamLinks = EXAM_LINKS_DATA.filter((link) => {
    const matchesCategory = examCategory === 'ALL' || link.category === examCategory;
    const matchesSearch =
      examSearch.trim() === '' ||
      link.title.toLowerCase().includes(examSearch.toLowerCase()) ||
      link.desc.toLowerCase().includes(examSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRaiseTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketModalOpen(false);
      setTicketSubject('');
      setTicketDesc('');
      alert('Support Ticket #AKU-TK-' + Math.floor(100000 + Math.random() * 900000) + ' created successfully! Technical Support will contact you shortly.');
    }, 600);
  };

  // Filtered students for side-page tables
  const filteredStudents = mockStudentsData.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.regNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = selectedCourse === 'ALL' || student.course.includes(selectedCourse);
    const matchesSem = selectedSem === 'ALL' || student.sem === selectedSem;
    return matchesSearch && matchesCourse && matchesSem;
  });

  return (
    <IonPage>
      <IonContent fullscreen className="aku-ion-content">
        <div className="aku-ugmain-page">
          {/* Top Navbar */}
          <header className="aku-ugmain-header">
            <div className="aku-ugmain-header-left">
              {/* Sidebar toggle button */}
              <button
                type="button"
                className="aku-sidebar-toggle-btn"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Toggle Sidebar Menu"
                aria-label="Toggle Sidebar"
              >
                ☰
              </button>

              {/* Logo & Portal Title */}
              <div
                className="aku-ugmain-brand"
                onClick={() => handleSelectView('home')}
                title="Andhra Kesari University - College Examination Portal"
              >
                <img
                  src="/assets/logo.png"
                  alt="AKU Logo"
                  className="aku-ugmain-logo"
                />
                
              </div>
            </div>

           

            {/* Right Side: College Pill, Themes, Logout */}
            <div className="aku-ugmain-header-right">
              {/* College Badge */}
              <div className="aku-college-pill" title={collegeInfo.name}>
                <span className="aku-college-pill-dot"></span>
                <span>{collegeInfo.name}</span>
              </div>

              {/* Theme Studio Trigger */}
              <button
                type="button"
                className="aku-theme-btn"
                onClick={() => setShowThemeModal(true)}
                title="Theme Studio - Customize portal aesthetics & color modes"
              >
                <span className="aku-theme-dot"></span>
                <span>🎨 Theme Studio</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                type="button"
                className="aku-theme-btn"
                onClick={toggleDarkMode}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <span>{isDark ? '☀️' : '🌙'}</span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                className="aku-btn-logout"
                onClick={handleLogout}
                title="Sign out of College Portal"
              >
                <span>Logout</span>
                <span>🚪</span>
              </button>
            </div>
          </header>

          {/* Technical Support & Ticket Bar with Auto-Scrolling Scroller */}
          <div className="aku-tech-support-bar">
            {/* Live Support Indicator Badge */}
            <div className="aku-support-live-badge">
              <span className="aku-support-ping-dot"></span>
              <span className="aku-support-badge-text">SUPPORT HELPDESK</span>
            </div>

            {/* Continuous Left-to-Right & Right-to-Left Auto-Scrolling Scroller */}
            <div
              className="aku-support-scroller-viewport"
              title="Continuous auto-scroller (Hover to pause)"
            >
              <div className="aku-support-scroller-track">
                <div className="aku-support-timing-scroller">
                  <span className="aku-support-phone-icon">📞</span>
                  <span className="aku-support-title">TECHNICAL SUPPORT :</span>
                  <a
                    href="tel:9948889680"
                    className="aku-support-phone-link"
                    title="Click to dial 9948889680"
                  >
                    9948889680
                  </a>
                  <span className="aku-support-divider">|</span>
                  <span className="aku-support-clock-icon">🕒</span>
                  <span className="aku-support-hours">Mon-Sat : 10:00 AM to 5:30 PM</span>
                </div>
              </div>
            </div>

            {/* Raise Ticket Button */}
            <button
              type="button"
              className="aku-btn-raise-ticket"
              onClick={() => setTicketModalOpen(true)}
              title="Click here if you have any issues"
            >
              <span className="aku-ticket-icon">🎫</span>
              <span>If You Have Any Issue Please Raise Ticket</span>
            </button>
          </div>

          {/* Main Layout: Sidebar + Dynamic Content */}
          <div className="aku-ugmain-layout">
            {/* Separate College Sidebar Component */}
            <CollegeSidebar
              activeView={activeView}
              onSelectView={handleSelectView}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              collegeInfo={collegeInfo}
              collegeUser={collegeUser}
              menuItems={collegeMenu}
            />

            {/* Main Content Area */}
            <main className="aku-ugmain-content">
              {/* Breadcrumb Navigation */}
              <div className="aku-breadcrumb-bar">
                <div className="aku-breadcrumbs">
                  <span className="aku-breadcrumb-link" onClick={() => handleSelectView('home')}>
                    Home
                  </span>
                  <span>/</span>
                  {activeView !== 'home' ? (
                    <span className="aku-breadcrumb-current">
                      {activeView.replace(/-/g, ' ').toUpperCase()}
                    </span>
                  ) : (
                    <span className="aku-breadcrumb-current">UG SEMESTER EXAMINATION PORTAL</span>
                  )}
                </div>

                {activeView !== 'home' && (
                  <button
                    type="button"
                    className="aku-btn-back-overview"
                    onClick={() => handleSelectView('home')}
                  >
                    <span>← Back to UG Semester Links</span>
                  </button>
                )}
              </div>

              {/* Overview Metrics Cards */}
              <div className="aku-metrics-row">
                <div className="aku-metric-card">
                  <div className="aku-metric-icon" style={{ background: 'rgba(3, 105, 161, 0.1)', color: '#0284c7' }}>
                    👥
                  </div>
                  <div className="aku-metric-info">
                    <span className="aku-metric-value">485</span>
                    <span className="aku-metric-label">Enrolled Students</span>
                  </div>
                </div>

                <div className="aku-metric-card">
                  <div className="aku-metric-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                    📝
                  </div>
                  <div className="aku-metric-info">
                    <span className="aku-metric-value">412</span>
                    <span className="aku-metric-label">Exam Registrations</span>
                  </div>
                </div>

                <div className="aku-metric-card">
                  <div className="aku-metric-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                    💳
                  </div>
                  <div className="aku-metric-info">
                    <span className="aku-metric-value">₹ 0.00</span>
                    <span className="aku-metric-label">Pending Challan Due</span>
                  </div>
                </div>

                <div className="aku-metric-card">
                  <div className="aku-metric-icon" style={{ background: 'rgba(147, 51, 234, 0.1)', color: '#9333ea' }}>
                    📈
                  </div>
                  <div className="aku-metric-info">
                    <span className="aku-metric-value">100%</span>
                    <span className="aku-metric-label">Approval Status</span>
                  </div>
                </div>
              </div>

              {/* View 1: Home Dashboard with 12 UG Semester Examination Links */}
              {activeView === 'home' && (
                <section className="aku-exam-links-section" id="description">
                  {/* Modern Header */}
                  <div className="aku-section-header">
                    <div className="aku-section-title-wrap">
                      <span className="aku-section-icon">🎓</span>
                      <div>
                        <h2 className="aku-section-title">UG Semester Examination Links</h2>
                        <p className="aku-section-subtitle-text">
                          Official Examination &amp; Enrollment Action Portal for Affiliated Degree Colleges
                        </p>
                      </div>
                    </div>
                    <span className="aku-section-badge">
                      <span className="aku-pulse-dot"></span>
                      Active Academic Session 2025-2026
                    </span>
                  </div>

                  {/* Filter Toolbar: Categories + Live Search */}
                  <div className="aku-exam-toolbar">
                    <div className="aku-exam-category-tabs">
                      <button
                        type="button"
                        className={`aku-exam-cat-btn ${examCategory === 'ALL' ? 'active' : ''}`}
                        onClick={() => setExamCategory('ALL')}
                      >
                        All Links ({EXAM_LINKS_DATA.length})
                      </button>
                      <button
                        type="button"
                        className={`aku-exam-cat-btn ${examCategory === 'REGISTRATION' ? 'active' : ''}`}
                        onClick={() => setExamCategory('REGISTRATION')}
                      >
                        📋 Registration ({EXAM_LINKS_DATA.filter((l) => l.category === 'REGISTRATION').length})
                      </button>
                      <button
                        type="button"
                        className={`aku-exam-cat-btn ${examCategory === 'CHALLAN' ? 'active' : ''}`}
                        onClick={() => setExamCategory('CHALLAN')}
                      >
                        🧾 Challan &amp; Fee ({EXAM_LINKS_DATA.filter((l) => l.category === 'CHALLAN').length})
                      </button>
                      <button
                        type="button"
                        className={`aku-exam-cat-btn ${examCategory === 'RESULTS' ? 'active' : ''}`}
                        onClick={() => setExamCategory('RESULTS')}
                      >
                        📊 Results ({EXAM_LINKS_DATA.filter((l) => l.category === 'RESULTS').length})
                      </button>
                      <button
                        type="button"
                        className={`aku-exam-cat-btn ${examCategory === 'REVALUATION' ? 'active' : ''}`}
                        onClick={() => setExamCategory('REVALUATION')}
                      >
                        📑 Revaluation ({EXAM_LINKS_DATA.filter((l) => l.category === 'REVALUATION').length})
                      </button>
                      <button
                        type="button"
                        className={`aku-exam-cat-btn ${examCategory === 'STUDENTS' ? 'active' : ''}`}
                        onClick={() => setExamCategory('STUDENTS')}
                      >
                        👥 Student Services ({EXAM_LINKS_DATA.filter((l) => l.category === 'STUDENTS').length})
                      </button>
                    </div>

                    <div className="aku-exam-search-box">
                      <span className="aku-exam-search-icon">🔍</span>
                      <input
                        type="text"
                        className="aku-exam-search-input"
                        placeholder="Search examination links..."
                        value={examSearch}
                        onChange={(e) => setExamSearch(e.target.value)}
                      />
                      {examSearch && (
                        <button
                          type="button"
                          onClick={() => setExamSearch('')}
                          style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                          }}
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 12 Modern Action Cards Grid with anew.gif badge */}
                  {filteredExamLinks.length > 0 ? (
                    <div className="aku-links-grid">
                      {filteredExamLinks.map((item) => (
                        <div
                          key={item.id}
                          className="aku-link-card-modern"
                          onClick={() => handleSelectView(item.view)}
                          title={item.title}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectView(item.view);
                            }
                          }}
                        >
                          <div className="aku-link-card-left">
                            <div className="aku-link-card-icon-modern">
                              <span>{item.icon}</span>
                            </div>
                            <div className="aku-link-card-content">
                              <div className="aku-link-card-meta">
                                <span className="aku-link-category-pill">{item.category}</span>
                              </div>
                              <div className="aku-link-card-title-row">
                                <span className="aku-link-card-title">{item.title}</span>
                                {item.isNew && (
                                  <img
                                    src="/assets/anew.gif"
                                    alt="NEW"
                                    className="aku-exam-new-gif"
                                    title="Active / New Notification"
                                  />
                                )}
                              </div>
                              <span className="aku-link-card-desc">{item.desc}</span>
                            </div>
                          </div>
                          <span className="aku-link-card-arrow-modern" aria-hidden="true">
                            ➔
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: '40px 20px',
                        textAlign: 'center',
                        color: 'var(--theme-text-muted, #64748b)',
                      }}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔍</div>
                      <p style={{ fontWeight: 700, margin: '0 0 6px 0' }}>No examination links found</p>
                      <p style={{ fontSize: '0.84rem', margin: '0 0 16px 0' }}>
                        No results matched "{examSearch}". Try a different keyword or reset filters.
                      </p>
                      <button
                        type="button"
                        className="aku-btn-back-overview"
                        onClick={() => {
                          setExamCategory('ALL');
                          setExamSearch('');
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* View 2: Side Pages (Dedicated Subpage Panels) */}
              {activeView !== 'home' && activeView !== 'theme-studio' && (
                <section className="aku-subpage-card">
                  <div className="aku-subpage-header">
                    <div className="aku-subpage-title-group">
                      <span className="aku-subpage-icon">
                        {activeView === 'student-check-list' && '👥'}
                        {activeView === 'readmission-transfer' && '🔄'}
                        {activeView === 'exam-enrollment-bulk' && '📝'}
                        {activeView === 'exam-enrollment-checklist' && '✔️'}
                        {activeView === 'chalana-list' && '🧾'}
                        {activeView === 'exam-enrollment-single' && '👤'}
                        {activeView === 'exam-results-bulk' && '📊'}
                        {activeView === 'rv-script-verification' && '🔍'}
                        {activeView === 'exam-enrollment-remove' && '❌'}
                        {activeView === 'rv-pv-xc-list' && '📑'}
                        {activeView === 'check-payment-status' && '💳'}
                        {activeView === 'student-minor-details' && '🎓'}
                        {activeView === 'marks-entry' && '📊'}
                      </span>
                      <h3 className="aku-subpage-title">
                        {activeView === 'student-check-list' && 'Student Check List'}
                        {activeView === 'readmission-transfer' && 'Student Readmission & Transfers'}
                        {activeView === 'exam-enrollment-bulk' && 'Exam Enrollment Bulk Registrations'}
                        {activeView === 'exam-enrollment-checklist' && 'Exam Enrollment CheckList'}
                        {activeView === 'chalana-list' && 'Challan Payment List'}
                        {activeView === 'exam-enrollment-single' && 'Exam Enrollment Single / Supplementary'}
                        {activeView === 'exam-results-bulk' && 'Exam Results Bulk Export'}
                        {activeView === 'rv-script-verification' && 'Revaluation & Xerox Copy Registration'}
                        {activeView === 'exam-enrollment-remove' && 'Exam Enrollment Removal'}
                        {activeView === 'rv-pv-xc-list' && 'RV / PV / XC Verified List'}
                        {activeView === 'check-payment-status' && 'Payment & Challan Status'}
                        {activeView === 'student-minor-details' && 'Student Minor Details (2025 Admitted Batch)'}
                        {activeView === 'marks-entry' && 'UG Semester Marks Entry'}
                      </h3>
                    </div>

                    <div className="aku-subpage-actions">
                      <button
                        type="button"
                        className="aku-btn-action"
                        onClick={() => alert(`Exporting ${activeView} report to PDF/Excel for ${collegeInfo.name}...`)}
                      >
                        <span>📥 Download PDF Report</span>
                      </button>
                      <button
                        type="button"
                        className="aku-btn-action-outline"
                        onClick={() => alert('Refreshing live university records...')}
                      >
                        <span>🔄 Refresh</span>
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="aku-filter-bar">
                    <div className="aku-filter-item">
                      <label>Search:</label>
                      <input
                        type="text"
                        placeholder="Search by Reg No or Name..."
                        className="aku-filter-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="aku-filter-item">
                      <label>Course:</label>
                      <select
                        className="aku-filter-select"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        <option value="ALL">All Courses</option>
                        <option value="B.Sc">B.Sc</option>
                        <option value="B.Com">B.Com</option>
                        <option value="B.A">B.A</option>
                      </select>
                    </div>

                    <div className="aku-filter-item">
                      <label>Semester:</label>
                      <select
                        className="aku-filter-select"
                        value={selectedSem}
                        onChange={(e) => setSelectedSem(e.target.value)}
                      >
                        <option value="ALL">All Semesters</option>
                        <option value="I">Semester I</option>
                        <option value="II">Semester II</option>
                        <option value="III">Semester III</option>
                        <option value="IV">Semester IV</option>
                        <option value="V">Semester V</option>
                        <option value="VI">Semester VI</option>
                      </select>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div className="aku-table-wrapper">
                    <table className="aku-data-table">
                      <thead>
                        <tr>
                          <th>Sl.No</th>
                          <th>Register Number</th>
                          <th>Candidate Name</th>
                          <th>Course Name</th>
                          <th>Semester</th>
                          <th>Enrollment Status</th>
                          <th>Payment Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((st, idx) => (
                            <tr key={st.regNo}>
                              <td>{idx + 1}</td>
                              <td><strong>{st.regNo}</strong></td>
                              <td>{st.name}</td>
                              <td>{st.course}</td>
                              <td>Sem {st.sem}</td>
                              <td>
                                <span className={`aku-badge-status ${st.status === 'Enrolled' || st.status === 'Approved' ? 'aku-badge-success' : 'aku-badge-info'}`}>
                                  {st.status}
                                </span>
                              </td>
                              <td>
                                <span className={`aku-badge-status ${st.feeStatus === 'Paid' ? 'aku-badge-success' : 'aku-badge-pending'}`}>
                                  {st.feeStatus}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="aku-btn-action-outline"
                                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                                  onClick={() => alert(`Viewing details for candidate ${st.regNo} - ${st.name}`)}
                                >
                                  View / Print
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                              No matching student records found for the applied filter.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* View 3: Dedicated Theme Studio In-Page Experience */}
              {activeView === 'theme-studio' && (
                <section className="aku-theme-studio-page">
                  <div className="aku-theme-studio-header-card">
                    <div className="aku-theme-studio-title-group">
                      <span className="aku-theme-studio-icon-large">🎨</span>
                      <div>
                        <h2 className="aku-theme-studio-main-title">Theme Studio</h2>
                        <p className="aku-theme-studio-tagline">
                          Customize portal aesthetics &amp; color modes
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="aku-btn-action"
                      onClick={() => setShowThemeModal(true)}
                    >
                      <span>✨ Open Theme Studio Modal</span>
                    </button>
                  </div>

                  {/* Display Mode Selection */}
                  <div className="aku-theme-section-block">
                    <span className="aku-theme-block-label">
                      <span>🌓</span>
                      <span>Display Surface Mode</span>
                    </span>
                    <div className="aku-theme-mode-row">
                      <button
                        type="button"
                        className={`aku-theme-mode-card ${!isDark ? 'active' : ''}`}
                        onClick={() => isDark && toggleDarkMode()}
                      >
                        <span style={{ fontSize: '1.4rem' }}>☀️</span>
                        <span>Crisp Light Mode</span>
                      </button>
                      <button
                        type="button"
                        className={`aku-theme-mode-card ${isDark ? 'active' : ''}`}
                        onClick={() => !isDark && toggleDarkMode()}
                      >
                        <span style={{ fontSize: '1.4rem' }}>🌙</span>
                        <span>Sleek Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  {/* 12 Color Palettes */}
                  <div className="aku-theme-section-block">
                    <span className="aku-theme-block-label">
                      <span>🎨</span>
                      <span>Color Palettes ({THEME_COLORS.length} Handcrafted Palettes)</span>
                    </span>
                    <div className="aku-theme-palettes-grid">
                      {THEME_COLORS.map((t) => {
                        const isSelected = themeId === t.id;
                        return (
                          <div
                            key={t.id}
                            className={`aku-theme-palette-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => setThemeId(t.id)}
                            title={`Select ${t.name} Palette`}
                          >
                            <div
                              className="aku-theme-circle-swatch"
                              style={{
                                background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)`,
                              }}
                            >
                              {isSelected && <span>✓</span>}
                            </div>
                            <span className="aku-theme-palette-name">{t.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}
            </main>
          </div>

          {/* Raise Support Ticket Modal */}
          {ticketModalOpen && (
            <div className="aku-ticket-modal-overlay" onClick={() => setTicketModalOpen(false)}>
              <div className="aku-ticket-modal" onClick={(e) => e.stopPropagation()}>
                <div className="aku-ticket-modal-header">
                  <h3>
                    <span>🎫</span>
                    <span>Raise Technical Support Ticket</span>
                  </h3>
                  <button
                    type="button"
                    className="aku-ticket-modal-close"
                    onClick={() => setTicketModalOpen(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                </div>

                <form onSubmit={handleRaiseTicketSubmit} className="aku-ticket-modal-body">
                  <div className="aku-ticket-field">
                    <label>College Code &amp; Name</label>
                    <input
                      type="text"
                      className="aku-ticket-input"
                      value={collegeInfo.name}
                      disabled
                    />
                  </div>

                  <div className="aku-ticket-field">
                    <label htmlFor="ticketCategory">Issue Category</label>
                    <select
                      id="ticketCategory"
                      className="aku-ticket-select"
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                    >
                      <option value="Exam Enrollment">Exam Enrollment Registration Issue</option>
                      <option value="Challan Payment">Challan / Payment Status Mismatch</option>
                      <option value="Student Minor">Student Minor Details Discrepancy</option>
                      <option value="Marks Entry">Marks Entry Portal Issue</option>
                      <option value="Student Readmission">Student Readmission / Transfer</option>
                      <option value="Other">Other Technical Assistance</option>
                    </select>
                  </div>

                  <div className="aku-ticket-field">
                    <label htmlFor="ticketSubject">Subject / Reg No(s)</label>
                    <input
                      id="ticketSubject"
                      type="text"
                      className="aku-ticket-input"
                      placeholder="e.g. Bulk Registration Challan Verification"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="aku-ticket-field">
                    <label htmlFor="ticketDesc">Detailed Problem Description</label>
                    <textarea
                      id="ticketDesc"
                      rows={4}
                      className="aku-ticket-textarea"
                      placeholder="Please explain the issue along with candidate register numbers..."
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="aku-ticket-modal-actions">
                    <button
                      type="button"
                      className="aku-btn-action-outline"
                      onClick={() => setTicketModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="aku-btn-raise-ticket"
                      disabled={ticketSubmitted}
                    >
                      <span>{ticketSubmitted ? 'Submitting Ticket...' : 'Submit Support Ticket'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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

export default UGMain;
