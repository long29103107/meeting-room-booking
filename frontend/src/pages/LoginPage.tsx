import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { DoorOpen } from 'lucide-react';
import { ToastViewport } from '../components/feedback/ToastViewport';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { ROUTE_PATHS } from '../routes/routePaths';

export function LoginPage() {
  const { auth, busy, login, toasts, dismissToast } = useWorkspace();
  const [email, setEmail] = useState('employee@demo.local');
  const [password, setPassword] = useState('Employee123!');
  const navigate = useNavigate();

  if (auth) return <Navigate to={ROUTE_PATHS.ROOMS} replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await login(email, password)) navigate(ROUTE_PATHS.ROOMS, { replace: true });
  }

  return <>
    <main className="login"><div className="login-card">
      <div className="logo"><DoorOpen /> ROOMLY <span>DEMO</span></div>
      <h1>Welcome back</h1><p>Sign in to find and manage company meeting rooms.</p>
      <form onSubmit={event => void submit(event)}>
        <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} required /></label>
        <button disabled={busy} className="primary">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="demo-accounts"><p><strong>Employee</strong><br />employee@demo.local / Employee123!</p><p><strong>Admin</strong><br />admin@demo.local / Admin123!</p></div>
    </div></main>
    <ToastViewport items={toasts} onDismiss={dismissToast} />
  </>;
}
