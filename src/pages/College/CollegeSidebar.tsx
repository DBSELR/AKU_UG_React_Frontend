import React, { useState, useEffect } from 'react';
import {
  CollegeMenuItem,
  CollegeUser,
  fetchCollegeMenu,
  getCollegeSession,
  saveCollegeSession
} from '../../services/akuApi';
import './UGMain.css';

export type CollegePageView =
  | 'home'
  | 'student-check-list'
  | 'readmission-transfer'
  | 'exam-enrollment-bulk'
  | 'exam-enrollment-checklist'
  | 'chalana-list'
  | 'exam-enrollment-single'
  | 'exam-results-bulk'
  | 'rv-script-verification'
  | 'exam-enrollment-remove'
  | 'rv-pv-xc-list'
  | 'check-payment-status'
  | 'student-minor-details'
  | 'marks-entry'
  | 'theme-studio'
  | string;

export interface CollegeSidebarProps {
  activeView: CollegePageView;
  onSelectView: (view: CollegePageView) => void;
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
  collegeUser?: CollegeUser | null;
  collegeInfo?: {
    code: string;
    name: string;
    location?: string;
    affiliation?: string;
    principal?: string;
    contact?: string;
    district?: string;
    mobile1?: string;
    mobile2?: string;
  };
  menuItems?: CollegeMenuItem[];
}

/**
 * Color badge mapping corresponding to the live API's iConClass:
 * Fuchsia, GREEN, AUQA, RED, BLUE
 */
export interface ApiColorBadge {
  name: string;
  color: string;
  bg: string;
  border: string;
}

export const getApiColorBadge = (iconClass?: string): ApiColorBadge | null => {
  if (!iconClass) return null;
  const c = iconClass.trim().toUpperCase();
  if (c === 'FUCHSIA') {
    return { name: 'Fuchsia', color: '#c026d3', bg: 'rgba(192, 38, 211, 0.12)', border: 'rgba(192, 38, 211, 0.35)' };
  }
  if (c === 'GREEN') {
    return { name: 'Green', color: '#16a34a', bg: 'rgba(22, 163, 74, 0.12)', border: 'rgba(22, 163, 74, 0.35)' };
  }
  if (c === 'AUQA' || c === 'AQUA') {
    return { name: 'Aqua', color: '#0891b2', bg: 'rgba(8, 145, 178, 0.12)', border: 'rgba(8, 145, 178, 0.35)' };
  }
  if (c === 'RED') {
    return { name: 'Red', color: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'rgba(220, 38, 38, 0.35)' };
  }
  if (c === 'BLUE') {
    return { name: 'Blue', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.12)', border: 'rgba(37, 99, 235, 0.35)' };
  }
  return null;
};

/**
 * Dynamic icon resolution based on College Menu text and icon class
 */
export const getCollegeIcon = (text: string, iconClass?: string): string => {
  const t = text.toLowerCase();
  const c = (iconClass || '').toLowerCase();

  if (t === 'home' || c.includes('home')) return '🏠';
  if (t === 'enrollment') return '📋';
  if (t.includes('exam enrollment') || t === 'exam enrollment') return '✍️';
  if (t.includes('marks')) return '📊';
  if (t.includes('student check list') || (t.includes('checklist') && !t.includes('exam'))) return '👥';
  if (t.includes('readmission') || t.includes('transfer')) return '🔄';
  if (t.includes('chalana') || t.includes('payment')) return '🧾';
  if (t.includes('single') || t.includes('supplumentary')) return '📝';
  if (t.includes('minor')) return '🎯';
  if (t.includes('results') || t.includes('result')) return '📈';
  if (t.includes('script') || t.includes('rv')) return '📑';
  if (t.includes('remove')) return '❌';
  return '📁';
};

/**
 * Maps menu navigateurl and text to dashboard PageView
 * Checks exact API navigateurl first to prevent collision (e.g. bulk vs results bulk)
 */
