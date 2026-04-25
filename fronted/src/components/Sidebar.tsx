import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChatSessions } from '../context/ChatSessionsContext';
import { navigationItems } from '../mock/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onThemeToggle: () => void;
  theme: 'dark' | 'light';
}

type SidebarIconKey =
  | 'account'
  | 'apps'
  | 'competitions'
  | 'courses'
  | 'files'
  | 'history'
  | 'home'
  | 'knowledge'
  | 'library'
  | 'notebooks'
  | 'scholars'
  | 'sciencepedia'
  | 'subscription'
  | 'theme-dark'
  | 'theme-light';

const HISTORY_SECTION_KEY = 'techmatch.sidebar.history.expanded';
const WORKSPACE_SECTION_KEY = 'techmatch.sidebar.workspace.expanded';

function SidebarIcon({ iconKey }: { iconKey: SidebarIconKey }) {
  switch (iconKey) {
    case 'home':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );
    case 'history':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
          <path d="M4.5 5.5v4h4" />
          <path d="M12 8.4v4.1l2.8 1.7" />
        </svg>
      );
    case 'files':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M7 4.8h6l4 4v10.4H7z" />
          <path d="M13 4.8v4h4" />
          <path d="M9.6 13h4.8" />
          <path d="M12 10.6v4.8" />
        </svg>
      );
    case 'subscription':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M7 9.2a5 5 0 0 1 10 0c0 5.2 2 6.6 2 6.6H5s2-1.4 2-6.6Z" />
          <path d="M10 18.4a2.2 2.2 0 0 0 4 0" />
        </svg>
      );
    case 'library':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M5 6.5h10v12H5z" />
          <path d="M15 6.5h4v12h-4" />
          <path d="M8 9.5h4" />
        </svg>
      );
    case 'scholars':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M12 13.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
          <path d="M5.5 18.6a6.8 6.8 0 0 1 13 0" />
        </svg>
      );
    case 'knowledge':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M12 6.5c-4.2 0-7 1.4-7 3.2v4.6c0 1.8 2.8 3.2 7 3.2s7-1.4 7-3.2V9.7c0-1.8-2.8-3.2-7-3.2Z" />
          <path d="M5 12c0 1.8 2.8 3.2 7 3.2s7-1.4 7-3.2" />
        </svg>
      );
    case 'sciencepedia':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="1.8" />
          <path d="M12 4.8c2.8 2 4.4 4.5 4.4 7.2S14.8 17.2 12 19.2c-2.8-2-4.4-4.5-4.4-7.2S9.2 6.8 12 4.8Z" />
          <path d="M5.8 8.6c3.4-.1 6.1.8 7.8 2.8s2.4 4.7 2 8c-3.4.1-6.1-.8-7.8-2.8s-2.4-4.7-2-8Z" />
        </svg>
      );
    case 'notebooks':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M7 5.5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7z" />
          <path d="M7 5.5H5v13h2" />
          <path d="M10 9h5" />
          <path d="M10 12.5h5" />
        </svg>
      );
    case 'competitions':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M8 5.5h8v2.3a4 4 0 0 1-1.5 3.1L12 13l-2.5-2.1A4 4 0 0 1 8 7.8Z" />
          <path d="M10 13.8h4" />
          <path d="M9 18.5h6" />
          <path d="M7.5 5.8H5.8A1.8 1.8 0 0 0 4 7.6c0 2 1.7 3.6 3.8 3.6H8" />
          <path d="M16 11.2h.2A3.8 3.8 0 0 0 20 7.6a1.8 1.8 0 0 0-1.8-1.8h-1.7" />
        </svg>
      );
    case 'courses':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M4 9.4 12 5l8 4.4-8 4.4Z" />
          <path d="M7 11.4v3.2c0 1.2 2.2 2.4 5 2.4s5-1.2 5-2.4v-3.2" />
        </svg>
      );
    case 'apps':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <rect x="5" y="5" width="5" height="5" rx="1.2" />
          <rect x="14" y="5" width="5" height="5" rx="1.2" />
          <rect x="5" y="14" width="5" height="5" rx="1.2" />
          <rect x="14" y="14" width="5" height="5" rx="1.2" />
        </svg>
      );
    case 'theme-light':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.7" />
          <path d="M12 4v2.2" />
          <path d="M12 17.8V20" />
          <path d="M4 12h2.2" />
          <path d="M17.8 12H20" />
          <path d="m6.4 6.4 1.6 1.6" />
          <path d="m16 16 1.6 1.6" />
          <path d="m17.6 6.4-1.6 1.6" />
          <path d="M8 16 6.4 17.6" />
        </svg>
      );
    case 'theme-dark':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M16.6 14.8a5.8 5.8 0 0 1-7.4-7.4 6.6 6.6 0 1 0 7.4 7.4Z" />
        </svg>
      );
    case 'account':
      return (
        <svg aria-hidden="true" className="sidebar-icon" viewBox="0 0 24 24">
          <path d="M12 12.8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M5.2 18.8a7.2 7.2 0 0 1 13.6 0" />
        </svg>
      );
    default:
      return null;
  }
}

