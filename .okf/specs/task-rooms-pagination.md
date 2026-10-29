# Task: Paginate the room list

## Vision alignment

- Product goal: Help employees discover rooms and help admins manage room records in the optional UI.
- User-facing outcome: The rooms page shows a manageable slice of rooms at a time and lets users move through results.
- Explicitly out of scope: Backend/API pagination and changes to availability or room filtering rules.

## Scope

In:

- Add client-side pagination to the room cards, including availability search results.
- Offer 10, 20, or 40 rooms per page, defaulting to 10, and show the current range and total.
- Reset or clamp the current page when the result set changes.

Out:

- Server-side pagination or changes to the booking flow.

## Acceptance criteria

- [x] Room cards are divided into pages with selectable 10/20/40 sizes, defaulting to 10.
- [x] Previous and Next controls show the current page and total page count.
- [x] Numbered page buttons let users jump directly between pages; long ranges use ellipses.
- [x] The page-size selector sits to the left of the pagination controls below the room cards, with the group aligned right.
- [x] Pagination controls are shared with the calendar page.
- [x] Changing availability results or page size returns the user to a valid first page.
- [x] Empty search results keep the existing empty state and hide pagination controls.

## Affected areas

- API/UI: Rooms page only.
- Data/migration: None.
- Modules/files: `frontend/src/pages/RoomsPage.tsx`, `frontend/src/styles.css`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Added 10/20/40 page sizes, defaulting to 10, with a result range and accessible previous/next navigation for room cards. The shared pagination component displays generic item counts and keeps the page-size selector left of the navigation at the right end of the bottom row.
- Checks run and results: `npm run build` passed (TypeScript and Vite; 1,604 modules).
