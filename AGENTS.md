# Repository Instructions

## Mission and sources of truth

Build the DKI meeting-room booking coding-test MVP described in `PRODUCT_VISION.md`.
The product vision defines scope and accepted design decisions; this file defines
how agents work in the repository. `README.md` documents how to run and evaluate
the current implementation. If code and docs disagree, inspect the code and
record a focused correction instead of assuming either is current.

## Required context before planning or implementation

1. Read `PRODUCT_VISION.md` for scope, actors, rules, and architecture.
2. Read `.okf/README.md` for the spec and task workflow.
3. Read the relevant standards under `.okf/standards/`.
4. Inspect the affected source, migrations, and existing tests before proposing changes.

## Project boundaries

- Backend: Java 21, Spring Boot 3, REST/JSON, Spring Data JPA, PostgreSQL 16,
  Flyway, Spring Security, Maven; modular monolith using conventional Spring
  layers: Controller → Service → Repository, with entities and DTOs at the data
  and API boundaries.
- Frontend: optional React + TypeScript + Vite demonstration UI. Enforce all
  business rules and authorization in the backend.
- Runtime: Docker Compose; keep the documented single-command startup working.
- Do not add microservices, queues, Redis, Kubernetes, SSO, notifications,
  recurring bookings, approval flows, or other explicit non-goals without a
  user-approved scope update in `PRODUCT_VISION.md`.
- Treat PostgreSQL's exclusion constraint as the final protection against
  overlapping confirmed bookings. An application pre-check alone is insufficient.

## Specification and change workflow

- Write or update a spec before multi-step features or cross-module changes.
  Use `.okf/templates/spec.md`; keep small fixes in a task note using
  `.okf/templates/task.md`.
- Every proposed change states vision alignment, user outcome, in/out scope,
  acceptance criteria, affected interfaces/data, and verification.
- Record newly chosen durable product or architecture rules in
  `.okf/decisions/` and update `PRODUCT_VISION.md` when scope or behavior changes.
- Prefer the smallest end-to-end slice. Do not create a phase or expand the
  product roadmap unless the user asks.
- Keep controllers thin, put business rules/transactions in services and data
  access in repositories. Validate and authorize on the server, and preserve the
  API error semantics documented in `README.md`.
- Database changes go through a new Flyway migration; do not edit an already
  applied migration to change existing schema state.
- Never commit secrets or trust frontend checks for authorization or booking rules.
- Preserve unrelated user changes.

## Verification and project memory

- Run only the checks relevant to the change unless the user asks for a broader
  verification pass. Report commands and any checks not run.
- For backend changes, use Maven tests/build; for frontend changes, use the
  frontend build; for deployment/configuration changes, use Docker Compose when
  available. Do not claim a check passed unless it ran successfully.
- Update the applicable phase summary after implementation and verification.
- Do not claim the repository is production-ready; the demo HTTP Basic accounts
  and other limitations are documented in `README.md`.
