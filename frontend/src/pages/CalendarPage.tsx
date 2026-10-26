import { FormEvent, useMemo, useState } from 'react';
import { CalendarDays, Search } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Room } from '../types/domain';
import { localDateTimeInput } from '../utils/dateTime';

export function CalendarPage() {
  const { rooms, calendarBookings, calendarSearched, busy, searchCalendar, clearCalendarSearch } = useWorkspace();
  const [from, setFrom] = useState(() => { const date = new Date(); date.setHours(0, 0, 0, 0); return localDateTimeInput(date); });
  const [to, setTo] = useState(() => { const date = new Date(); date.setDate(date.getDate() + 1); date.setHours(0, 0, 0, 0); return localDateTimeInput(date); });
  const [roomId, setRoomId] = useState('');

  const calendarRooms = useMemo(() => Array.from(new Map(
    [...rooms, ...calendarBookings.map(booking => booking.room)].map(room => [room.id, room]),
  ).values()).sort((a, b) => a.name.localeCompare(b.name)), [rooms, calendarBookings]);
  const visibleBookings = calendarBookings
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

  return <>
    <section className="search">
      <div className="section-title"><CalendarDays size={20} /><h2>Choose a time range</h2></div>
      <form className="calendar-filters" onSubmit={submit}>
        <label>From<input type="datetime-local" value={from} onChange={event => { setFrom(event.target.value); clearCalendarSearch(); }} required /></label>
        <label>To<input type="datetime-local" value={to} onChange={event => { setTo(event.target.value); clearCalendarSearch(); }} required /></label>
        <label>Room<select value={roomId} onChange={event => setRoomId(event.target.value)}>
          <option value="">All rooms</option>
          {calendarRooms.map((room: Room) => <option key={room.id} value={room.id}>{room.name}{room.active ? '' : ' (inactive)'}</option>)}
        </select></label>
        <button className="primary" disabled={busy}><Search size={17} /> Show schedule</button>
      </form>
    </section>

    {!calendarSearched
      ? <div className="empty-state">Choose a time range and show the schedule to view confirmed room bookings.</div>
      : calendarBookings.length === 0
        ? <div className="empty-state">No confirmed bookings in this time range.</div>
        : visibleBookings.length === 0
          ? <div className="empty-state">No confirmed bookings for this room in the selected time range.</div>
          : <div className="calendar-room-list">{Array.from(groupedBookings.entries()).map(([id, bookings]) => {
            const room = bookings[0].room;
            return <section className="calendar-room" key={id}>
              <div className="calendar-room-heading"><div><h2>{room.name}</h2><p>{room.location} · Seats {room.capacity}</p></div><span>{bookings.length} booking{bookings.length === 1 ? '' : 's'}</span></div>
              <div className="calendar-bookings">{bookings.map(booking => <article className="calendar-booking" key={booking.id}>
                <div className="calendar-booking-time"><strong>{new Date(booking.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong><span>{new Date(booking.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></div>
                <div className="calendar-booking-title"><h3>{booking.title}</h3><p>{new Date(booking.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p></div>
                <span className="status">CONFIRMED</span>
              </article>)}</div>
            </section>;
          })}</div>}
  </>;
}
