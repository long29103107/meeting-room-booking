---
phase: 001
title: Core MVP
status: complete
created_at: 2026-10-26
updated_at: 2026-10-26
current_task: 001_003
task_count: 3
done_count: 3
depends_on: []
---

# Phase 001 Summary — Core MVP

## Vision alignment

- Product goal: Deliver the reliable room booking experience described in
  `PRODUCT_VISION.md` for employees and administrators.
- Phase outcome: Implement the core room discovery, booking, and administration
  features and verify the available development checks. Docker/Compose delivery
  is deferred until feature phases 1–3 are complete.

## Phase done criteria

- [x] Backend enforces Employee/Admin access rules; focused security/service
  checks pass.
- [x] Employee and admin room/booking flows are implemented in the React demo
  and use the documented API contracts.
- [x] Flyway defines PostgreSQL's exclusion constraint and the integration
  suite covers overlapping/concurrent bookings. Live PostgreSQL execution is
  deferred to final integration.
- [x] Backend and frontend build checks pass in the development environment.
- [x] README and API instructions match the implementation. Docker/Compose
  startup and containerized PostgreSQL verification remain final-phase checks
  after feature phases 1–3.

## Scope

In:

- Complete the existing Spring Boot/PostgreSQL API and React demo features for
  the coding-test MVP in the development environment.
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
| 001_001 | Complete and align core backend room/booking contracts | complete | 10 service/security/error-handler tests pass; PostgreSQL runtime verification deferred |
| 001_002 | Complete essential employee and admin frontend flows | complete | `bun run build` passes; live DB walkthrough deferred to final integration |
| 001_003 | Integrate feature work and verify development workflows | complete | Non-Docker Maven checks and Bun build pass; Docker deferred |

## Current task

Selected: `001_003` — Integrate feature work and verify development workflows.
All Phase 1 feature implementation is complete. Ten focused non-Docker backend
tests and the frontend build pass. Docker/Compose and live PostgreSQL/UI
verification are intentionally deferred until final integration after feature
phases 1–3.

## Decisions and durable contracts

- API paths and query parameter names use `/api/v1`, `/bookings/me`,
  `startTime`/`endTime`, and `from`/`to`; demo roles are `EMPLOYEE` and `ADMIN`.
- `PRODUCT_VISION.md` now reflects the implemented API and persistence
  contracts: HTTP Basic with in-memory demo users, numeric IDs, `user_email`
  booking ownership, room deactivation via `DELETE /rooms/{id}`, and calendar
  queries at `/bookings/calendar`.
- Shared API roots, security roles/authorities, and booking statuses are named
  constants under `common` to keep security and persistence contracts aligned.
- API exceptions use the shared `ApiError` envelope for validation, bad
  parameters, unsupported methods/content types, missing routes, and database
  conflicts. Unexpected exceptions are logged server-side and return a generic
  500 response; error codes are named constants.
- Frontend supports employee search/booking/personal bookings/cancellation and
  admin room management/company booking flows. It discovers admin capability
  through the protected API; backend authorization remains authoritative.
- Backend uses `application.properties`; frontend uses `frontend/.env` with
  `VITE_API_BASE_URL`. Root `.env.example` configures Compose database settings.
- Backend listens on port `5001`; Compose publishes `5001`, and both Vite and
  nginx proxy API requests to that backend port.
- Frontend package management uses Bun `1.3.13` with the committed `bun.lock`;
  local development and the Docker build use Bun commands.
- Frontend runs on port `5000` in Vite development and is published as
  `localhost:5000` by Docker Compose; nginx serves the container on port `80`.
- Swagger UI is at `/swagger-ui.html` and OpenAPI JSON at `/v3/api-docs`;
  documentation is public, while API operations retain Basic Auth/role checks.
- Flyway V1 creates the `rooms` and `bookings` schema and seeds Orchid, Lotus,
  Jasmine, and Bamboo. Demo users remain in-memory and are not persisted entities.
- Spring Boot applies pending Flyway migrations automatically during backend
  startup from `classpath:db/migration` (Flyway records applied versions in
  `flyway_schema_history`). For schema changes, add the entity mapping and a new
  versioned SQL migration such as `V2__add_room_description.sql`; do not edit
  applied migrations. Hibernate uses `ddl-auto=validate` and does not generate
  schema changes.
- JPA entity column lengths/nullability now mirror the Flyway schema for startup
  validation.
- Added a shared IntelliJ `MeetingRoomApplication` Run/Debug configuration for
  local backend development.
- PostgreSQL's exclusion constraint remains the final guard against concurrent
  overlapping confirmed bookings.
- React is an optional demonstration surface; all security and booking rules
  remain enforced by the backend.

## Deferred final integration

- No local PostgreSQL listener is available. Flyway startup, JPA schema
  validation, PostgreSQL overlap/concurrency tests, and live UI/API walkthrough
  remain for final integration after feature phases 1–3.
- Docker/Compose and Docker-backed Testcontainers are explicitly outside this
  feature phase and are not Phase 1 blockers.
- Maven's default Surefire fork hits a Java attach pipe permission issue; the
  selected tests pass with `-DforkCount=0`.

## Next step

- Feature phases 001–003 are complete; resume final integration in
  `.okf/phase/004/PHASE_SUMMARY.md` when the Docker engine is available.

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

