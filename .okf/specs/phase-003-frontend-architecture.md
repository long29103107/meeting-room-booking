# Phase 003 — Frontend Pages, Components, and Routes

## Status

Implemented

## Vision alignment

- Product goal: Keep the optional React demo understandable and easy to extend
  while it demonstrates the MVP workflows.
- User outcome: Each workspace view has a stable URL, and developers can locate
  route, page, shared component, and API/state code independently.
- Explicitly out of scope: New product features, backend/API changes, database
  changes, visual redesign, and Docker/Compose work.

## Problem and actors

- Problem: `App.tsx` currently mixes login, navigation, multiple screens,
  API calls, dialogs, and shared state; screen changes are only local state and
  cannot be linked/bookmarked directly.
- Primary actors: Frontend developers and employees/admins using the demo UI.

## User flow

1. Open or navigate to `/login`, `/rooms`, `/calendar`, `/bookings`, or
   `/company-bookings`.
2. Protected routes require the existing authenticated session.
3. The company bookings route redirects non-admins to `/rooms`.
4. Each route renders its page inside the shared authenticated workspace shell.

## Requirements and business rules

- Use React Router declarative route definitions.
- Put route declarations and route guards in `routes/`.
- Put page-level screens in `pages/`; put reusable presentation/dialog/navigation
  elements in `components/`.
- Put shared workspace state and API client logic outside page components.
- Preserve current endpoints, request/response contracts, role checks, and
  employee/admin behavior.
- Keep the router compatible with the existing React 18 and Vite setup.

## Acceptance criteria

- [x] Named paths exist for login, rooms, calendar, own bookings, and company
  bookings, including direct navigation and browser back/forward behavior.
- [x] Protected routes redirect unauthenticated users to login; admin-only
  routes redirect employees to rooms.
- [x] Each screen, shared shell, and reusable UI has its own source module under
  `pages/` or `components/`, with route definitions under `routes/`.
- [x] Existing employee/admin workflows and API behavior remain unchanged.
- [x] Frontend production build succeeds and the dependency lockfile is updated.

## API and data impact

- API changes: None.
- Persistence/migration changes: None.
- Compatibility/error behavior: Existing API contracts remain unchanged.

## Security and validation

- Authentication/authorization: Route guards improve navigation only; backend
  remains authoritative for every API permission.
- Validation and boundary cases: Preserve existing request validation and API
  error handling.

## Open questions and assumptions

- Open questions: None.
- Explicit assumptions: Client-side routes are appropriate for this Vite SPA;
  nginx already falls back to `index.html` for direct path requests.

## Scope

In:

- Introduce a React Router v7 dependency compatible with React 18.
- Split routes, pages, shared components, context, and API service modules.
- Update navigation to real links and preserve direct URL access.

Out:

- New business capabilities, server-rendering, route loaders/actions, and
  backend/security changes.

## Dependencies and risks

- Depends on the existing Vite SPA fallback and current session-storage auth.
- Dependency installation requires the existing Bun lockfile workflow.

## Verification

- Automated: frontend production build using the Bun/Vite command.
- Manual/integration: inspect route guards and direct-path fallback; live API
  walkthrough remains part of final integration.