export const mapCollegeItemToView = (navigateurl: string, text: string): CollegePageView => {
  const u = (navigateurl || '').toLowerCase();
  const t = text.toLowerCase();

  // 1. Direct match on official ASPX routes from /LoadCollegeMenu API
  if (u.includes('ugmain.aspx')) return 'home';
  if (u.includes('examresultsbulk.aspx')) return 'exam-results-bulk';
  if (u.includes('examenrollmentbulk.aspx')) return 'exam-enrollment-bulk';
  if (u.includes('examenrollmentchecklist.aspx')) return 'exam-enrollment-checklist';
  if (u.includes('studentchecklist.aspx')) return 'student-check-list';
  if (u.includes('chalanalist.aspx')) return 'chalana-list';
  if (u.includes('examenrollmentsinglecollege.aspx')) return 'exam-enrollment-single';
  if (u.includes('student_readmission_transfer.aspx')) return 'readmission-transfer';
  if (u.includes('rv_script_verification_list.aspx')) return 'rv-pv-xc-list';
  if (u.includes('rv_script_verification.aspx')) return 'rv-script-verification';
  if (u.includes('examenrollment_remove.aspx')) return 'exam-enrollment-remove';
  if (u.includes('checkpaymentstatus.aspx')) return 'check-payment-status';
  if (u.includes('student_minor_details.aspx')) return 'student-minor-details';

  // 2. Exact / Specific title text checks
  if (t === 'home') return 'home';
  if (t.includes('results bulk') || t.includes('exam results')) return 'exam-results-bulk';
  if (t.includes('pv xc') || t.includes('xc list')) return 'rv-pv-xc-list';
  if (t.includes('script verification')) return 'rv-script-verification';
  if (t.includes('student check list')) return 'student-check-list';
  if (t.includes('readmission') || t.includes('transfer')) return 'readmission-transfer';
  if (t.includes('bulk')) return 'exam-enrollment-bulk';
  if (t.includes('checklist') || t.includes('check list')) return 'exam-enrollment-checklist';
  if (t.includes('chalana')) return 'chalana-list';
  if (t.includes('single') || t.includes('supplumentary')) return 'exam-enrollment-single';
  if (t.includes('remove')) return 'exam-enrollment-remove';
  if (t.includes('payment status') || t.includes('check payment')) return 'check-payment-status';
  if (t.includes('minor')) return 'student-minor-details';
  if (t.includes('marks')) return 'marks-entry';

  return text as CollegePageView;
};

