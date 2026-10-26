import { CalendarDays, DoorOpen, LogOut, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { ConfirmDialog } from '../ConfirmDialog';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { ToastViewport } from '../feedback/ToastViewport';
import { ROUTE_PATHS } from '../../routes/routePaths';

const pageContent: Record<string, { title: string; description: string }> = {
  [ROUTE_PATHS.ROOMS]: { title: 'Find your perfect space', description: 'Check availability and book a room in seconds.' },
  [ROUTE_PATHS.CALENDAR]: { title: 'Room calendar', description: 'See confirmed reservations across your meeting rooms.' },
  [ROUTE_PATHS.MY_BOOKINGS]: { title: 'Your bookings', description: 'View and manage your room reservations.' },
  [ROUTE_PATHS.COMPANY_BOOKINGS]: { title: 'Company bookings', description: 'Review reservations across all meeting rooms.' },
};

export function AppShell() {
  const { admin, loading, logout, toasts, dismissToast, confirmation, closeConfirmation } = useWorkspace();
  const location = useLocation();
  const page = pageContent[location.pathname] ?? pageContent[ROUTE_PATHS.ROOMS];

  return <div className="app">
    <aside className="sidebar">
      <div className="logo"><DoorOpen /> ROOMLY <span>DEMO</span></div>
      <p className="sidebar-label">WORKSPACE</p>
      <NavLink className={({ isActive }) => isActive ? 'nav active' : 'nav'} to={ROUTE_PATHS.ROOMS}><DoorOpen size={18} /> Find rooms</NavLink>
      <NavLink className={({ isActive }) => isActive ? 'nav active' : 'nav'} to={ROUTE_PATHS.CALENDAR}><CalendarDays size={18} /> Room calendar</NavLink>
      <NavLink className={({ isActive }) => isActive ? 'nav active' : 'nav'} to={ROUTE_PATHS.MY_BOOKINGS}><CalendarDays size={18} /> My bookings</NavLink>
      {admin && <NavLink className={({ isActive }) => isActive ? 'nav active' : 'nav'} to={ROUTE_PATHS.COMPANY_BOOKINGS}><ShieldCheck size={18} /> Company bookings</NavLink>}
      <div className="sidebar-bottom">
        <p>{admin ? 'Administrator' : 'Employee'}</p>
        <button className="nav" onClick={logout}><LogOut size={17} /> Sign out</button>
      </div>
    </aside>

    <main className="content">
      <header><div>
        <div className="eyebrow">WORKSPACE / {location.pathname.slice(1).replace('-', ' ').toUpperCase()}</div>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </div><span className="profile"><ShieldCheck size={17} /> {admin ? 'Admin' : 'Employee'}</span></header>
      {loading && <p className="loading" role="status">Loading your workspace…</p>}
      <Outlet />
    </main>

    <ConfirmDialog
      open={confirmation !== null}
      title={confirmation?.title ?? ''}
      description={confirmation?.description ?? ''}
      confirmLabel={confirmation?.confirmLabel ?? 'Confirm'}
      cancelLabel={confirmation?.cancelLabel}
      onConfirm={() => confirmation?.onConfirm()}
      onClose={closeConfirmation}
    />
    <ToastViewport items={toasts} onDismiss={dismissToast} />
  </div>;
}
