# Decision 001: Frontend routes and source layout

- Status: accepted
- Date: 2026-10-26
- Context: The React demo had one `App.tsx` containing every screen, navigation,
  API request, and shared interaction state. Screens had no stable URL.
- Decision: Use React Router v7 declarative browser routes. Keep route paths,
  declarations, and guards in `routes/`; route screens in `pages/`; shared UI
  in `components/`; shared workspace state/actions in `contexts/`; HTTP access
  in `services/`; domain types in `types/`; and pure helpers in `utils/`.
- Alternatives considered: Keep local `useState` screen switching; implement a
  custom History API router; adopt a framework with server-side rendering.
- Consequences: Each screen has a direct URL and browser history support. The
  app gains a router dependency and separates presentation from shared API/state
  concerns. Frontend route guards remain non-authoritative; backend security is
  unchanged.
- Related specs/code: `.okf/specs/phase-003-frontend-architecture.md`,
  `frontend/src/routes/`, `frontend/src/pages/`, `frontend/src/components/`,
  `frontend/src/contexts/`, and `frontend/src/services/`.
