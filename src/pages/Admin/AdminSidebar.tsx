import React, { useState, useEffect } from 'react';
import { AdminMenuItem, fetchAdminMenu, getAdminSession } from '../../services/akuApi';
import './AdminSidebar.css';

export type AdminPageView =
  | 'overview'
  | 'colleges-list'
  | 'college-approvals'
  | 'college-intake'
  | 'session-mgmt'
  | 'exam-centers'
  | 'hall-tickets'
  | 'results-gazette'
  | 'challan-reconciliation'
  | 'fee-defaulters'
  | 'daily-settlement'
  | 'rv-desk'
  | 'script-allocation'
  | 'retotaling-reports'
  | 'support-tickets'
  | 'college-users'
  | 'admin-roles'
  | 'audit-logs'
  | 'theme-studio'
  | string;

export interface AdminSidebarProps {
  activeView: AdminPageView;
  onSelectView: (view: AdminPageView) => void;
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
  adminInfo?: {
    name: string;
    role: string;
    department: string;
    mobile?: string;
  };
  pendingTicketCount?: number;
  menuItems?: AdminMenuItem[];
}

/**
 * Dynamic icon resolution based on API iConClass or text keyword
 */
const getIconForClass = (iconClass: string, text: string): string => {
  const lowerIcon = (iconClass || '').toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerIcon.includes('home') || lowerText.includes('home')) return '🏠';
  if (lowerIcon.includes('briefcase') || lowerText.includes('masters')) return '💼';
  if (lowerIcon.includes('building') || lowerText.includes('college')) return '🏫';
  if (lowerIcon.includes('pen') || lowerText.includes('correction')) return '✏️';
  if (lowerIcon.includes('clipboard') || lowerText.includes('marks')) return '📝';
  if (lowerIcon.includes('settings') || lowerText.includes('settings')) return '⚙️';
  if (lowerIcon.includes('listchecks') || lowerText.includes('time table') || lowerText.includes('center')) return '📅';
  if (lowerIcon.includes('filecheck') || lowerText.includes('enroll') || lowerText.includes('results')) return '📋';
  if (lowerIcon.includes('filedown') || lowerText.includes('reports') || lowerText.includes('count')) return '📊';
  if (lowerIcon.includes('arrow') || lowerText.includes('transaction') || lowerText.includes('payment')) return '💳';
  if (lowerIcon.includes('rotate') || lowerText.includes('readmission') || lowerText.includes('transfer')) return '🔄';
  if (lowerIcon.includes('file') || lowerText.includes('bill')) return '🧾';
  if (lowerText.includes('hall ticket')) return '🎫';
  if (lowerText.includes('permission')) return '🛡️';
  if (lowerText.includes('notification')) return '📢';
  if (lowerText.includes('issue')) return '⚠️';
  return '📁';
};

/**
 * Maps menu navigateurl and text to dashboard PageView
 */
