# Task: Paginate calendar rooms

## Vision alignment

- Product goal: Let employees and admins review confirmed room schedules in the optional calendar UI.
- User-facing outcome: Users can review calendar schedules in manageable pages while keeping each room and its bookings grouped.
- Explicitly out of scope: API pagination and changes to booking visibility or calendar filtering.

## Scope

In:

- Paginate room groups on the calendar with selectable page sizes of 5, 10, or 15 items.
- Show the visible room range and previous/next page controls.
- Keep room collapse state and bulk collapse/expand behavior available.

Out:

- Splitting a room's bookings across pages or changing API behavior.

## Acceptance criteria

- [x] The page size defaults to 5 items and offers 10 and 15.
- [x] Each room and its bookings stay together on the same page.
- [x] Numbered page buttons allow direct navigation between pages.
- [x] The current page is clamped/reset when page size or calendar filters change.
- [x] Room collapse/expand and bulk controls remain available.
- [x] The page-size selector and navigation use the shared pagination component also used by the rooms page.

## Affected areas

- API/UI: Room calendar only.
- Data/migration: None.
- Modules/files: `frontend/src/pages/CalendarPage.tsx`, `frontend/src/styles.css`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Added 5/10/15 page sizes, visible range, and previous/next navigation. Reused the shared pagination control from the rooms page; options display generic item counts and the selector has an accessible name without visible helper text.
- Checks run and results: `npm run build` passed (TypeScript and Vite; 1,604 modules).
