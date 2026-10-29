# Feature Specification: Server-side pagination for booking lists

## Status

Implemented

## Vision alignment

- Product goal: Let employees find their bookings and admins inspect company reservations efficiently.
- User outcome: Changing page, filters, or page size requests the matching booking page from the API instead of paging a stale in-memory snapshot.
- Explicitly out of scope: Pagination for room search or calendar endpoints; changing booking lifecycle or authorization rules.

## Problem and actors

- Problem: The current UI downloads complete booking lists once and slices them locally; changing pages does not fetch current data from the server.
- Primary actors: Employees viewing their bookings and admins viewing company bookings.

## User flow

1. The page requests page 0 using the selected page size and filters.
2. User changes page, page size, search text, or status.
3. The UI fetches that page from the matching authenticated endpoint and updates rows and totals.

## Requirements and business rules

- Page is zero-based at the API boundary; page size must be 1–100.
- Search matches title, room name/location, and (on company lists) owner email.
- Status accepts `CONFIRMED`, `CANCELLED`, or omitted for all statuses.
- Employee list queries are restricted to the authenticated owner and active rooms.
- Company list queries are admin-only and include inactive-room history.
- Sort deterministically by start time descending, then booking ID descending.
- Existing array endpoints remain compatible for current callers.

## Acceptance criteria

- [x] Booking page navigation, filter changes, and page-size changes fetch a new API page.
- [x] API returns page content and total count/page metadata.
- [x] Employees cannot access company page data and cannot retrieve another employee's bookings.
- [x] Existing booking cancellation refreshes the currently selected list page.
- [x] Legacy list endpoints retain their existing response shape.

## API and data impact

- API changes: Add `GET /api/v1/bookings/me/page` and admin-only `GET /api/v1/bookings/page`; accept `page`, `size`, `query`, and `status`; return `content`, `page`, `size`, `totalElements`, and `totalPages`.
- Persistence/migration changes: None; use a pageable database query with an explicit count query.
- Compatibility/error behavior: Keep existing list endpoints unchanged; invalid page/size/status returns HTTP 400.

## Security and validation

- Authentication/authorization: `/me/page` derives owner from authentication; `/page` is restricted to ADMIN at the security matcher.
- Validation and boundary cases: page >= 0, size 1–100, accepted status values only, empty results return an empty page.

## Open questions and assumptions

- Open questions: None.
- Explicit assumptions: Page-number controls remain 1-based in the UI and map to zero-based API page indices.

## Scope

In:

- Backend pageable repository/service/controller endpoints and a page response DTO.
- Frontend fetch-on-page/search/status/page-size behavior for personal and company booking lists.

Out:

- Changing room/calendar pagination, schema migrations, and changes to booking rules.

## Dependencies and risks

- Frontend and backend GHCR images must be published together before the registry-only Compose stack can use the new API contract.

## Verification

- Automated: `mvn -DskipTests package` and `npm run build`.
- Manual/integration: Not run; Docker Engine access was denied in this session.

## Done notes

- Implementation: Added database-backed page endpoints for personal and company booking lists, including filters and totals. The frontend requests fresh data on page, size, search, status, and booking refresh changes. The existing array endpoints remain available. Changed optional search to a non-null LIKE pattern to avoid PostgreSQL binding a null LIKE parameter as `bytea`.
- Checks run and results: `mvn -DskipTests package` passed and compiled the existing test sources; tests were skipped. `npm run build` passed (TypeScript and Vite; 1,605 modules). `git diff --check` passed. PostgreSQL query startup and API smoke checks remain unverified because Docker Engine access was denied.
