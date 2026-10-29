import { BookingList } from '../components/booking/BookingList';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function MyBookingsPage() {
  const { busy, admin, cancel } = useWorkspace();
  return <BookingList
    empty="No bookings yet. Search for an available room to make your first reservation."
    onCancel={cancel} busy={busy} admin={admin} />;
}