const mapUrlOrTextToView = (navigateurl: string, text: string): AdminPageView => {
  const normUrl = (navigateurl || '').toLowerCase();
  const normText = text.toLowerCase();

  if (normUrl === '/home' || normText.includes('home dashboard') || normText === 'overview') return 'overview';
  if (normUrl === '/colleges' || normText === 'colleges') return 'colleges-list';
  if (normText.includes('permission')) return 'college-approvals';
  if (normText.includes('time table') || normText.includes('session')) return 'session-mgmt';
  if (normText.includes('exam center') || normText.includes('centers')) return 'exam-centers';
  if (normText.includes('hall ticket')) return 'hall-tickets';
  if (normText.includes('result') || normText.includes('gazette')) return 'results-gazette';
  if (normUrl.includes('challan') || normText.includes('challan') || normText.includes('payment')) return 'challan-reconciliation';
  if (normText.includes('rv') || normText.includes('revaluation')) return 'rv-desk';
  if (normText.includes('credential') || normText.includes('user')) return 'college-users';
  if (normText.includes('role') || normText.includes('admin permissions')) return 'admin-roles';
  if (normText.includes('issue log') || normText.includes('audit')) return 'audit-logs';
  if (normText.includes('support')) return 'support-tickets';
  
  return navigateurl !== '#' ? navigateurl : text;
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onSelectView,
  sidebarOpen,
  adminInfo = {
    name: 'AKUADMIN',
    role: 'DBSAdmin',
    department: 'UG Examination Branch, AKU',
    mobile: '9177011550',
  },
  pendingTicketCount = 3,
  menuItems,
}) => {
  // Purely dynamic menu state: 100% loaded from live API / session (zero hardcoded fallback)
  const [menuList, setMenuList] = useState<AdminMenuItem[]>(() => {
    if (menuItems && menuItems.length > 0) return menuItems;
    const session = getAdminSession();
    if (session.menu && session.menu.length > 0) return session.menu;
    return [];
  });

  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(menuList.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Accordion open/collapse map keyed by menuid
  const [openGroupIds, setOpenGroupIds] = useState<Record<string, boolean>>({
    '2': true, // Masters open by default
    '5': false,
  });

  const fetchLiveMenu = (userId: string) => {
    setIsLoadingMenu(true);
    setLoadError(null);

    fetchAdminMenu(userId)
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setMenuList(items);
        } else {
          setLoadError('No menu items returned from server for user ' + userId);
        }
      })
      .catch((err) => {
        console.warn('Failed to load dynamic admin menu from API:', err);
        setLoadError(err.message || 'Failed to connect to API server.');
      })
      .finally(() => {
        setIsLoadingMenu(false);
      });
  };

  // Live API synchronization on mount
  useEffect(() => {
    if (menuItems && menuItems.length > 0) {
      setMenuList(menuItems);
      setIsLoadingMenu(false);
      return;
    }

    const session = getAdminSession();
    if (session.menu && session.menu.length > 0) {
      setMenuList(session.menu);
      setIsLoadingMenu(false);
      return;
    }

    const userId = adminInfo.name || 'AKUADMIN';
    fetchLiveMenu(userId);
  }, [menuItems, adminInfo.name]);

  // Build hierarchical menu groups from flat API list
  const parentItems = menuList.filter((item) => !item.smenuid || item.smenuid === '');
  const menuGroups = parentItems.map((parent) => {
    const children = menuList.filter(
      (child) => child.menuid === parent.menuid && child.smenuid && child.smenuid !== ''
    );
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

  const isChildActive = (child: AdminMenuItem) => {
    const mapped = mapUrlOrTextToView(child.navigateurl, child.text);
    return activeView === mapped || activeView === child.text || activeView === child.navigateurl;
  };

  const isGroupActive = (children: AdminMenuItem[]) => {
    return children.some((child) => isChildActive(child));
  };

  return (
    <aside className={`aku-admin-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
      {/* University Officer Profile Header */}
      <div className="aku-admin-profile-card">
        <div className="aku-admin-emblem-wrap">
          <span>🏛️</span>
        </div>
        <h4 className="aku-admin-role-title">Andhra Kesari University</h4>
        <div className="aku-admin-dept-subtitle">
          {adminInfo.name} &bull; {adminInfo.role}
        </div>
        {adminInfo.mobile && (
          <div style={{ fontSize: '0.72rem', opacity: 0.85, marginTop: '2px', color: 'var(--theme-primary, #0284c7)', fontWeight: 600 }}>
            📞 {adminInfo.mobile}
          </div>
        )}
        <div className="aku-admin-status-pill">
          <span className="aku-admin-pulse-dot"></span>
          <span>Active Session 2025-26</span>
        </div>
      </div>

      {/* Dynamic API Navigation Tree */}
      <div className="aku-admin-nav-tree">
        <span className="aku-admin-nav-section-label">University Control Systems</span>

        {/* Loading skeleton while fetching live from GET /LoadAdminMenu */}
        {isLoadingMenu && menuList.length === 0 && (
          <div style={{ padding: '12px 6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--theme-primary, #0284c7)', fontWeight: 700 }}>
              ⚡ Loading live menu from /LoadAdminMenu...
            </span>
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              onClick={() => fetchLiveMenu(adminInfo.name || 'AKUADMIN')}
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

        {/* 100% Dynamic Menu Items Rendered from API */}
        {menuGroups.map(({ parent, children }) => {
          const icon = getIconForClass(parent.iConClass, parent.text);
          const hasChildren = children.length > 0;
          const isOpen = !!openGroupIds[parent.menuid];
          const groupActive = isGroupActive(children);

          // If item has no subitems (e.g. "Home Dashboard") -> render as standalone direct button
          if (!hasChildren) {
            const isHome = parent.menuid === '1' || parent.text.toLowerCase().includes('home');
            const isActive = isHome ? activeView === 'overview' : activeView === parent.text;

            return (
              <button
                key={parent.menuid}
                type="button"
                className={`aku-admin-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => {
                  const targetView = isHome ? 'overview' : mapUrlOrTextToView(parent.navigateurl, parent.text);
                  onSelectView(targetView);
                }}
                title={parent.description || parent.text}
              >
                <div className="aku-admin-nav-btn-left">
                  <span className="aku-admin-nav-icon">{icon}</span>
                  <span>{parent.text}</span>
                </div>
                {isActive && <span>●</span>}
              </button>
            );
          }

          // Otherwise render as collapsible accordion group
          return (
            <div key={parent.menuid} className="aku-admin-nav-group">
              <button
                type="button"
                className={`aku-admin-nav-btn ${groupActive ? 'active' : ''}`}
                onClick={() => toggleGroup(parent.menuid)}
                title={parent.description || parent.text}
              >
                <div className="aku-admin-nav-btn-left">
                  <span className="aku-admin-nav-icon">{icon}</span>
                  <span>{parent.text}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    opacity: 0.75,
                    background: 'rgba(0, 0, 0, 0.06)',
                    padding: '1px 5px',
                    borderRadius: '8px'
                  }}>
                    {children.length}
                  </span>
                  <span className={`aku-admin-nav-arrow ${isOpen ? 'open' : ''}`}>▼</span>
                </div>
              </button>

              {isOpen && (
                <div className="aku-admin-subitems">
                  {children.map((child) => {
                    const active = isChildActive(child);
                    const childIcon = getIconForClass(child.iConClass, child.text);

                    return (
                      <button
                        key={`${child.menuid}-${child.smenuid}`}
                        type="button"
                        className={`aku-admin-subitem-btn ${active ? 'active' : ''}`}
                        onClick={() => {
                          const targetView = mapUrlOrTextToView(child.navigateurl, child.text);
                          onSelectView(targetView);
                        }}
                        title={child.description || child.text}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.82rem' }}>{childIcon !== '📁' ? childIcon : '•'}</span>
                          <span>{child.text}</span>
                        </span>
                        {child.navigateurl && child.navigateurl !== '#' && child.navigateurl.endsWith('.aspx') && (
                          <span style={{ fontSize: '0.64rem', opacity: 0.65 }}>.ASPX</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Support Tickets Quick Action */}
        <div style={{ marginTop: '8px' }}>
          <button
            type="button"
            className={`aku-admin-nav-btn ${activeView === 'support-tickets' ? 'active' : ''}`}
            onClick={() => onSelectView('support-tickets')}
            title="College Support & Enquiry Tickets"
          >
            <div className="aku-admin-nav-btn-left">
              <span className="aku-admin-nav-icon">🎫</span>
              <span>Support Tickets</span>
            </div>
            {pendingTicketCount > 0 && (
              <span className="aku-admin-badge-count">{pendingTicketCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* Theme Studio Dedicated Footer Card */}
      <div className="aku-admin-sidebar-footer">
        <button
          type="button"
          className={`aku-admin-theme-btn ${activeView === 'theme-studio' ? 'active' : ''}`}
          onClick={() => onSelectView('theme-studio')}
          title="Open Theme Customizer for Admin Portal"
        >
          <div className="aku-admin-theme-left">
            <span style={{ fontSize: '1.2rem' }}>🎨</span>
            <div>
              <span className="aku-admin-theme-title">Theme Studio</span>
              <span className="aku-admin-theme-sub">Colors &amp; Dark Theme</span>
            </div>
          </div>
          <span>➔</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
