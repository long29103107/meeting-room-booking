import { useEffect, useState } from 'react';
import { CalendarDays, XCircle } from 'lucide-react';
import { Pagination } from '../common/Pagination';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { apiRequest } from '../../services/apiClient';
import { Booking, BOOKING_STATUS, PageResponse } from '../../types/domain';
import { displayDateTime } from '../../utils/dateTime';

const PAGE_SIZES = [10, 20, 40];

type BookingListProps = {
  empty: string;
  onCancel: (booking: Booking) => void;
  busy: boolean;
  admin: boolean;
  showOwner?: boolean;
};

export function BookingList({ empty, onCancel, busy, admin, showOwner = false }: BookingListProps) {
  return <BookingListContent empty={empty} onCancel={onCancel} busy={busy} admin={admin} showOwner={showOwner} />;
}

function BookingListContent({ empty, onCancel, busy, admin, showOwner }: BookingListProps) {
  const { auth, bookingRevision, notify } = useWorkspace();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Booking['status'] | 'ALL'>('ALL');
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [pageData, setPageData] = useState<PageResponse<Booking> | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState('');
  const pageCount = Math.max(1, pageData?.totalPages ?? 1);
  const currentPage = Math.min(page, pageCount);
  const startIndex = pageData && pageData.totalElements > 0 ? (currentPage - 1) * pageSize : 0;
  const pageItems = pageData?.content ?? [];

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoadingPage(true);
      setLoadError('');
      const params = new URLSearchParams({ page: String(page - 1), size: String(pageSize) });
      if (query.trim()) params.set('query', query.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      const endpoint = showOwner ? '/bookings/page' : '/bookings/me/page';
      try {
        const result = await apiRequest<PageResponse<Booking>>(`${endpoint}?${params}`, auth);
        if (!active) return;
        setPageData(result);
        if (result.totalPages > 0 && page > result.totalPages) setPage(result.totalPages);
      } catch (error) {
        if (active) {
          const message = error instanceof Error ? error.message : 'Could not load bookings';
          setLoadError(message);
          notify(message, 'error');
        }
      } finally {
        if (active) setLoadingPage(false);
      }
    }, query ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [auth, bookingRevision, page, pageSize, query, showOwner, statusFilter, notify]);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  function resetFilters() {
    setQuery('');
    setStatusFilter('ALL');
    setPage(1);
    setLoadingPage(true);
  }

  return <>
    <div className="booking-toolbar">
      <label>Search bookings
        <input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); setLoadingPage(true); }}
          placeholder={showOwner ? 'Title, room or employee' : 'Title or room'} />
      </label>
      <label>Booking status
        <select value={statusFilter} onChange={event => { setStatusFilter(event.target.value as Booking['status'] | 'ALL'); setPage(1); setLoadingPage(true); }}>
          <option value="ALL">All statuses</option>
          <option value={BOOKING_STATUS.CONFIRMED}>Confirmed</option>
          <option value={BOOKING_STATUS.CANCELLED}>Cancelled</option>
        </select>
      </label>
    </div>

    {loadError
      ? <div className="empty-state">Could not load bookings.</div>
      : pageData && pageData.totalElements === 0 && !loadingPage
      ? <div className="empty-state booking-filter-empty">
        {query || statusFilter !== 'ALL' ? <>No bookings match these filters. <button className="text-button" onClick={resetFilters}>Clear filters</button></> : empty}
      </div>
      : <>
        <div className="booking-list-meta" aria-live="polite">
          {loadingPage ? 'Loading bookings…' : `Showing ${startIndex + 1}–${Math.min(startIndex + pageItems.length, pageData?.totalElements ?? 0)} of ${pageData?.totalElements ?? 0} bookings`}
        </div>
        {loadingPage
          ? <div className="empty-state">Loading bookings…</div>
          : <div className="booking-list">{pageItems.map(booking => <article className="booking-row" key={booking.id}>
          <div className="booking-icon"><CalendarDays /></div>
          <div className="booking-details">
            <h3>{booking.title}</h3>
            <p>{booking.room.name} · {displayDateTime(booking.startTime)} – {displayDateTime(booking.endTime)}</p>
            {showOwner && <p className="booking-owner">Booked by {booking.userEmail}</p>}
          </div>
          <span className={'status ' + booking.status.toLowerCase()}>{booking.status}</span>
          {booking.status === BOOKING_STATUS.CONFIRMED && <button className="secondary danger" disabled={busy} onClick={() => onCancel(booking)}><XCircle size={16} /> {admin ? 'Cancel booking' : 'Cancel'}</button>}
        </article>)}</div>}
        <Pagination page={currentPage} pageCount={pageCount} pageSize={pageSize}
          pageSizes={PAGE_SIZES} ariaLabel="Booking pages"
          onPageChange={nextPage => { setPage(nextPage); setLoadingPage(true); }}
          onPageSizeChange={size => { setPageSize(size); setPage(1); setLoadingPage(true); }} />
      </>}
  </>;
}
