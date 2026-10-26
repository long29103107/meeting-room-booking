import { FormEvent, useState } from 'react';
import { RoomDraft } from '../../types/domain';

export function RoomEditorDialog({ initial, busy, onClose, onSubmit }: {
  initial: RoomDraft;
  busy: boolean;
  onClose: () => void;
  onSubmit: (draft: RoomDraft) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<RoomDraft>(initial);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onSubmit(draft)) onClose();
  }

  return <div className="overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <form className="modal" onSubmit={event => void submit(event)}>
      <button type="button" className="close" aria-label="Close" onClick={onClose}>×</button>
      <h2>{draft.id ? 'Edit meeting room' : 'Add meeting room'}</h2>
      <label>Room name<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} maxLength={120} required /></label>
      <label>Capacity<input type="number" min="1" value={draft.capacity} onChange={event => setDraft({ ...draft, capacity: Number(event.target.value) })} required /></label>
      <label>Location<input value={draft.location} onChange={event => setDraft({ ...draft, location: event.target.value })} maxLength={160} required /></label>
      <label className="checkbox-label"><input type="checkbox" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} /> Room is active</label>
      <button className="primary" disabled={busy || !draft.name.trim() || !draft.location.trim()}>{busy ? 'Saving…' : 'Save room'}</button>
    </form>
  </div>;
}
