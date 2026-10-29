# Task: Collapse and expand calendar room schedules

## Vision alignment

- Product goal: Let employees and admins review confirmed room schedules in the optional calendar UI.
- User-facing outcome: Users can collapse busy room schedules to scan room names and booking counts, then expand selected rooms.
- Explicitly out of scope: API pagination, server-side changes, and changing the calendar's default date range.

## Scope

In:

- Add accessible per-room collapse/expand controls.
- Add controls to collapse or expand all rooms in the current result.
- Keep booking counts visible while a room is collapsed.

Out:

- Changing calendar API behavior or booking visibility rules.

## Acceptance criteria

- [x] Each room can be collapsed or expanded independently.
- [x] Collapse all and Expand all affect the rooms in the current result.
- [x] Room booking counts remain visible while collapsed.
- [x] Keyboard users can operate the controls and read expanded state.

## Affected areas

- API/UI: Room calendar presentation only.
- Data/migration: None.
- Modules/files: `frontend/src/pages/CalendarPage.tsx`, `frontend/src/styles.css`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Added per-room accessible toggles and Collapse all / Expand all controls.
- Checks run and results: `npm run build` passed (TypeScript and Vite; 1,604 modules).
