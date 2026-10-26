---
name: frontend-architecture
description: Implement or refactor the optional React, TypeScript, and Vite demo UI in this repository. Use for frontend component, API integration, routing, or styling changes.
---

# Frontend Architecture

Use for `frontend/` work. Inspect `frontend/src`, `frontend/package.json`,
`PRODUCT_VISION.md`, and `.okf/standards/architecture.md` before changing structure.

## Rules

- Follow the existing frontend layout and conventions; do not introduce a new
  router, state library, component framework, or CSS system without a need.
- Keep TypeScript request/response types aligned with backend API contracts.
- Put API calls and reusable UI at the narrowest appropriate shared or feature
  boundary; keep view components focused on presentation and user interaction.
- Treat frontend validation as usability only. The backend remains authoritative
  for authentication, authorization, booking rules, and conflict handling.
- Make loading, empty, success, and API-error states clear to the user.
- Keep the UI optional; do not let its architecture impose requirements on the
  backend assignment.

## Verification

Run `npm run build` from `frontend/` after frontend implementation changes when
dependencies are available, and report if it was skipped.
