import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useChatSessions } from '../context/ChatSessionsContext';
import { navigationItems } from '../mock/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const HISTORY_SECTION_KEY = 'techmatch.sidebar.history.expanded';
const WORKSPACE_SECTION_KEY = 'techmatch.sidebar.workspace.expanded';

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { sortedSessions } = useChatSessions();
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
      <div className="sidebar-brand">
        <NavLink className="brand-link" to="/">
          <span className="brand-logo-shell">
            <img alt="TechMatch" className="brand-logo" src="/techmatch-logo.svg" />
          </span>

          <span className="brand-copy">
            <strong>TechMatch</strong>
            <span>科研成果智能匹配平台</span>
          </span>
        </NavLink>

        <button
          aria-label={collapsed ? '展开侧边栏' : '收起侧边栏'}
          className="sidebar-toggle"
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
            <span className="new-chat-plus">{item.id === 'home' ? '+' : item.shortLabel.slice(0, 1)}</span>
            <span className="new-chat-text">{item.label}</span>
          </NavLink>
        ))}
      </nav>

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
            {sortedSessions.map((session) => (
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
            ))}
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
                <span className={`nav-icon nav-icon-${item.iconKey}`}>{item.shortLabel}</span>
                <span className="nav-text">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        ) : null}
      </section>
    </aside>
  );
}
