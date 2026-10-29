# Task: Remove the calendar success toast

## Vision alignment

- Product goal: Keep the room calendar focused on reviewing confirmed schedules.
- User-facing outcome: Successful calendar loads update the page without a redundant toast; errors remain visible.
- Explicitly out of scope: Changing calendar search, loading, or error behavior.

## Scope

In:

- Remove the success toast shown after a calendar query completes.

Out:

- Removing errors or success feedback from other booking actions.

## Acceptance criteria

- [x] Successful calendar searches do not show a toast.
- [x] Calendar request and validation errors still show error notifications.

## Affected areas

- API/UI: Calendar load feedback.
- Data/migration: None.
- Modules/files: `frontend/src/contexts/WorkspaceContext.tsx`.

## Dependencies and open questions

- None.

## Verification

- `npm run build` from `frontend/`.

## Done notes

- Implementation: Removed only the calendar query success notification.
- Checks run and results: `npm run build` passed (TypeScript and Vite; 1,605 modules).
