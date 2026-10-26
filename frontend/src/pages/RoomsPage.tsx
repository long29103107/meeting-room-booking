import { FormEvent, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { BookingDialog } from '../components/rooms/BookingDialog';
import { RoomCard } from '../components/rooms/RoomCard';
import { RoomEditorDialog } from '../components/rooms/RoomEditorDialog';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Room, RoomDraft } from '../types/domain';
import { localDateTimeInput } from '../utils/dateTime';

export function RoomsPage() {
  const { admin, rooms, available, searched, busy, searchRooms, saveRoom, deactivate, book } = useWorkspace();
  const [start, setStart] = useState(() => { const date = new Date(); date.setHours(date.getHours() + 1, 0, 0, 0); return localDateTimeInput(date); });
  const [end, setEnd] = useState(() => { const date = new Date(); date.setHours(date.getHours() + 2, 0, 0, 0); return localDateTimeInput(date); });
  const [capacity, setCapacity] = useState('');
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [roomDraft, setRoomDraft] = useState<RoomDraft | null>(null);
  const roomResults = searched ? available : rooms.filter(room => admin || room.active);

  function editRoom(room?: Room) {
    setRoomDraft(room
      ? { id: room.id, name: room.name, capacity: room.capacity, location: room.location, active: room.active }
      : { name: '', capacity: 6, location: '', active: true });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void searchRooms(start, end, capacity);
  }

  return <>
    <section className="search">
      <div className="section-title"><Search size={20} /><h2>Search available rooms</h2></div>
      <form className="filters" onSubmit={submitSearch}>
        <label>Start time<input type="datetime-local" value={start} onChange={event => setStart(event.target.value)} required /></label>
        <label>End time<input type="datetime-local" value={end} onChange={event => setEnd(event.target.value)} required /></label>
        <label>Minimum seats<input type="number" min="1" value={capacity} onChange={event => setCapacity(event.target.value)} placeholder="Any capacity" /></label>
        <button className="primary" disabled={busy}><Search size={17} /> Check availability</button>
      </form>
    </section>

    <div className="section-heading"><div><h2>Meeting rooms</h2><p>{searched ? 'Available for the selected time' : 'Browse active rooms or search by time and capacity.'}</p></div>
      {admin && <button className="secondary" onClick={() => editRoom()}><Plus size={17} /> Add room</button>}
    </div>
    {roomResults.length === 0 && <div className="empty-state">{searched ? 'No rooms available for that time and capacity.' : 'No active rooms are available.'}</div>}
    <div className="room-grid">{roomResults.map(room => <RoomCard
      key={room.id} room={room} admin={admin} busy={busy}
      onBook={setBookingRoom} onEdit={editRoom} onDeactivate={deactivate}
    />)}</div>

    {bookingRoom && <BookingDialog room={bookingRoom} busy={busy} initialStart={start} initialEnd={end} onClose={() => setBookingRoom(null)}
      onSubmit={(title, bookingStart, bookingEnd) => book(bookingRoom, title, bookingStart, bookingEnd)} />}
    {roomDraft && <RoomEditorDialog initial={roomDraft} busy={busy} onClose={() => setRoomDraft(null)} onSubmit={saveRoom} />}
  </>;
}
