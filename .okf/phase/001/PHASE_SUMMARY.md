---
phase: 001
title: Core MVP
status: planned
created_at: 2026-10-26
updated_at: 2026-10-26
current_task: 001_001
task_count: 3
done_count: 0
depends_on: []
---

# Phase 001 Summary — Core MVP

## Vision alignment

- Product goal: Deliver the reliable room booking experience described in
  `PRODUCT_VISION.md` for employees and administrators.
- Phase outcome: A reviewer can run the app with Docker Compose and complete
  the essential room discovery, booking, and administration flows with backend
  authorization and PostgreSQL overlap protection.

## Phase done criteria

- [ ] Employee and administrator access rules are enforced by the backend.
- [ ] Employees can find available rooms, create bookings, view their bookings,
  and cancel their own bookings.
- [ ] Administrators can manage rooms and inspect company bookings.
- [ ] PostgreSQL rejects overlapping confirmed bookings, including concurrent
  attempts; adjacent slots remain valid.
- [ ] The essential React demo flows work against the documented API, while the
  backend remains authoritative for all rules.
- [ ] `docker compose up --build` works from a fresh checkout, relevant checks
  pass, and README setup/API instructions match the implementation.

## Scope

In:

- Complete the existing Spring Boot/PostgreSQL API and React demo for the
  coding-test MVP.
- Align API paths, role names, and error behavior across Product Vision, backend,
  frontend, and README.
- Add focused tests for authorization, booking boundaries, persistence, and
  PostgreSQL overlap protection.

Out:

- Production identity/SSO, email or other notifications, recurring meetings,
  approval workflows, analytics, microservices, and infrastructure beyond the
  current Docker Compose stack.
- Frontend polish that does not support a core employee or admin flow.
- JWT work unless needed to meet an explicitly chosen authentication contract;
  documented demo HTTP Basic remains an acceptable MVP trade-off.

## Task index

| Task | Outcome | Status | Verification |
| --- | --- | --- | --- |
| 001_001 | Complete and align core backend room/booking contracts | planned | Not run |
| 001_002 | Complete essential employee and admin frontend flows | planned | Not run |
| 001_003 | Integrate, verify, and close the runnable MVP | planned | Not run |

## Current task

Selected: `001_001` — Complete and align core backend room/booking contracts.
Status: planned; implementation has not started.

## Decisions and durable contracts

- Follow `PRODUCT_VISION.md` for business behavior. The code and README currently
  use `/api` and `USER` in places while the vision specifies `/api/v1` and
  `EMPLOYEE`; task 001_001 must reconcile that contract and update consumers/docs
  together rather than leave two competing contracts.
- PostgreSQL's exclusion constraint remains the final guard against concurrent
  overlapping confirmed bookings.
- React is an optional demonstration surface; all security and booking rules
  remain enforced by the backend.

## Open questions / blockers

- None recorded. If reconciling the existing API/role naming reveals a material
  compatibility constraint, document it before changing the public contract.

## Next step

- Start task `001_001` after the user asks to implement it.

## Task notes

### 001_001 — Complete and align core backend room/booking contracts

#### Step goal

Deliver a coherent, secure backend contract for room management and the complete
employee booking lifecycle, matching `PRODUCT_VISION.md` and preserving database
enforcement of booking integrity.

#### Dependency

- Existing Spring Boot modules, PostgreSQL schema, and API implementation in
  `backend/src/main/`.

#### Scope

In:

- Reconcile `/api` versus `/api/v1` and `USER` versus `EMPLOYEE` with the product
  vision; update API consumers and documentation in the same task if paths or
  role names change.
- Add/complete service and DTO boundaries so controllers do not expose JPA
  entities or own multi-step business rules.
- Verify room create/update/deactivate and employee/admin visibility rules.
- Complete booking creation, own/admin listing, calendar/availability queries,
  owner/admin cancellation, validation, and consistent 4xx/409 responses.
- Preserve Flyway ownership of schema and the PostgreSQL exclusion constraint.

Out:

- Persistent employee directory, SSO, JWT refresh/session management, new
  business policies not specified in `PRODUCT_VISION.md`, or frontend work.

#### Acceptance criteria

- [ ] API routes and role names agree with the accepted Product Vision contract.
- [ ] Unauthenticated requests receive 401; forbidden role/ownership requests
  receive 403; missing resources receive 404; invalid ranges receive 400; booking
  conflicts receive 409 with no raw SQL or stack trace exposed.
- [ ] Only ADMIN can create, update, or deactivate rooms and list all bookings.
- [ ] Employees can list active rooms, search availability, create bookings,
  list their own bookings, and cancel only their own bookings.
- [ ] Room deactivation and booking cancellation preserve historical records.
- [ ] Booking validation rejects past/invalid windows and inactive rooms.
- [ ] The database accepts adjacent intervals and rejects overlapping confirmed
  intervals for the same room.
- [ ] API tests cover success, validation, role/ownership boundaries, and the
  relevant booking interval edges.