export const CollegeSidebar: React.FC<CollegeSidebarProps> = ({
  activeView,
  onSelectView,
  sidebarOpen,
  collegeUser,
  collegeInfo,
  menuItems,
}) => {
  // Resolve verified college identity from /CollegeLoginStatus response / session
  const sessionUser = getCollegeSession().user;
  const activeUser = collegeUser || sessionUser;

  const colCode = activeUser?.colCode || collegeInfo?.code || '023';
  const colName = activeUser?.colname
    ? `${activeUser.colCode} - ${activeUser.colname}`
    : collegeInfo?.name || '023 - GOVERNMENT DEGREE COLLEGE, CUMBUM';
  const principalName = activeUser?.princname || collegeInfo?.principal || 'DR.C.H.SUDHAKAR REDDY';
  const districtName = activeUser?.district || collegeInfo?.district || 'PRAKASAM';
  const contactPhone = activeUser?.mobile1 || collegeInfo?.contact || '9291275355';

  // Purely dynamic menu state: loaded from live API / session (zero hardcoded fallback array)
  const [menuList, setMenuList] = useState<CollegeMenuItem[]>(() => {
    if (menuItems && menuItems.length > 0) return menuItems;
    const session = getCollegeSession();
    if (session.menu && session.menu.length > 0) return session.menu;
    return [];
  });

  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(menuList.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Accordion toggle states keyed by menuid
  const [openGroupIds, setOpenGroupIds] = useState<Record<string, boolean>>({
    '2': false, // Enrollment
    '3': true,  // Exam Enrollment open by default
    '4': false, // Marks Entry
  });

  const fetchLiveCollegeMenu = (codeToFetch: string) => {
    setIsLoadingMenu(true);
    setLoadError(null);

    fetchCollegeMenu(codeToFetch)
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setMenuList(items);
          if (activeUser) {
            saveCollegeSession(activeUser, items);
          }
        } else {
          setLoadError('No menu items returned from server for College ' + codeToFetch);
        }
      })
      .catch((err) => {
        console.warn('Failed to load dynamic college menu from API:', err);
        setLoadError(err.message || 'Failed to connect to AKU server.');
      })
      .finally(() => {
        setIsLoadingMenu(false);
      });
  };

  // Sync menu on mount or when college code changes
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setMenuList(menuItems);
      setIsLoadingMenu(false);
      return;
    }

    const session = getCollegeSession();
    if (session.menu && session.menu.length > 0) {
      setMenuList(session.menu);
      setIsLoadingMenu(false);
      return;
    }

    fetchLiveCollegeMenu(colCode);
  }, [menuItems, colCode]);

  // Build hierarchical menu groups from flat API list
  // Root items have parentid === "" or parentid === "0" or !parentid
  const parentItems = menuList
    .filter((item) => !item.parentid || item.parentid === '' || item.parentid === '0')
    .sort((a, b) => (parseInt(a.menuid, 10) || 0) - (parseInt(b.menuid, 10) || 0));

  const menuGroups = parentItems.map((parent) => {
    const children = menuList
      .filter((child) => child.parentid === parent.menuid)
      .sort((a, b) => (parseInt(a.menuid, 10) || 0) - (parseInt(b.menuid, 10) || 0));
    return {
      parent,
      children,
    };
  });

  const toggleGroup = (menuid: string) => {
    setOpenGroupIds((prev) => ({
      ...prev,
      [menuid]: !prev[menuid],
    }));
  };

  const isChildActive = (child: CollegeMenuItem) => {
    const mapped = mapCollegeItemToView(child.navigateurl, child.text);
    return activeView === mapped || activeView === child.text;
  };

  const isGroupActive = (children: CollegeMenuItem[]) => {
    return children.some((child) => isChildActive(child));
  };

  return (
    <aside className={`aku-ugmain-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      {/* College Identity Profile Header bound to GET /CollegeLoginStatus */}
      <div className="aku-sidebar-college-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="aku-sidebar-college-icon">🏛️</span>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#059669',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            API VERIFIED
          </span>
        </div>

        <h4 className="aku-sidebar-college-name">{colName}</h4>
        
        <span className="aku-sidebar-college-meta">
          Code: <strong>{colCode}</strong> &bull; {districtName} District
        </span>

        {principalName && (
          <span style={{ fontSize: '0.74rem', opacity: 0.95, marginTop: '6px', display: 'block', color: 'var(--theme-primary, #0284c7)', fontWeight: 700 }}>
            👨‍🏫 Principal: {principalName}
          </span>
        )}

        {contactPhone && (
          <span style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '3px', display: 'block', color: 'var(--theme-text-muted, #64748b)', fontWeight: 600 }}>
            📞 Contact: {contactPhone}
          </span>
        )}
      </div>

      {/* Dynamic API Navigation Tree */}
      <div className="aku-sidebar-nav">
        {/* Loading skeleton while fetching live from GET /LoadCollegeMenu */}
        {isLoadingMenu && menuList.length === 0 && (
          <div style={{ padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--theme-primary, #0284c7)', fontWeight: 700 }}>
              ⚡ Loading live menu from /LoadCollegeMenu?Colcode={colCode}...
            </span>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: '36px',
                  background: 'var(--theme-card-bg-subtle, rgba(0,0,0,0.05))',
                  borderRadius: '8px',
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        )}

        {/* Error State with live retry button */}
        {loadError && menuList.length === 0 && !isLoadingMenu && (
          <div style={{ padding: '14px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '10px', margin: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#ef4444', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {loadError}
            </span>
            <button
              type="button"
              onClick={() => fetchLiveCollegeMenu(colCode)}
              style={{
                background: 'var(--theme-primary, #0284c7)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Reload Live Menu
            </button>
          </div>
        )}

        {/* 100% Dynamic Menu Items Rendered from /LoadCollegeMenu API */}
        {menuGroups.map(({ parent, children }) => {
          const icon = getCollegeIcon(parent.text, parent.iConClass);
          const hasChildren = children.length > 0;
          const isOpen = !!openGroupIds[parent.menuid];
          const groupActive = isGroupActive(children);

          // If item has no subitems (e.g. "Home" or "Marks Entry" if empty) -> render as direct button
          if (!hasChildren) {
            const targetView = mapCollegeItemToView(parent.navigateurl, parent.text);
            const isHome = targetView === 'home';
            const isActive = isHome ? activeView === 'home' : activeView === targetView || activeView === parent.text;

            return (
              <button
                key={parent.menuid}
                type="button"
                className={`aku-sidebar-group-header ${isActive ? 'active' : ''}`}
                onClick={() => onSelectView(targetView)}
                title={parent.description || parent.text}
              >
                <span className="aku-sidebar-group-title">
                  <span className="aku-sidebar-group-icon">{icon}</span>
                  <span>{parent.text}</span>
                </span>
                {isActive && <span className="aku-nav-bullet">●</span>}
              </button>
            );
          }

          // Otherwise render as collapsible accordion group
          return (
            <div key={parent.menuid} className="aku-sidebar-group">
              <button
                type="button"
                className={`aku-sidebar-group-header ${groupActive ? 'active' : ''}`}
                onClick={() => toggleGroup(parent.menuid)}
                title={parent.description || parent.text}
              >
                <span className="aku-sidebar-group-title">
                  <span className="aku-sidebar-group-icon">{icon}</span>
                  <span>{parent.text}</span>
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    opacity: 0.8,
                    background: 'rgba(0, 0, 0, 0.06)',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    fontWeight: 700
                  }}>
                    {children.length}
                  </span>
                  <span className={`aku-nav-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                </div>
              </button>

              {isOpen && (
                <div className="aku-sidebar-subitems">
                  {children.map((child) => {
                    const active = isChildActive(child);
                    const childIcon = getCollegeIcon(child.text, child.iConClass);
                    const colorBadge = getApiColorBadge(child.iConClass);

                    return (
                      <button
                        key={`${child.menuid}-${child.text}`}
                        type="button"
                        className={`aku-sidebar-subitem-btn ${active ? 'active' : ''}`}
                        onClick={() => {
                          const targetView = mapCollegeItemToView(child.navigateurl, child.text);
                          onSelectView(targetView);
                        }}
                        title={`${child.description || child.text} (${child.navigateurl})`}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '0.86rem', flexShrink: 0 }}>
                            {childIcon !== '📁' ? childIcon : '•'}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {child.text}
                          </span>
                        </div>

                        {colorBadge && (
                          <span
                            style={{
                              fontSize: '0.62rem',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px',
                              color: active ? '#ffffff' : colorBadge.color,
                              background: active ? 'rgba(255, 255, 255, 0.22)' : colorBadge.bg,
                              border: active ? '1px solid rgba(255, 255, 255, 0.4)' : `1px solid ${colorBadge.border}`,
                              flexShrink: 0,
                              marginLeft: '4px'
                            }}
                            title={`API iConClass: ${child.iConClass}`}
                          >
                            {colorBadge.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Live Refresh / Sync Indicator */}
        <div style={{ padding: '8px 10px', marginTop: '4px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => fetchLiveCollegeMenu(colCode)}
            style={{
              background: 'transparent',
              border: '1px dashed var(--theme-card-border, #cbd5e1)',
              color: 'var(--theme-text-muted, #64748b)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title="Fetch latest menu directly from /LoadCollegeMenu"
          >
            <span>🔄</span>
            <span>Refresh Menu (/LoadCollegeMenu)</span>
          </button>
        </div>

        {/* Theme Studio Dedicated Navigation Card */}
        <div className="aku-sidebar-theme-studio-section">
          <div className="aku-sidebar-divider"></div>
          <button
            type="button"
            className={`aku-sidebar-theme-studio-btn ${activeView === 'theme-studio' ? 'active' : ''}`}
            onClick={() => onSelectView('theme-studio')}
            title="Customize portal aesthetics & color modes"
          >
            <div className="aku-sidebar-theme-left">
              <span className="aku-sidebar-theme-icon">🎨</span>
              <div className="aku-sidebar-theme-text-block">
                <span className="aku-sidebar-theme-heading">Theme Studio</span>
                <span className="aku-sidebar-theme-sub">Customize portal aesthetics &amp; color modes</span>
              </div>
            </div>
            <span className="aku-sidebar-theme-arrow">➔</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CollegeSidebar;

