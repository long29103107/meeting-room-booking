import { BookingList } from '../components/booking/BookingList';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function CompanyBookingsPage() {
  const { allBookings, busy, admin, cancel } = useWorkspace();
  return <BookingList items={allBookings} empty="There are no company bookings yet."
    onCancel={cancel} busy={busy} admin={admin} showOwner />;
}
