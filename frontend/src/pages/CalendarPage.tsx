import { FormEvent, useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Room } from '../types/domain';
import { localDateTimeInput } from '../utils/dateTime';

export function CalendarPage() {
  const { rooms, calendarBookings, calendarSearched, busy, searchCalendar, clearCalendarSearch } = useWorkspace();
  const [defaultRange] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { from: localDateTimeInput(start), to: localDateTimeInput(end) };
  });
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [roomId, setRoomId] = useState('');
  const [collapsedRoomIds, setCollapsedRoomIds] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    void searchCalendar(defaultRange.from, defaultRange.to);
  }, [defaultRange, searchCalendar]);

  const activeCalendarBookings = useMemo(
    () => calendarBookings.filter(booking => booking.room.active),
    [calendarBookings],
  );
  const calendarRooms = useMemo(() => Array.from(new Map(
    [...rooms.filter(room => room.active), ...activeCalendarBookings.map(booking => booking.room)]
      .map(room => [room.id, room]),
  ).values()).sort((a, b) => a.name.localeCompare(b.name)), [rooms, activeCalendarBookings]);
  const visibleBookings = activeCalendarBookings
    .filter(booking => !roomId || String(booking.room.id) === roomId)
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime));
  const groupedBookings = visibleBookings.reduce<Map<number, typeof visibleBookings>>((groups, booking) => {
    const group = groups.get(booking.room.id) ?? [];
    group.push(booking);
    groups.set(booking.room.id, group);
    return groups;
  }, new Map());

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchCalendar(from, to);
  }

  function toggleRoom(roomIdToToggle: number) {
    setCollapsedRoomIds(current => {
      const next = new Set(current);
      if (next.has(roomIdToToggle)) next.delete(roomIdToToggle);
      else next.add(roomIdToToggle);
      return next;
    });
  }

  return <>
    <section className="search">
      <div className="section-title"><CalendarDays size={20} /><h2>Choose a time range</h2></div>
      <form className="calendar-filters" onSubmit={submit}>
        <label>From<input type="datetime-local" value={from} onChange={event => { setFrom(event.target.value); clearCalendarSearch(); }} required /></label>
        <label>To<input type="datetime-local" value={to} onChange={event => { setTo(event.target.value); clearCalendarSearch(); }} required /></label>
        <label>Room<select value={roomId} onChange={event => setRoomId(event.target.value)}>
          <option value="">All rooms</option>
          {calendarRooms.map((room: Room) => <option key={room.id} value={room.id}>{room.name}</option>)}
        </select></label>
        <button className="primary" disabled={busy}><Search size={17} /> Show schedule</button>
      </form>
    </section>

    {busy && !calendarSearched
      ? <div className="empty-state">Loading the room schedule…</div>
      : !calendarSearched
      ? <div className="empty-state">Choose a time range and show the schedule to view confirmed room bookings.</div>
      : activeCalendarBookings.length === 0
        ? <div className="empty-state">No confirmed bookings for active rooms in this time range.</div>
        : visibleBookings.length === 0
          ? <div className="empty-state">No confirmed bookings for this room in the selected time range.</div>
          : <>
            <div className="calendar-room-controls">
              <button className="secondary" type="button" onClick={() => setCollapsedRoomIds(new Set(groupedBookings.keys()))}>Collapse all</button>
              <button className="secondary" type="button" onClick={() => setCollapsedRoomIds(new Set())}>Expand all</button>
            </div>
            <div className="calendar-room-list">{Array.from(groupedBookings.entries()).map(([id, bookings]) => {
            const room = bookings[0].room;
            const isCollapsed = collapsedRoomIds.has(id);
            return <section className="calendar-room" key={id}>
              <div className="calendar-room-heading">
                <button className="calendar-room-toggle" type="button" aria-expanded={!isCollapsed} aria-controls={`calendar-room-bookings-${id}`} onClick={() => toggleRoom(id)}>
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                  <span><strong>{room.name}</strong><small>{room.location} · Seats {room.capacity}</small></span>
                </button>
                <span>{bookings.length} booking{bookings.length === 1 ? '' : 's'}</span>
              </div>
              {!isCollapsed && <div className="calendar-bookings" id={`calendar-room-bookings-${id}`}>{bookings.map(booking => <article className="calendar-booking" key={booking.id}>
                <div className="calendar-booking-time"><strong>{new Date(booking.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong><span>{new Date(booking.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
                <div className="calendar-booking-title"><h3>{booking.title}</h3><p>{new Date(booking.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                <span className="status">CONFIRMED</span>
              </article>)}</div>}
            </section>;
          })}</div>
          </>}
  </>;
}
