import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { navigationItems } from '../mock/navigation';

const SIDEBAR_STORAGE_KEY = 'techmatch.sidebar.collapsed';
const THEME_STORAGE_KEY = 'techmatch.theme.mode';

type ThemeMode = 'dark' | 'light';

function getStorageItem(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = getStorageItem(THEME_STORAGE_KEY);

  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export function AppShell() {
  const location = useLocation();
  const currentSection =
    navigationItems.find((item) => item.path === location.pathname) ?? navigationItems[0];
  const isHome = location.pathname === '/';
  const isChat = location.pathname.startsWith('/chat/');
  const isAuth = location.pathname === '/auth';
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return getStorageItem(SIDEBAR_STORAGE_KEY) === '1';
  });

  useEffect(() => {
    setStorageItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0');
  }, [sidebarCollapsed]);

  useEffect(() => {
    setStorageItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <div className={sidebarCollapsed ? 'app-shell app-shell-collapsed' : 'app-shell'}>
      <div className="app-backdrop" aria-hidden="true">
        <div className="app-backdrop-image" />
        <div className="app-backdrop-glow app-backdrop-glow-left" />
        <div className="app-backdrop-glow app-backdrop-glow-right" />
      </div>

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <main className={isHome || isChat || isAuth ? 'main-panel main-panel-home' : 'main-panel'}>
        {!isHome && !isChat && !isAuth ? (
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
