import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, XCircle } from 'lucide-react';
import { Booking, BOOKING_STATUS } from '../../types/domain';
import { displayDateTime } from '../../utils/dateTime';

const PAGE_SIZES = [10, 20, 50];

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
  return <BookingListContent items={items} onCancel={onCancel} busy={busy} admin={admin} showOwner={showOwner} />;
}

function BookingListContent({ items, onCancel, busy, admin, showOwner }: Omit<BookingListProps, 'empty'>) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Booking['status'] | 'ALL'>('ALL');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return items.filter(booking => {
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
      const searchable = [booking.title, booking.room.name, booking.room.location,
        ...(showOwner ? [booking.userEmail] : [])].join(' ').toLocaleLowerCase();
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [items, query, showOwner, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredItems.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  function resetFilters() {
    setQuery('');
    setStatusFilter('ALL');
    setPage(1);
  }

  return <>
    <div className="booking-toolbar">
      <label>Search bookings
        <input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }}
          placeholder={showOwner ? 'Title, room or employee' : 'Title or room'} />
      </label>
      <label>Booking status
        <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value as Booking['status'] | 'ALL'); setPage(1); }}>
          <option value="ALL">All statuses</option>
          <option value={BOOKING_STATUS.CONFIRMED}>Confirmed</option>
          <option value={BOOKING_STATUS.CANCELLED}>Cancelled</option>
        </select>
      </label>
      <label>Per page
        <select value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>
          {PAGE_SIZES.map(size => <option key={size} value={size}>{size} bookings</option>)}
        </select>
      </label>
    </div>

    {filteredItems.length === 0
      ? <div className="empty-state booking-filter-empty">
        No bookings match these filters. <button className="text-button" onClick={resetFilters}>Clear filters</button>
      </div>
      : <>
        <div className="booking-list-meta" aria-live="polite">
          Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredItems.length)} of {filteredItems.length} bookings
        </div>
        <div className="booking-list">{pageItems.map(booking => <article className="booking-row" key={booking.id}>
          <div className="booking-icon"><CalendarDays /></div>
          <div className="booking-details">
            <h3>{booking.title}</h3>
            <p>{booking.room.name} · {displayDateTime(booking.startTime)} – {displayDateTime(booking.endTime)}</p>
            {showOwner && <p className="booking-owner">Booked by {booking.userEmail}</p>}
          </div>
          <span className={'status ' + booking.status.toLowerCase()}>{booking.status}</span>
          {booking.status === BOOKING_STATUS.CONFIRMED && <button className="secondary danger" disabled={busy} onClick={() => onCancel(booking)}><XCircle size={16} /> {admin ? 'Cancel booking' : 'Cancel'}</button>}
        </article>)}</div>
        {pageCount > 1 && <nav className="booking-pagination" aria-label="Booking pages">
          <button className="secondary" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span aria-live="polite">Page {currentPage} of {pageCount}</span>
          <button className="secondary" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Next</button>
        </nav>}
      </>}
  </>;
}
