import { BookingList } from '../components/booking/BookingList';
import { useWorkspace } from '../contexts/WorkspaceContext';

export function MyBookingsPage() {
  const { mine, busy, admin, cancel } = useWorkspace();
  return <BookingList items={mine}
    empty="No bookings yet. Search for an available room to make your first reservation."
    onCancel={cancel} busy={busy} admin={admin} />;
}
