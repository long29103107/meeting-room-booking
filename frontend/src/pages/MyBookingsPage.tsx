import { BookingList } from '../components/booking/BookingList';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function MyBookingsPage() {
  const { mine, busy, admin, cancel } = useWorkspace();
  const activeRoomBookings = mine.filter(booking => booking.room.active);
  return <BookingList items={activeRoomBookings}
    empty={mine.length
      ? 'There are no bookings for active rooms.'
      : 'No bookings yet. Search for an available room to make your first reservation.'}
    onCancel={cancel} busy={busy} admin={admin} />;
}
