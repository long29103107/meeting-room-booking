# Task: Filter and paginate booking lists

## Vision alignment

- Product goal: Let employees and administrators find reservations in their
  booking lists quickly.
- User-facing outcome: Booking lists support text search, status filtering, and
  page navigation without changing booking APIs.
- Out of scope: Server-side pagination, sorting controls, and API changes.

## Scope

In:

- Add a title/room search and status filter to shared booking lists.
- Show 10, 20, or 40 entries per page using the shared pagination component, defaulting to 10.

Out:

- Changing backend authorization or booking behavior.

## Acceptance criteria

- [x] Search matches title and room; company bookings also match owner email.
- [x] Status can be filtered to confirmed, cancelled, or all.
- [x] Pagination resets when filters/page size change and clamps after list updates.
- [x] Numbered page buttons allow direct navigation between pages.
- [x] The shared page-size selector and previous/next controls appear below the list.
- [x] Existing cancellation controls continue to work.

## Affected areas

- API/UI: Shared booking-list presentation.
- Data/migration: None.
- Modules/files: `frontend/src/components/booking/BookingList.tsx`,
  `frontend/src/components/common/Pagination.tsx`, `frontend/src/styles.css`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Added search and status filters plus client-side pagination
  to personal and company booking lists. Shared pagination displays generic
  item counts with 10/20/40 page sizes, defaulting to 10.
- Checks run and results: `npm run build` passed (TypeScript and Vite, 1,605
  modules). The running Compose UI receives this change after a new frontend
  image is published and pulled.
