import { FormEvent, useState } from 'react';
import { Room } from '../../types/domain';

export function BookingDialog({ room, busy, initialStart, initialEnd, onClose, onSubmit }: {
  room: Room;
  busy: boolean;
  initialStart: string;
  initialEnd: string;
  onClose: () => void;
  onSubmit: (title: string, start: string, end: string) => Promise<boolean>;
}) {
  const [title, setTitle] = useState('Team sync');
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onSubmit(title, start, end)) onClose();
  }

  return <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="modal" onSubmit={event => void submit(event)}>
      <button type="button" className="close" aria-label="Close" onClick={onClose}>×</button>
      <h2>Reserve a meeting room</h2><p>{room.name} · {room.location} · {room.capacity} seats</p>
      <label>Meeting title<input value={title} onChange={event => setTitle(event.target.value)} maxLength={200} required /></label>
      <label>Start time<input type="datetime-local" value={start} onChange={event => setStart(event.target.value)} required /></label>
      <label>End time<input type="datetime-local" value={end} onChange={event => setEnd(event.target.value)} required /></label>
      <button className="primary" disabled={busy || !title.trim()}>{busy ? 'Booking…' : 'Confirm reservation'}</button>
    </form>
  </div>;
}
