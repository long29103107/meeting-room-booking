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
- Show 10, 20, or 50 entries per page with previous/next navigation.

Out:

- Changing backend authorization or booking behavior.

## Acceptance criteria

- [x] Search matches title and room; company bookings also match owner email.
- [x] Status can be filtered to confirmed, cancelled, or all.
- [x] Pagination resets when filters/page size change and clamps after list updates.
- [x] Existing cancellation controls continue to work.

## Affected areas

- API/UI: Shared booking-list presentation.
- Data/migration: None.
- Modules/files: `frontend/src/components/booking/BookingList.tsx`,
  `frontend/src/styles.css`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Added search, status filter, and client-side pagination to
  personal and company booking lists.
- Checks run and results: `npm run build` passed (TypeScript and Vite, 1,604
  modules). The running Compose UI receives this change after a new frontend
  image is published and pulled.
