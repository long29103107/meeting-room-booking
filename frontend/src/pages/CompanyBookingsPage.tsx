import { BookingList } from '../components/booking/BookingList';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function CompanyBookingsPage() {
  const { busy, admin, cancel } = useWorkspace();
  return <BookingList empty="There are no company bookings yet."
    onCancel={cancel} busy={busy} admin={admin} showOwner />;
}