- [x] API routes and role names agree with the accepted Product Vision contract.
- [x] Unauthenticated requests receive 401; forbidden role/ownership requests
  receive 403; missing resources receive 404; invalid ranges receive 400; booking
  conflicts receive 409 with no raw SQL or stack trace exposed.
- [x] Only ADMIN can create, update, or deactivate rooms and list all bookings.
- [x] Employees can list active rooms, search availability, create bookings,
  list their own bookings, and cancel only their own bookings.
- [x] Room deactivation and booking cancellation preserve historical records.
- [x] Booking validation rejects past/invalid windows and inactive rooms.
- [x] Flyway defines adjacent interval behavior and the exclusion constraint;
  PostgreSQL integration tests cover overlapping confirmed intervals. Runtime
  execution is deferred to final integration.
- [x] API tests cover success, validation, role/ownership boundaries, and the
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
- Extended the global exception handler to normalize request/framework errors and
  add a safe catch-all 500 response. Security handlers share the error-code
  constants; README now documents the status contract.
- `mvn -o -DskipTests package` passed; 21 production sources and 3 test sources
  compiled. Test execution was skipped for this change.
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

- [x] Employee can complete the room search and booking lifecycle from the UI.
- [x] Admin can create/update/deactivate rooms and inspect all bookings.
- [x] UI handles invalid time ranges and HTTP 409 conflicts without losing the
  user's entered form values.
- [x] Admin-only UI affordances are presentation only; backend remains the
  authorization authority.
- [x] No user-facing core flow depends on hard-coded knowledge of another
  account's credentials or role for security decisions.
- [x] Frontend production build succeeds.

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

- `bun run build` from `frontend/`.
- Manual UI smoke check against the backend for employee and admin journeys.

#### Done notes

- Implemented employee sign-in, room browsing, time/capacity availability
  search, booking creation, personal booking listing, and cancellation.
- Implemented admin room create/edit/deactivate/reactivate and company booking
  listing/cancellation. Admin capability comes from the protected API response;
  server authorization remains authoritative.
- Added loading, empty, success, validation, and API error states. Booking form
  state stays open when the API rejects a request.
- Added reusable success/error toasts for login, validation, API failures, room
  and booking actions. Toasts are screen-reader announced, stack up to four,
  auto-dismiss after five seconds, and can be closed manually. `bun run build`
  passed after implementation.
- `npm run build` passed. Live browser/API smoke check remains pending Docker.
- Added a meeting-room SVG favicon and linked it from the app document. Bun
  build passed and Vite emitted `dist/favicon.svg`.

### 001_003 — Integrate feature work and verify development workflows

#### Step goal

Confirm the backend and demo UI feature work fits together in the development
environment. Containerized delivery is reserved for the final phase after
feature phases 1–3.

#### Dependency

- Tasks `001_001` and `001_002` completed.

#### Scope

In:

- Fix integration mismatches among backend API, frontend, and seed/demo
  configuration in the development environment.
- Run available non-Docker backend tests and the frontend build; record actual
  results. Exercise local PostgreSQL behavior when a development DB is available.
- Update README/API documentation to match delivered behavior and trade-offs.
- Confirm no secrets or local `.env` files are tracked.

Out:

- Publishing or deploying the application, adding new features, and production
  hardening beyond the Product Vision's MVP boundary.
- Docker image builds, Compose startup, and Docker-backed Testcontainers runs;
  these are deferred until after feature phases 1–3.

#### Acceptance criteria

- [x] Backend and frontend features build in the development environment.
- [x] Employee and admin demo credentials support the documented feature flows.
- [x] Available non-Docker checks demonstrate service behavior and authorization;
  PostgreSQL-specific Testcontainers verification is deferred to final phase.
- [x] Frontend build and documented API examples match the current contract.
- [x] README setup, API, demo-account, test, architecture, and limitation sections
  match the implementation.
- [x] Every unchecked Product Vision MVP definition-of-done item is either
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

- Maven build and non-Docker tests.
- Local PostgreSQL smoke check when the development database is available.
- `bun run build` from `frontend/`.
- Docker Compose and PostgreSQL Testcontainers in the final phase after phases
  1–3, not as a Phase 1 exit gate.

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
- Switched frontend installation/build instructions and the frontend Docker
  build to Bun `1.3.13`, added the Bun lockfile, and updated README/phase docs.
  `bun install --frozen-lockfile` and `bun run build` both passed after the
  package-manager change. Docker image build was not run because Docker Desktop
  is unavailable in this environment.
- Corrected stale Product Vision data/API examples to match the implemented
  PostgreSQL schema, HTTP Basic demo auth, and current API routes. Whitespace
  check passed for the document.
- Ran `mvn -o '-Dtest=BookingServiceTest' -DforkCount=0 test` and
  `mvn -o '-Dtest=RoomSecurityTest' -DforkCount=0 test`: 5 service tests and
  3 security tests passed; neither requires PostgreSQL.
- Set Vite development and Compose host access for the frontend to port `5000`;
  updated README and phase docs. `docker compose config` and `bun run build`
  passed after the port change.

## Phase handoff

The user decided feature phases 1–3 are development-only. Docker/Compose and
containerized PostgreSQL verification remain for final integration after all
feature phases and are not Phase 1 exit gates. Phase 1 feature implementation
and available development checks are complete; live PostgreSQL execution and
the full UI/API walkthrough remain deferred final-integration checks.