#### Relevant standards

- `.okf/standards/architecture.md`
- `.okf/standards/api-design.md`
- `.okf/standards/database-design.md`
- `.okf/standards/security.md`
- `.okf/standards/testing.md`
- `PRODUCT_VISION.md`

#### Affected files

- `backend/src/main/java/com/dki/meetingroom/`
- `backend/src/main/resources/db/migration/`
- `backend/src/test/`
- `PRODUCT_VISION.md` or `README.md` only where contract reconciliation requires
  a documentation correction.

#### Foundation for next step

- Stable API routes, DTOs, role/ownership behavior, and error semantics for the
  React client to consume.

#### Verification

- Focused Maven tests and backend build.
- PostgreSQL-backed integration coverage for schema constraints and overlap
  behavior; do not substitute H2 for PostgreSQL-specific guarantees.

#### Done notes

Not started.

### 001_002 — Complete essential employee and admin frontend flows

#### Step goal

Let employees and administrators complete the MVP workflows through the React
demo using the stable backend contracts from task 001_001.

#### Dependency

- Task `001_001` completed and its API routes, roles, and response/error
  contracts verified.

#### Scope

In:

- Employee sign-in, room browsing, availability search, booking creation,
  personal booking list, and cancellation.
- Admin room management and company booking inspection using the protected API.
- Clear loading, empty, success, validation, 401/403, and booking-conflict states.
- Responsive core layouts and API request/response types matching the backend.

Out:

- New backend business rules, complex calendar integrations, notifications,
  advanced visual redesign, and frontend-only authorization.

#### Acceptance criteria

- [ ] Employee can complete the room search and booking lifecycle from the UI.
- [ ] Admin can create/update/deactivate rooms and inspect all bookings.
- [ ] UI handles invalid time ranges and HTTP 409 conflicts without losing the
  user's entered form values.
- [ ] Admin-only UI affordances are presentation only; backend remains the
  authorization authority.
- [ ] No user-facing core flow depends on hard-coded knowledge of another
  account's credentials or role for security decisions.
- [ ] Frontend production build succeeds.

#### Relevant standards

- `.okf/standards/architecture.md`
- `.okf/standards/api-design.md`
- `.okf/standards/security.md`
- `PRODUCT_VISION.md`
- `.codex/skills/frontend-architecture/SKILL.md`

#### Affected files

- `frontend/src/`
- `frontend/package.json` only if a dependency is justified.

#### Foundation for next step

- Demonstrable end-to-end employee and admin flows ready for whole-stack
  acceptance checks.

#### Verification

- `npm run build` from `frontend/`.
- Manual UI smoke check against the backend for employee and admin journeys.

#### Done notes

Not started.

### 001_003 — Integrate, verify, and close the runnable MVP

#### Step goal

Prove a fresh checkout runs as documented and the backend, database, and demo UI
work together against every MVP acceptance criterion.

#### Dependency

- Tasks `001_001` and `001_002` completed.

#### Scope

In:

- Fix integration mismatches among Compose, Flyway, API, frontend, and seed/demo
  configuration.
- Run relevant backend, PostgreSQL concurrency, frontend, and whole-stack smoke
  checks; record actual results.
- Update README/API documentation to match delivered behavior and trade-offs.
- Confirm no secrets or local `.env` files are tracked.

Out:

- Publishing or deploying the application, adding new features, and production
  hardening beyond the Product Vision's MVP boundary.

#### Acceptance criteria

- [ ] `docker compose up --build` starts the application and PostgreSQL from a
  clean state, and Flyway migrations complete without manual database setup.
- [ ] Employee and admin demo credentials support the documented MVP journeys.
- [ ] Automated checks demonstrate authorization, valid booking, overlap
  conflict, adjacent bookings, cancellation freeing a slot, and concurrent
  overlap protection on PostgreSQL.
- [ ] Frontend build and documented API examples match the current contract.
- [ ] README setup, API, demo-account, test, architecture, and limitation sections
  match the implementation.
- [ ] Every unchecked Product Vision MVP definition-of-done item is either
  verified or explicitly recorded as blocked/out of scope with a reason.

#### Relevant standards

- `.okf/standards/testing.md`
- `.okf/standards/database-design.md`
- `PRODUCT_VISION.md`
- `README.md`

#### Affected files

- `compose.yaml`
- `backend/` and `frontend/` integration/configuration as needed.
- `README.md` and this phase summary.

#### Foundation for next step

- A reviewable MVP with verified run instructions and an evidence-based record
  of remaining limitations.

#### Verification

- Maven tests/build.
- PostgreSQL-specific integration/concurrency tests.
- `npm run build` from `frontend/`.
- `docker compose up --build` and focused whole-stack smoke checks.

#### Done notes

Not started.

## Scan rule

Work on only the selected current task. Do not start dependent tasks until the
current task's acceptance criteria and verification are recorded. Do not create
future phases unless the user asks.
