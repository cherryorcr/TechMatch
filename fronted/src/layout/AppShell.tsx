import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { navigationItems } from '../mock/navigation';

const SIDEBAR_STORAGE_KEY = 'techmatch.sidebar.collapsed';

export function AppShell() {
  const location = useLocation();
  const currentSection =
    navigationItems.find((item) => item.path === location.pathname) ?? navigationItems[0];
  const isHome = location.pathname === '/';
  const isChat = location.pathname.startsWith('/chat/');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1';
  });

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  return (
    <div className={sidebarCollapsed ? 'app-shell app-shell-collapsed' : 'app-shell'}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />

      <main className={isHome || isChat ? 'main-panel main-panel-home' : 'main-panel'}>
        {!isHome && !isChat ? (
          <header className="topbar">
            <div>
              <span className="eyebrow">Workspace</span>
              <h2>{currentSection.label}</h2>
              <p>{currentSection.summary}</p>
            </div>
          </header>
        ) : null}

        <section className="page-surface">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
