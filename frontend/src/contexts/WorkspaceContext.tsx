import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ApiError, apiRequest } from '../services/apiClient';
import { Booking, Confirmation, Room, RoomDraft, ToastKind, ToastMessage } from '../types/domain';
import { toIsoInstant } from '../utils/dateTime';

type WorkspaceContextValue = {
  auth: string;
  workspaceReady: boolean;
  admin: boolean;
  rooms: Room[];
  mine: Booking[];
  allBookings: Booking[];
  available: Room[];
  searched: boolean;
  calendarBookings: Booking[];
  calendarSearched: boolean;
  busy: boolean;
  loading: boolean;
  toasts: ToastMessage[];
  confirmation: Confirmation | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refresh: () => Promise<void>;
  notify: (message: string, kind?: ToastKind) => void;
  dismissToast: (id: number) => void;
  closeConfirmation: () => void;
  searchRooms: (start: string, end: string, capacity: string) => Promise<void>;
  searchCalendar: (from: string, to: string) => Promise<void>;
  clearCalendarSearch: () => void;
  book: (room: Room, title: string, start: string, end: string) => Promise<boolean>;
  cancel: (booking: Booking) => void;
  saveRoom: (draft: RoomDraft) => Promise<boolean>;
  deactivate: (room: Room) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState(() => sessionStorage.getItem('auth') || '');
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [mine, setMine] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [available, setAvailable] = useState<Room[]>([]);
  const [searched, setSearched] = useState(false);
  const [calendarBookings, setCalendarBookings] = useState<Booking[]>([]);
  const [calendarSearched, setCalendarSearched] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const nextToastId = useRef(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++nextToastId.current;
    setToasts(current => [...current, { id, message, kind }].slice(-4));
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const load = useCallback(async (token: string) => {
    const [roomList, myBookings] = await Promise.all([
      apiRequest<Room[]>('/rooms', token),
      apiRequest<Booking[]>('/bookings/me', token),
    ]);
    let isAdmin = false;
    let company: Booking[] = [];
    let visibleRooms = roomList;
    try {
      company = await apiRequest<Booking[]>('/bookings', token);
      isAdmin = true;
      visibleRooms = await apiRequest<Room[]>('/rooms?includeInactive=true', token);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 403) throw error;
    }
    setRooms(visibleRooms);
    setMine(myBookings);
    setAllBookings(company);
    setAdmin(isAdmin);
  }, []);

  const refresh = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    try { await load(auth); }
    catch (error) { notify(error instanceof Error ? error.message : 'Could not load workspace', 'error'); }
    finally { setLoading(false); }
  }, [auth, load, notify]);

  useEffect(() => {
    if (!auth) {
      setWorkspaceReady(true);
      return;
    }
    setWorkspaceReady(false);
    void refresh().finally(() => setWorkspaceReady(true));
  }, [auth, refresh]);

  const login = useCallback(async (email: string, password: string) => {
    setBusy(true);
    const token = btoa(email.trim() + ':' + password);
    try {
      await apiRequest<Room[]>('/rooms', token);
      sessionStorage.setItem('auth', token);
      setAuth(token);
      notify('Signed in.');
      return true;
    } catch {
      notify('Invalid email or password.', 'error');
      return false;
    } finally { setBusy(false); }
  }, [notify]);

  const logout = useCallback(() => {
    sessionStorage.removeItem('auth');
    setAuth('');
    setAdmin(false);
    setRooms([]);
    setMine([]);
    setAllBookings([]);
    setAvailable([]);
    setSearched(false);
    setCalendarBookings([]);
    setCalendarSearched(false);
    setConfirmation(null);
    notify('Signed out.');
  }, [notify]);

  const closeConfirmation = useCallback(() => setConfirmation(null), []);

  const searchRooms = useCallback(async (start: string, end: string, capacity: string) => {
    if (!start || !end || new Date(start) >= new Date(end)) {
      notify('End time must be later than start time.', 'error');
      return;
    }
    try {
      setBusy(true);
      const minimumCapacity = capacity ? '&minCapacity=' + encodeURIComponent(capacity) : '';
      const result = await apiRequest<Room[]>(
        '/rooms/available?startTime=' + encodeURIComponent(toIsoInstant(start))
          + '&endTime=' + encodeURIComponent(toIsoInstant(end)) + minimumCapacity,
        auth,
      );
      setAvailable(result);
      setSearched(true);
      notify(result.length + ' available room(s) found.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Request failed', 'error'); }
    finally { setBusy(false); }
  }, [auth, notify]);

  const searchCalendar = useCallback(async (from: string, to: string) => {
    if (!from || !to || new Date(from) >= new Date(to)) {
      setCalendarSearched(false);
      notify('End time must be later than start time.', 'error');
      return;
    }
    try {
      setCalendarSearched(false);
      setBusy(true);
      const result = await apiRequest<Booking[]>(
        '/bookings/calendar?from=' + encodeURIComponent(toIsoInstant(from))
          + '&to=' + encodeURIComponent(toIsoInstant(to)),
        auth,
      );
      setCalendarBookings(result);
      setCalendarSearched(true);
    } catch (error) { notify(error instanceof Error ? error.message : 'Request failed', 'error'); }
    finally { setBusy(false); }
  }, [auth, notify]);

  const clearCalendarSearch = useCallback(() => setCalendarSearched(false), []);

  const book = useCallback(async (room: Room, title: string, start: string, end: string) => {
    if (!start || !end || new Date(start) >= new Date(end)) {
      notify('End time must be later than start time.', 'error');
      return false;
    }
    try {
      setBusy(true);
      await apiRequest('/bookings', auth, {
        method: 'POST',
        body: JSON.stringify({ roomId: room.id, title: title.trim(), startTime: toIsoInstant(start), endTime: toIsoInstant(end) }),
      });
      setSearched(false);
      setAvailable([]);
      await refresh();
      notify('Booking confirmed.');
      return true;
    } catch (error) { notify(error instanceof Error ? error.message : 'Request failed', 'error'); return false; }
    finally { setBusy(false); }
  }, [auth, notify, refresh]);

  const cancelBooking = useCallback(async (booking: Booking) => {
    try {
      setBusy(true);
      await apiRequest('/bookings/' + booking.id + '/cancel', auth, { method: 'PATCH' });
      await refresh();
      notify('Booking cancelled.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Request failed', 'error'); }
    finally { setBusy(false); }
  }, [auth, notify, refresh]);

  const cancel = useCallback((booking: Booking) => {
    setConfirmation({
      title: 'Cancel this booking?',
      description: `“${booking.title}” in ${booking.room.name} will be cancelled.`,
      confirmLabel: 'Cancel booking',
      cancelLabel: 'Keep booking',
      onConfirm: () => cancelBooking(booking),
    });
  }, [cancelBooking]);

  const saveRoom = useCallback(async (draft: RoomDraft) => {
    const editing = draft.id !== undefined;
    try {
      setBusy(true);
      await apiRequest(editing ? '/rooms/' + draft.id : '/rooms', auth, {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({ ...draft, name: draft.name.trim(), location: draft.location.trim(), capacity: Number(draft.capacity) }),
      });
      await refresh();
      notify(editing ? 'Room updated.' : 'Room created.');
      return true;
    } catch (error) { notify(error instanceof Error ? error.message : 'Request failed', 'error'); return false; }
    finally { setBusy(false); }
  }, [auth, notify, refresh]);

  const deactivateRoom = useCallback(async (room: Room) => {
    try {
      setBusy(true);
      await apiRequest('/rooms/' + room.id, auth, { method: 'DELETE' });
      await refresh();
      notify('Room deactivated.');
    } catch (error) { notify(error instanceof Error ? error.message : 'Request failed', 'error'); }
    finally { setBusy(false); }
  }, [auth, notify, refresh]);

  const deactivate = useCallback((room: Room) => {
    setConfirmation({
      title: `Deactivate ${room.name}?`,
      description: 'The room will stop appearing in room search. Existing booking history will be kept.',
      confirmLabel: 'Deactivate room',
      cancelLabel: 'Keep room active',
      onConfirm: () => deactivateRoom(room),
    });
  }, [deactivateRoom]);

  return (
    <WorkspaceContext.Provider value={{
      auth, workspaceReady, admin, rooms, mine, allBookings, available, searched, calendarBookings,
      calendarSearched, busy, loading, toasts, confirmation, login, logout, refresh,
      notify, dismissToast, closeConfirmation, searchRooms, searchCalendar, book,
      cancel, saveRoom, deactivate, clearCalendarSearch,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}