export function Sidebar({ collapsed, onToggle, onThemeToggle, theme }: SidebarProps) {
  const location = useLocation();
  const { isLoadingSessions, sessionSummaries } = useChatSessions();
  const primaryItems = navigationItems.filter((item) => item.group === 'primary');
  const workspaceItems = navigationItems.filter((item) => item.group === 'workspace');
  const [historyExpanded, setHistoryExpanded] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.localStorage.getItem(HISTORY_SECTION_KEY) !== '0';
  });
  const [workspaceExpanded, setWorkspaceExpanded] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(WORKSPACE_SECTION_KEY) === '1';
  });
  const historyRouteActive =
    location.pathname === '/history' || location.pathname.startsWith('/chat/');

  useEffect(() => {
    window.localStorage.setItem(HISTORY_SECTION_KEY, historyExpanded ? '1' : '0');
  }, [historyExpanded]);

  useEffect(() => {
    window.localStorage.setItem(WORKSPACE_SECTION_KEY, workspaceExpanded ? '1' : '0');
  }, [workspaceExpanded]);

  return (
    <aside className={collapsed ? 'sidebar sidebar-collapsed' : 'sidebar'}>
      <div className={collapsed ? 'sidebar-brand sidebar-brand-compact' : 'sidebar-brand'}>
        <NavLink className={collapsed ? 'brand-link brand-link-compact' : 'brand-link'} to="/">
          <span className="brand-logo-shell">
            <img alt="TechMatch" className="brand-logo" src="/techmatch-logo.svg" />
          </span>

          {!collapsed ? (
            <span className="brand-copy">
              <strong>TechMatch</strong>
              <span>科研成果智能匹配平台</span>
            </span>
          ) : null}
        </NavLink>

        <button
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          className={collapsed ? 'sidebar-toggle sidebar-toggle-compact' : 'sidebar-toggle'}
          onClick={onToggle}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav className="sidebar-nav sidebar-nav-primary" aria-label="Primary">
        {primaryItems.map((item) => (
          <NavLink
            key={item.id}
            end={item.path === '/'}
            className={({ isActive }) =>
              item.id === 'history'
                ? historyRouteActive
                  ? 'new-chat-button new-chat-button-active'
                  : 'new-chat-button'
                : isActive
                  ? 'new-chat-button new-chat-button-active'
                  : 'new-chat-button'
            }
            title={item.label}
            to={item.path}
          >
            <span className={`new-chat-plus sidebar-icon-shell sidebar-icon-shell-${item.iconKey}`}>
              <SidebarIcon iconKey={item.iconKey as SidebarIconKey} />
            </span>
            <span className="new-chat-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {!collapsed ? (
        <>
          <section className="sidebar-accordion">
            <div className="sidebar-accordion-head">
              <span className="sidebar-section-link">最近会话</span>

              <button
                aria-label={historyExpanded ? '收起历史对话' : '展开历史对话'}
                className={historyExpanded ? 'sidebar-expander sidebar-expander-open' : 'sidebar-expander'}
                onClick={() => setHistoryExpanded((current) => !current)}
                type="button"
              >
                <span />
              </button>
            </div>

            {historyExpanded ? (
              <div className="history-list">
                {sessionSummaries.length > 0 ? (
                  sessionSummaries.map((session) => (
                    <NavLink
                      key={session.id}
                      className={({ isActive }) =>
                        isActive ? 'history-item history-item-active' : 'history-item'
                      }
                      to={`/chat/${session.id}`}
                    >
                      <strong>{session.title}</strong>
                      <span>{session.modeLabel}</span>
                    </NavLink>
                  ))
                ) : (
                  <div className="sidebar-empty-state">
                    {isLoadingSessions ? '正在加载会话...' : '暂无历史会话'}
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <section className="sidebar-accordion">
            <div className="sidebar-accordion-head">
              <span className="sidebar-section-link">工作区</span>

              <button
                aria-label={workspaceExpanded ? '收起工作区' : '展开工作区'}
                className={workspaceExpanded ? 'sidebar-expander sidebar-expander-open' : 'sidebar-expander'}
                onClick={() => setWorkspaceExpanded((current) => !current)}
                type="button"
              >
                <span />
              </button>
            </div>

            {workspaceExpanded ? (
              <nav className="sidebar-nav" aria-label="Workspace">
                {workspaceItems.map((item) => (
                  <NavLink
                    key={item.id}
                    className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
                    title={item.label}
                    to={item.path}
                  >
                    <span className={`nav-icon sidebar-icon-shell sidebar-icon-shell-${item.iconKey}`}>
                      <SidebarIcon iconKey={item.iconKey as SidebarIconKey} />
                    </span>
                    <span className="nav-text">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            ) : null}
          </section>
        </>
      ) : null}

      <div className="sidebar-footer">
        <button
          aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
          className="theme-toggle"
          onClick={onThemeToggle}
          title={theme === 'dark' ? '浅色模式' : '深色模式'}
          type="button"
        >
          <span className="theme-toggle-badge">
            <SidebarIcon iconKey={theme === 'dark' ? 'theme-light' : 'theme-dark'} />
          </span>
          <span className="theme-toggle-copy">
            <strong>{theme === 'dark' ? '浅色模式' : '深色模式'}</strong>
            <span>{theme === 'dark' ? '切换到更清爽的白天视图' : '回到更专注的夜间研究视图'}</span>
          </span>
        </button>

        <NavLink
          className={({ isActive }) =>
            isActive ? 'account-entry account-entry-active' : 'account-entry'
          }
          title="登录 / 注册"
          to="/auth"
        >
          <span className="account-avatar">
            <SidebarIcon iconKey="account" />
          </span>
          <span className="account-copy">
            <strong>登录 / 注册</strong>
            <span>同步账号、历史记录与工作空间</span>
          </span>
        </NavLink>
      </div>
    </aside>
  );
}
