import { DoorOpen, Pencil } from 'lucide-react';
import { Room } from '../../types/domain';

type RoomCardProps = {
  room: Room;
  admin: boolean;
  busy: boolean;
  onBook: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDeactivate: (room: Room) => void;
};

export function RoomCard({ room, admin, busy, onBook, onEdit, onDeactivate }: RoomCardProps) {
  return <article className={'room-card' + (!room.active ? ' inactive' : '')}>
    <div className="room-visual">
      <DoorOpen size={34} />
      <span className={room.active ? '' : 'inactive-badge'}>{room.active ? 'ACTIVE' : 'INACTIVE'}</span>
    </div>
    <div className="room-info">
      <h3>{room.name}</h3>
      <p>{room.location} · Seats {room.capacity}</p>
      <div className="room-actions">
        {room.active && <button className="secondary" onClick={() => onBook(room)}>Book this room</button>}
        {admin && <button className="secondary" onClick={() => onEdit(room)}><Pencil size={15} /> Edit</button>}
        {admin && room.active && <button className="secondary danger" disabled={busy} onClick={() => onDeactivate(room)}>Deactivate</button>}
      </div>
    </div>
  </article>;
}
