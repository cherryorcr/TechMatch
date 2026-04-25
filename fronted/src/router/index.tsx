import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../layout/AppShell';
import { navigationItems } from '../mock/navigation';
import { AuthPage } from '../pages/AuthPage';
import { ChatPage } from '../pages/ChatPage';
import { FileCenterPage } from '../pages/FileCenterPage';
import { HistoryPage } from '../pages/HistoryPage';
import { HomePage } from '../pages/HomePage';
import { PlaceholderPage } from '../pages/PlaceholderPage';

const placeholderRoutes = navigationItems
  .filter((item) => item.path !== '/' && item.path !== '/files' && item.path !== '/history')
  .map((item) => ({
    path: item.path.slice(1),
    element: (
      <PlaceholderPage
        title={item.label}
        description={item.summary}
        highlights={item.highlights}
      />
    ),
  }));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'chat/:sessionId',
        element: <ChatPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'files',
        element: <FileCenterPage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      ...placeholderRoutes,
    ],
  },
]);
