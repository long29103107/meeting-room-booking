import { FormEvent, useCallback, useEffect, useState } from 'react';
import { CalendarDays, DoorOpen, LogOut, Pencil, Plus, Search, ShieldCheck, XCircle } from 'lucide-react';

type Room = { id: number; name: string; capacity: number; location: string; active: boolean };
const BOOKING_STATUS = { CONFIRMED: 'CONFIRMED', CANCELLED: 'CANCELLED' } as const;
type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
type Booking = { id: number; room: Room; title: string; startTime: string; endTime: string; status: BookingStatus; userEmail: string };
type Draft = { id?: number; name: string; capacity: number; location: string; active: boolean };
type View = 'rooms' | 'bookings' | 'company-bookings';
class ApiError extends Error { constructor(message: string, readonly status: number) { super(message); } }
const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const localDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const iso = (date: string) => new Date(date).toISOString();
const displayDate = (date: string) => new Date(date).toLocaleString();

function App() {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('auth') || '');
  const [email, setEmail] = useState('employee@demo.local');
  const [password, setPassword] = useState('Employee123!');
  const [admin, setAdmin] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mine, setMine] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [available, setAvailable] = useState<Room[]>([]);
  const [start, setStart] = useState(() => { const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return localDate(d); });
  const [end, setEnd] = useState(() => { const d = new Date(); d.setHours(d.getHours() + 2, 0, 0, 0); return localDate(d); });
  const [capacity, setCapacity] = useState('');
  const [searched, setSearched] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [title, setTitle] = useState('Team sync');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>('rooms');

  const api = useCallback(async <T,>(path: string, token: string, init: RequestInit = {}): Promise<T> => {
    const headers = new Headers(init.headers);
    headers.set('Authorization', 'Basic ' + token);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await fetch(apiBase + path, { ...init, headers });
    if (!response.ok) {
      let message = 'HTTP ' + response.status;
      try { const result = await response.json(); message = result.message || result.error || message; } catch { /* use status fallback */ }
      throw new ApiError(message, response.status);
    }
    return (response.status === 204 ? null : await response.json()) as T;
  }, []);

  const load = useCallback(async (token: string) => {
    const [roomList, myBookings] = await Promise.all([api<Room[]>('/rooms', token), api<Booking[]>('/bookings/me', token)]);
    let isAdmin = false;
    let company: Booking[] = [];
    let visibleRooms = roomList;
    try {
      company = await api<Booking[]>('/bookings', token);
      isAdmin = true;
      visibleRooms = await api<Room[]>('/rooms?includeInactive=true', token);
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 403) throw e;
    }
    setRooms(visibleRooms); setMine(myBookings); setAllBookings(company); setAdmin(isAdmin);
  }, [api]);

  const refresh = useCallback(async (token = auth) => {
    if (!token) return;
    setLoading(true);
    try { await load(token); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Could not load workspace'); setError(true); }
    finally { setLoading(false); }
  }, [auth, load]);

  useEffect(() => { if (auth) void refresh(auth); }, [auth, refresh]);

  function fail(e: unknown) { setMessage(e instanceof Error ? e.message : 'Request failed'); setError(true); }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const token = btoa(email.trim() + ':' + password);
    try {
      await api<Room[]>('/rooms', token);
      sessionStorage.setItem('auth', token); setAuth(token); setView('rooms');
    } catch { setMessage('Invalid email or password.'); setError(true); }
    finally { setBusy(false); }
  }

  function logout() {
    sessionStorage.removeItem('auth'); setAuth(''); setAdmin(false); setRooms([]); setMine([]);
    setAllBookings([]); setAvailable([]); setSearched(false); setView('rooms'); setMessage('');
  }

  async function searchRooms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!start || !end || new Date(start) >= new Date(end)) { setMessage('End time must be later than start time.'); setError(true); return; }
    try {
      setBusy(true);
      const cap = capacity ? '&minCapacity=' + encodeURIComponent(capacity) : '';
      const rooms = await api<Room[]>('/rooms/available?startTime=' + encodeURIComponent(iso(start)) + '&endTime=' + encodeURIComponent(iso(end)) + cap, auth);
      setAvailable(rooms); setSearched(true); setMessage(rooms.length + ' available room(s) found.'); setError(false);
    } catch (e) { fail(e); } finally { setBusy(false); }
  }

  async function book(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bookingRoom) return;
    if (!start || !end || new Date(start) >= new Date(end)) { setMessage('End time must be later than start time.'); setError(true); return; }
    try {
      setBusy(true);
      await api('/bookings', auth, { method: 'POST', body: JSON.stringify({ roomId: bookingRoom.id, title: title.trim(), startTime: iso(start), endTime: iso(end) }) });
      setBookingRoom(null); setSearched(false); setAvailable([]); await refresh();
      setMessage('Booking confirmed.'); setError(false);
    } catch (e) { fail(e); } finally { setBusy(false); }
  }

  async function cancel(booking: Booking) {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      setBusy(true); await api('/bookings/' + booking.id + '/cancel', auth, { method: 'PATCH' });
      await refresh(); setMessage('Booking cancelled.'); setError(false);
    } catch (e) { fail(e); } finally { setBusy(false); }
  }

  function openRoom(room?: Room) {
    setDraft(room ? { id: room.id, name: room.name, capacity: room.capacity, location: room.location, active: room.active }
      : { name: '', capacity: 6, location: '', active: true });
  }

  async function saveRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!draft) return;
    const editing = draft.id !== undefined;
    try {
      setBusy(true);
      await api(editing ? '/rooms/' + draft.id : '/rooms', auth, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...draft, name: draft.name.trim(), location: draft.location.trim(), capacity: Number(draft.capacity) }),
      });
      setDraft(null); await refresh(); setMessage(editing ? 'Room updated.' : 'Room created.'); setError(false);
    } catch (e) { fail(e); } finally { setBusy(false); }
  }

  async function deactivate(room: Room) {
    if (!window.confirm('Deactivate ' + room.name + '? Booking history will be kept.')) return;
    try {
      setBusy(true); await api('/rooms/' + room.id, auth, { method: 'DELETE' });
      await refresh(); setMessage('Room deactivated.'); setError(false);
    } catch (e) { fail(e); } finally { setBusy(false); }
  }

  if (!auth) return (
    <main className="login"><div className="login-card">
      <div className="logo"><DoorOpen /> ROOMLY <span>DEMO</span></div>
      <h1>Welcome back</h1><p>Sign in to find and manage company meeting rooms.</p>
      <form onSubmit={login}>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <button disabled={busy} className="primary">{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <div className="demo-accounts"><p><strong>Employee</strong><br />employee@demo.local / Employee123!</p><p><strong>Admin</strong><br />admin@demo.local / Admin123!</p></div>
      {message && <div className="notice error" role="alert">{message}</div>}
    </div></main>
  );

  const roomResults = searched ? available : rooms.filter(room => admin || room.active);
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo"><DoorOpen /> ROOMLY <span>DEMO</span></div><p className="sidebar-label">WORKSPACE</p>
        <button className={view === 'rooms' ? 'nav active' : 'nav'} onClick={() => setView('rooms')}><DoorOpen size={18} /> Find rooms</button>
        <button className={view === 'bookings' ? 'nav active' : 'nav'} onClick={() => setView('bookings')}><CalendarDays size={18} /> My bookings</button>
        {admin && <button className={view === 'company-bookings' ? 'nav active' : 'nav'} onClick={() => setView('company-bookings')}><ShieldCheck size={18} /> Company bookings</button>}
        <div className="sidebar-bottom"><p>{admin ? 'Administrator' : 'Employee'}</p><button className="nav" onClick={logout}><LogOut size={17} /> Sign out</button></div>
      </aside>

      <main className="content">
        <header><div>
          <div className="eyebrow">WORKSPACE / {view.replace('-', ' ').toUpperCase()}</div>
          <h1>{view === 'rooms' ? 'Find your perfect space' : view === 'bookings' ? 'Your bookings' : 'Company bookings'}</h1>
          <p>{view === 'rooms' ? 'Check availability and book a room in seconds.' : view === 'bookings' ? 'View and manage your room reservations.' : 'Review reservations across all meeting rooms.'}</p>
        </div><span className="profile"><ShieldCheck size={17} /> {admin ? 'Admin' : 'Employee'}</span></header>

        {message && <div className={'notice' + (error ? ' error' : '')} role={error ? 'alert' : 'status'}>{message}<button aria-label="Dismiss message" onClick={() => setMessage('')}>×</button></div>}
        {loading && <p className="loading" role="status">Loading your workspace…</p>}

        {view === 'rooms' && <>
          <section className="search">
            <div className="section-title"><Search size={20} /><h2>Search available rooms</h2></div>
            <form className="filters" onSubmit={searchRooms}>
              <label>Start time<input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required /></label>
              <label>End time<input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required /></label>
              <label>Minimum seats<input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="Any capacity" /></label>
              <button className="primary" disabled={busy}><Search size={17} /> Check availability</button>
            </form>
          </section>
          <div className="section-heading"><div><h2>Meeting rooms</h2><p>{searched ? 'Available for the selected time' : 'Browse active rooms or search by time and capacity.'}</p></div>
            {admin && <button className="secondary" onClick={() => openRoom()}><Plus size={17} /> Add room</button>}</div>
          {!loading && roomResults.length === 0 && <div className="empty-state">{searched ? 'No rooms available for that time and capacity.' : 'No active rooms are available.'}</div>}
          <div className="room-grid">{roomResults.map(room => <article className={'room-card' + (!room.active ? ' inactive' : '')} key={room.id}>
            <div className="room-visual"><DoorOpen size={34} /><span className={room.active ? '' : 'inactive-badge'}>{room.active ? 'ACTIVE' : 'INACTIVE'}</span></div>
            <div className="room-info"><h3>{room.name}</h3><p>{room.location} · Seats {room.capacity}</p><div className="room-actions">
              {room.active && <button className="secondary" onClick={() => { setBookingRoom(room); setTitle('Team sync'); }}>Book this room</button>}
              {admin && <button className="secondary" onClick={() => openRoom(room)}><Pencil size={15} /> Edit</button>}
              {admin && room.active && <button className="secondary danger" disabled={busy} onClick={() => void deactivate(room)}>Deactivate</button>}
            </div></div>
          </article>)}</div>
        </>}

        {view === 'bookings' && <BookingList items={mine} empty="No bookings yet. Search for an available room to make your first reservation." onCancel={cancel} busy={busy} admin={admin} />}
        {view === 'company-bookings' && admin && <BookingList items={allBookings} empty="There are no company bookings yet." onCancel={cancel} busy={busy} admin showOwner />}
      </main>

      {bookingRoom && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setBookingRoom(null); }}>
        <form className="modal" onSubmit={book}>
          <button type="button" className="close" aria-label="Close" onClick={() => setBookingRoom(null)}>×</button>
          <h2>Reserve a meeting room</h2><p>{bookingRoom.name} · {bookingRoom.location} · {bookingRoom.capacity} seats</p>
          <label>Meeting title<input value={title} onChange={e => setTitle(e.target.value)} maxLength={200} required /></label>
          <label>Start time<input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required /></label>
          <label>End time<input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} required /></label>
          <button className="primary" disabled={busy || !title.trim()}>{busy ? 'Booking…' : 'Confirm reservation'}</button>
        </form>
      </div>}

      {draft && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setDraft(null); }}>
        <form className="modal" onSubmit={saveRoom}>
          <button type="button" className="close" aria-label="Close" onClick={() => setDraft(null)}>×</button>
          <h2>{draft.id ? 'Edit meeting room' : 'Add meeting room'}</h2>
          <label>Room name<input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} maxLength={120} required /></label>
          <label>Capacity<input type="number" min="1" value={draft.capacity} onChange={e => setDraft({ ...draft, capacity: Number(e.target.value) })} required /></label>
          <label>Location<input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} maxLength={160} required /></label>
          <label className="checkbox-label"><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Room is active</label>
          <button className="primary" disabled={busy || !draft.name.trim() || !draft.location.trim()}>{busy ? 'Saving…' : 'Save room'}</button>
        </form>
      </div>}
    </div>
  );
}

function BookingList({ items, empty, onCancel, busy, admin, showOwner = false }: {
  items: Booking[]; empty: string; onCancel: (booking: Booking) => void; busy: boolean; admin: boolean; showOwner?: boolean;
}) {
  if (!items.length) return <div className="empty-state">{empty}</div>;
  return <div className="booking-list">{items.map(booking => <article className="booking-row" key={booking.id}>
    <div className="booking-icon"><CalendarDays /></div><div className="booking-details"><h3>{booking.title}</h3>
      <p>{booking.room.name} · {displayDate(booking.startTime)} – {displayDate(booking.endTime)}</p>
      {showOwner && <p className="booking-owner">Booked by {booking.userEmail}</p>}
    </div><span className={'status ' + booking.status.toLowerCase()}>{booking.status}</span>
    {booking.status === BOOKING_STATUS.CONFIRMED && <button className="secondary danger" disabled={busy} onClick={() => onCancel(booking)}><XCircle size={16} /> {admin ? 'Cancel booking' : 'Cancel'}</button>}
  </article>)}</div>;
}

export default App;
