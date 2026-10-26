# Phase 002 — Shared Room Calendar

## Status

Implemented

## Vision alignment

- Product goal: Let employees discover room availability and view room calendars.
- User outcome: Employees and administrators can inspect confirmed reservations
  for a selected time window and room from the demo UI.
- Explicitly out of scope: Editing bookings, recurring reservations, calendar
  integrations, notifications, and Docker/Compose work.

## Problem and actors

- Problem: The backend exposes a shared calendar endpoint, but users currently
  have no UI for seeing a room's confirmed schedule.
- Primary actors: Authenticated employees and administrators.

## User flow

1. Open the Calendar view.
2. Choose a start and end time, optionally filter to one room, and submit.
3. Review confirmed reservations grouped by room in local time.

## Requirements and business rules

- Call `GET /api/v1/bookings/calendar?from=...&to=...` using the existing Basic
  Auth session.
- Keep the API's existing half-open overlap query and confirmed-only behavior.
- Require start time to be earlier than end time in the UI; retain inputs on
  errors.
- Room filtering is a presentation filter over returned calendar entries.
- Show meeting title, room, and start/end times. Do not display attendee email
  in this shared view.

## Acceptance criteria

- [x] Authenticated users can open Calendar and query confirmed bookings for a
  valid offset-aware time range.
- [x] Results are grouped by room and display meeting title and local start/end
  times; an optional room filter narrows visible results.
- [x] Empty results and API errors are understandable; invalid ranges do not
  trigger a request or discard entered values.
- [x] The calendar view uses existing backend authorization and adds no schema
  or booking-policy changes.
- [x] Frontend production build succeeds.

## API and data impact

- API changes: None; reuse the authenticated calendar endpoint.
- Persistence/migration changes: None.
- Compatibility/error behavior: Existing API error envelope and status codes.

## Security and validation

- Authentication/authorization: Existing authenticated access to the shared
  calendar endpoint; the backend remains authoritative.
- Validation and boundary cases: Require `from < to`; serialize form values as
  ISO-8601 instants with an offset before making the request.

## Open questions and assumptions

- Open questions: None for this bounded feature.
- Explicit assumptions: The existing shared calendar API is intended for both
  EMPLOYEE and ADMIN as documented in `PRODUCT_VISION.md` and `README.md`.

## Scope

In:

- Add a responsive calendar navigation item, date-range query form, optional
  room filter, and room-grouped booking schedule.
- Reuse existing endpoint, DTO, and toast behavior.

Out:

- Backend/API changes, migrations, booking edits, pagination, and deployment.

## Dependencies and risks

- Depends on `/api/v1/bookings/calendar` and the current booking response shape.
- API returns only confirmed bookings overlapping the requested interval.

## Verification

- Automated: `bun run build` from `frontend/`.
- Manual/integration: Review endpoint calls and UI state handling; full live
  PostgreSQL/UI walkthrough remains for final integration after phases 1–3.
