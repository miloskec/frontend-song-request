import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import App from '@/App';
import { BizDashboardShowcasePage } from '@/pages/dj/BizDashboardShowcasePage';
import { DashboardPage } from '@/pages/dj/DashboardPage';
import { ListsPage } from '@/pages/dj/ListsPage';
import { QueuePage } from '@/pages/dj/QueuePage';
import { RequestsPage } from '@/pages/dj/RequestsPage';
import { SettingsPage } from '@/pages/dj/SettingsPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { PublicPage } from '@/pages/guest/PublicPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuthStore } from '@/stores';

function RequireAuth({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();
  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/guest" replace /> },
      { path: 'guest', element: <PublicPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dj',
        element: (
          <RequireAuth>
            <Navigate to="/dj/queue" replace />
          </RequireAuth>
        ),
      },
      {
        path: 'dj/dashboard',
        element: (
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dj/requests',
        element: (
          <RequireAuth>
            <RequestsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dj/queue',
        element: (
          <RequireAuth>
            <QueuePage />
          </RequireAuth>
        ),
      },
      {
        path: 'dj/showcase',
        element: (
          <RequireAuth>
            <BizDashboardShowcasePage />
          </RequireAuth>
        ),
      },
      {
        path: 'dj/settings',
        element: (
          <RequireAuth>
            <SettingsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dj/lists',
        element: (
          <RequireAuth>
            <ListsPage />
          </RequireAuth>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
