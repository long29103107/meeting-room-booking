---
phase: 001
title: Core MVP
status: in_progress
created_at: 2026-10-26
updated_at: 2026-10-26
current_task: 001_003
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
| 001_001 | Complete and align core backend room/booking contracts | in_progress | `mvn -o clean -DskipTests package` passes; live PostgreSQL verification remains pending |
| 001_002 | Complete essential employee and admin frontend flows | in_progress | `npm run build` passes; live UI/API walkthrough pending |
| 001_003 | Integrate, verify, and close the runnable MVP | in_progress | `docker compose config` passes; full Compose/PostgreSQL run pending |

## Current task

Selected: `001_003` — Integrate, verify, and close the runnable MVP.
Implementation across all three phase tasks is in place. Full-stack and
PostgreSQL verification remains pending because Docker Desktop is not running.
The latest clean Maven package passed with tests skipped; the earlier test run
did not return a trustworthy final result.

## Decisions and durable contracts

- API paths and query parameter names use `/api/v1`, `/bookings/me`,
  `startTime`/`endTime`, and `from`/`to`; demo roles are `EMPLOYEE` and `ADMIN`.
- Shared API roots, security roles/authorities, and booking statuses are named
  constants under `common` to keep security and persistence contracts aligned.
- Frontend supports employee search/booking/personal bookings/cancellation and
  admin room management/company booking flows. It discovers admin capability
  through the protected API; backend authorization remains authoritative.
- Backend uses `application.properties`; frontend uses `frontend/.env` with
  `VITE_API_BASE_URL`. Root `.env.example` configures Compose database settings.
- Backend listens on port `5001`; Compose publishes `5001`, and both Vite and
  nginx proxy API requests to that backend port.
- Swagger UI is at `/swagger-ui.html` and OpenAPI JSON at `/v3/api-docs`;
  documentation is public, while API operations retain Basic Auth/role checks.
- Flyway V1 creates the `rooms` and `bookings` schema and seeds Orchid, Lotus,
  Jasmine, and Bamboo. Demo users remain in-memory and are not persisted entities.
- JPA entity column lengths/nullability now mirror the Flyway schema for startup
  validation.
- Added a shared IntelliJ `MeetingRoomApplication` Run/Debug configuration for
  local backend development.
- PostgreSQL's exclusion constraint remains the final guard against concurrent
  overlapping confirmed bookings.
- React is an optional demonstration surface; all security and booking rules
  remain enforced by the backend.

## Open questions / blockers

- Docker Desktop's Linux engine pipe is unavailable. Testcontainers skips the
  six PostgreSQL integration checks in this state; the Compose runtime and live
  UI/API walkthrough have not been verified.
- No Docker engine or local PostgreSQL listener is available, so Swagger UI,
  Flyway seed startup, and JPA schema validation have not been exercised live.
- `mvn test` did not return a final result in this environment. Maven emitted
  `Access is denied` for its Java tool pipe; do not count that run as a pass.

## Next step

- Start Docker Desktop, run `docker compose up --build`, and follow the
  one-pass employee/admin walkthrough in README. Then run `mvn test` in
  `backend/` with Docker active; close this phase only after PostgreSQL tests
  and the end-to-end flow pass.

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
  business policies not specified in `PRODUCT_VISION.md`, or new frontend
  features/UX changes. Update existing frontend API calls only to match the
  backend contract.

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

- Implemented service/DTO boundaries, API contract alignment, role checks,
  standardized errors, room and booking validation, and focused tests.
- Reorganized backend source into layer-first packages, with JPA entities
  separated under `entity/`.
- `mvn package`: BUILD SUCCESS; 12 tests discovered, 8 passed, 4 PostgreSQL
  Testcontainers tests skipped because Docker was unavailable.
- `npm run build`: passed after installing declared dependencies without writing
  a lockfile; frontend changes only update the API path/query contract.
- Full PostgreSQL and Docker Compose verification is still required; see
  [001_001 implementation log](001_001_LOG.md).

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

- Implemented employee sign-in, room browsing, time/capacity availability
  search, booking creation, personal booking listing, and cancellation.
- Implemented admin room create/edit/deactivate/reactivate and company booking
  listing/cancellation. Admin capability comes from the protected API response;
  server authorization remains authoritative.
- Added loading, empty, success, validation, and API error states. Booking form
  state stays open when the API rejects a request.
- `npm run build` passed. Live browser/API smoke check remains pending Docker.

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

- `docker-compose.yaml`
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

- README now includes a one-pass employee/admin walkthrough and explicit
  PostgreSQL Testcontainers requirements. Compose uses the backend datasource
  environment and the root `.env.example`; frontend settings use `.env`.
- Added PostgreSQL integration tests for cancellation freeing a slot and
  simultaneous overlapping bookings (expected one 201 and one 409).
- `docker compose config` passed. `mvn -o clean -DskipTests package` passed
  after adding Swagger/OpenAPI and entity metadata and compiled 20 production
  sources and all 3 test sources. Tests were skipped for this pass. Docker
  Desktop is not running, so PostgreSQL and live Compose checks remain pending.
- Switched the backend host/container port from `8080` to `5001`; aligned
  Spring Boot, Docker Compose, Dockerfile, Vite/nginx proxies, README, and
  Product Vision. `docker compose config` and `npm run build` passed after the
  port change.

## Phase handoff

The user requested completion of all three phase tasks for one test session.
Keep status in progress until the Docker/PostgreSQL and live walkthrough checks
are recorded; do not infer completion from implementation or compilation alone.
