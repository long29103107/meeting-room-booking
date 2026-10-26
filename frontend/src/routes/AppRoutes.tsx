import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { AppShell } from '../components/layout/AppShell';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { CalendarPage } from '../pages/CalendarPage';
import { CompanyBookingsPage } from '../pages/CompanyBookingsPage';
import { LoginPage } from '../pages/LoginPage';
import { MyBookingsPage } from '../pages/MyBookingsPage';
import { RoomsPage } from '../pages/RoomsPage';
import { ROUTE_PATHS } from './routePaths';

function RequireAuthentication() {
  const { auth } = useWorkspace();
  return auth ? <Outlet /> : <Navigate to="/login" replace />;
}

function RequireAdministrator() {
  const { admin, workspaceReady } = useWorkspace();
  if (!workspaceReady) return <p className="loading" role="status">Loading your workspace…</p>;
  return admin ? <Outlet /> : <Navigate to={ROUTE_PATHS.ROOMS} replace />;
}

function LoginRoute() {
  const { auth } = useWorkspace();
  return auth ? <Navigate to={ROUTE_PATHS.ROOMS} replace /> : <LoginPage />;
}

export function AppRoutes() {
  const { auth } = useWorkspace();
  return <BrowserRouter><Routes>
    <Route path={ROUTE_PATHS.LOGIN} element={<LoginRoute />} />
    <Route element={<RequireAuthentication />}>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={ROUTE_PATHS.ROOMS} replace />} />
        <Route path={ROUTE_PATHS.ROOMS} element={<RoomsPage />} />
        <Route path={ROUTE_PATHS.CALENDAR} element={<CalendarPage />} />
        <Route path={ROUTE_PATHS.MY_BOOKINGS} element={<MyBookingsPage />} />
        <Route element={<RequireAdministrator />}>
          <Route path={ROUTE_PATHS.COMPANY_BOOKINGS} element={<CompanyBookingsPage />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to={auth ? ROUTE_PATHS.ROOMS : ROUTE_PATHS.LOGIN} replace />} />
  </Routes></BrowserRouter>;
}
