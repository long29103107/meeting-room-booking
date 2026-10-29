type PaginationProps = {
  page: number;
  pageCount: number;
  pageSize: number;
  pageSizes: number[];
  ariaLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

function getVisiblePages(page: number, pageCount: number): Array<number | 'ellipsis-start' | 'ellipsis-end'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, 'ellipsis-end', pageCount];
  if (page >= pageCount - 3) {
    return [1, 'ellipsis-start', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, 'ellipsis-start', page - 1, page, page + 1, 'ellipsis-end', pageCount];
}

export function Pagination({
  page,
  pageCount,
  pageSize,
  pageSizes,
  ariaLabel,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (pageCount <= 1) return null;

  return <div className="pagination-controls">
    <select aria-label="Items per page" value={pageSize}
      onChange={event => onPageSizeChange(Number(event.target.value))}>
      {pageSizes.map(size => <option key={size} value={size}>{size} items</option>)}
    </select>
    <nav className="booking-pagination" aria-label={ariaLabel}>
      <button className="secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
      <div className="pagination-page-numbers" aria-label="Page numbers">
        {getVisiblePages(page, pageCount).map(pageNumber => typeof pageNumber === 'number'
          ? <button key={pageNumber} className={'secondary pagination-page' + (pageNumber === page ? ' active' : '')}
            aria-label={`Page ${pageNumber}`} aria-current={pageNumber === page ? 'page' : undefined}
            onClick={() => onPageChange(pageNumber)}>{pageNumber}</button>
          : <span key={pageNumber} className="pagination-ellipsis" aria-hidden="true">…</span>)}
      </div>
      <button className="secondary" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
    </nav>
  </div>;
}
