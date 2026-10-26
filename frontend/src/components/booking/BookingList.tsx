import { CalendarDays, XCircle } from 'lucide-react';
import { Booking, BOOKING_STATUS } from '../../types/domain';
import { displayDateTime } from '../../utils/dateTime';

type BookingListProps = {
  items: Booking[];
  empty: string;
  onCancel: (booking: Booking) => void;
  busy: boolean;
  admin: boolean;
  showOwner?: boolean;
};

export function BookingList({ items, empty, onCancel, busy, admin, showOwner = false }: BookingListProps) {
  if (!items.length) return <div className="empty-state">{empty}</div>;
  return <div className="booking-list">{items.map(booking => <article className="booking-row" key={booking.id}>
    <div className="booking-icon"><CalendarDays /></div>
    <div className="booking-details">
      <h3>{booking.title}</h3>
      <p>{booking.room.name} · {displayDateTime(booking.startTime)} – {displayDateTime(booking.endTime)}</p>
      {showOwner && <p className="booking-owner">Booked by {booking.userEmail}</p>}
    </div>
    <span className={'status ' + booking.status.toLowerCase()}>{booking.status}</span>
    {booking.status === BOOKING_STATUS.CONFIRMED && <button className="secondary danger" disabled={busy} onClick={() => onCancel(booking)}><XCircle size={16} /> {admin ? 'Cancel booking' : 'Cancel'}</button>}
  </article>)}</div>;
}
