# Task: Hide inactive-room bookings from employee views

## Vision alignment

- Product goal: Keep employee room and schedule views focused on bookable rooms.
- User-facing outcome: Inactive rooms and their bookings no longer appear in
  My bookings or the shared calendar/filter; admin company history remains
  available.
- Out of scope: Deleting or cancelling booking records, or changing API results.

## Scope

In:

- Filter inactive-room bookings from the personal booking list and calendar.
- Exclude inactive rooms from the calendar room filter.
- Document the display rule.

Out:

- Changing backend data retention, API behavior, or admin company booking history.

## Acceptance criteria

- [x] My bookings omits bookings whose room is inactive.
- [x] Calendar omits inactive-room bookings and filter options.
- [x] Inactive booking records remain available to admin company history.

## Affected areas

- API/UI: Employee booking/calendar views.
- Data/migration: None; all booking records remain stored.
- Modules/files: `frontend/src/pages/MyBookingsPage.tsx`,
  `frontend/src/pages/CalendarPage.tsx`, `PRODUCT_VISION.md`, `README.md`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Added active-room filtering to the employee personal-bookings
  and calendar views; admin company booking history continues to show all data.
- Checks run and results: `npm run build` passed (TypeScript and Vite, 1,604
  modules). The running Compose UI will receive the change after CI publishes a
  new frontend image.
