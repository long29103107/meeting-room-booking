# PRODUCT_VISION — Meeting Room Booking System

> Project: `meeting-room-booking`  
> Coding Test: Backend Developer — DKI  
> Target: Shippable MVP in one focused evening; production-minded design  
> Document status: Implementation baseline (update decisions as code evolves)

## 1. Product vision

Build a reliable, simple internal meeting-room reservation backend for a company with about **200 employees and 10 meeting rooms**. Replace informal chat-based reservation with a central source of truth that prevents double booking and lets employees find available rooms quickly.

**Primary promise:** For a given room and overlapping time interval, the system will never confirm two active reservations, even under concurrent API requests.

### Goals

1. Employees can discover rooms, check availability, book, view and cancel their reservations.
2. Administrators can manage meeting rooms and inspect company bookings.
3. The system enforces access control, validates input, communicates errors clearly, and remains correct under concurrency.
4. A reviewer can start the complete application with `docker compose up --build`, explore API docs and run tests using the README.

### Explicit non-goals for this coding test

- Mobile app, notifications (email/SMS), approval chains, recurring bookings, calendar integrations.
- Microservices, message queues, Redis, Kubernetes, distributed locks.
- Enterprise SSO, complex permission matrix, analytics dashboards.

## UI demo addendum

A React + Vite + TypeScript UI is included as an optional demonstration of the backend. DKI only mandates REST APIs; all essential business rules must remain enforced on the server. A single Docker Compose command launches frontend, backend and PostgreSQL.

The demo UI hides bookings for inactive rooms from **My bookings** and the
shared **Room calendar**, and omits inactive rooms from the calendar filter.
Deactivation still preserves booking records; administrators can inspect them
in **Company bookings**.

## 2. Stack and bootstrapping

| Area | Decision |
| --- | --- |
| Java | **21 LTS** (fulfills Java 17+) |
| Framework | **Spring Boot 3.x**, select a stable version compatible with Java 21 |
| Build | Maven |
| API | REST + JSON; OpenAPI/Swagger via compatible springdoc-openapi |
| Persistence | PostgreSQL 16 + Spring Data JPA/Hibernate |
| DB migrations | Flyway, SQL migrations checked into Git |
| Security | Spring Security; JWT bearer token if time allows, otherwise still deliver enforceable demo authentication with documented test accounts |
| Validation | Jakarta Bean Validation |
| Tests | JUnit 5, Spring Boot Test; Testcontainers PostgreSQL for DB-specific overlap/concurrency tests |
| Runtime | Dockerfile + Compose; app and PostgreSQL start together |
| Design | Conventional Spring layered architecture inside a modular monolith |

Spring Initializr metadata:

```text
Project: Maven
Language: Java
Spring Boot: 3.x stable
Group: com.dki
Artifact: meeting-room-booking
Name: meeting-room-booking
Package: com.dki.meetingroom
Packaging: Jar
Java: 21
```

Initializr dependencies:

- Spring Web
- Spring Data JPA
- PostgreSQL Driver
- Spring Security
- Validation
- Flyway Migration
- Lombok (optional)
- Spring Boot Actuator (optional)
- Spring Boot Starter Test

Add the **PostgreSQL Flyway database support module** if required by the chosen Flyway version; add Swagger and JWT libraries with versions compatible with the selected Spring Boot version. Do not assume dependency versions without verifying build resolution.

## 3. Actors and permissions

| Action | EMPLOYEE | ADMIN |
| --- | :---: | :---: |
| Log in | Yes | Yes |
| View active rooms / their details | Yes | Yes |
| Find available rooms | Yes | Yes |
| View room calendar | Yes | Yes |
| Create booking | Yes | Yes |
| View own bookings | Yes | Yes |
| Cancel own future booking | Yes | Yes |
| Create/update/deactivate room | No | Yes |
| View all company bookings | No | Yes |
| Cancel another user's booking | No | Yes |

Use roles `EMPLOYEE`, `ADMIN` consistently. Avoid exposing password hashes or internal security data in API responses.

## 4. Main user journeys

### Employee reservation flow

1. User sends HTTP Basic credentials for a configured demo account.
2. User lists rooms, optionally filtering by capacity.
3. User queries availability with `startTime`, `endTime`, and optional `minCapacity`.
4. User selects room and sends a booking request.
5. Server validates time window, room status, and current permissions.
6. PostgreSQL guarantees no overlapping active reservations; on a conflict, return HTTP **409 Conflict**.
7. User sees booking in their list and in the room's schedule.

### Admin management flow

1. Admin creates or edits rooms (name, capacity, location, active status).
2. Admin sees reservations across rooms, filtered by time window.
3. Admin may deactivate a room (keeps booking history) and cancel reservations as policy permits.

## 5. Booking business rules

### Time semantics

- API timestamps are ISO-8601 offset-aware values, e.g. `2026-10-26T09:00:00+07:00` or UTC `Z`.
- Store absolute instants as PostgreSQL `timestamptz`. Treat time intervals as **half-open** `[start_time, end_time)`.
- Require `endTime > startTime`; reject zero/negative intervals.
- No bookings in the past. For MVP, require `startTime > now`; reject invalid range with HTTP 400.
- Adjacent reservations are allowed: 09:00–10:00 and 10:00–11:00 do not conflict.
- Overlap exists when `existing.start < requested.end AND existing.end > requested.start`.
- Optional maximum duration and booking horizon can be added later; do not invent restrictions without documenting them.

### Room and booking lifecycle

- A room requires unique nonblank name and positive capacity.
- Deactivated rooms cannot receive new bookings; existing history is preserved.
- Booking statuses: `CONFIRMED`, `CANCELLED`. Cancellation is a state transition, not hard deletion.
- A normal employee can cancel only their own booking. Admin can cancel any booking.
- Prevent cancellations from silently erasing audit history; preserve creation timestamp and owner.
- In case of app-level race between checking availability and creating booking, rely on the **database exclusion constraint** as the final correctness guarantee.

## 6. Data model

### Demo user identities

- Demo users are configured in Spring Security's in-memory user store; there is
  no `users` table or user persistence in this MVP.
- Demo passwords are encoded with BCrypt at application startup.
- Bookings store the authenticated user's email in `user_email` so booking
  ownership and history remain available without a users-table foreign key.

### `rooms`

- `id` BIGSERIAL primary key
- `name` VARCHAR(120) unique, not null
- `capacity` INTEGER not null, > 0
- `location` VARCHAR(160) not null
- `active` BOOLEAN not null default true

### `bookings`

- `id` BIGSERIAL primary key
- `room_id` BIGINT not null references rooms
- `user_email` VARCHAR(200) not null; identifies the in-memory authenticated user
- `start_time` TIMESTAMPTZ not null
- `end_time` TIMESTAMPTZ not null
- `title` VARCHAR(200) not null
- `status` VARCHAR(16) not null (`CONFIRMED`, `CANCELLED`)
- `created_at` TIMESTAMPTZ not null
- DB check: `end_time > start_time`

### Critical invariant: PostgreSQL overlap protection

Use a Flyway SQL migration similar to the following (adapt types/names to the actual schema):

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
  ADD CONSTRAINT booking_valid_interval
  CHECK (end_time > start_time);

ALTER TABLE bookings
  ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    room_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
  )
  WHERE (status = 'CONFIRMED');
```

Why: A SELECT-before-INSERT check alone is subject to a race. The exclusion constraint makes the invariant atomic at the database. Map PostgreSQL exclusion violations (SQLSTATE `23P01`) to **409 Conflict**, without leaking raw SQL/stack traces. A separate database integration test must attempt simultaneous overlapping inserts and assert only one is confirmed.

**Caveat:** The availability query is advisory; availability may change between search and reservation. Database write remains authoritative.

## 7. REST API contract (v1)

Base path: `/api/v1`. The MVP uses stateless HTTP Basic authentication with the
documented in-memory demo accounts; there is no `/auth/login` endpoint or bearer
token flow. Prefer consistent JSON error shape and sensible pagination/filtering.

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/rooms` | Auth | List active rooms; admin may include inactive |
| GET | `/rooms/{id}` | Auth | Room details |
| POST | `/rooms` | ADMIN | Create room |
| PUT | `/rooms/{id}` | ADMIN | Update room |
| DELETE | `/rooms/{id}` | ADMIN | Soft deactivate room |
| GET | `/rooms/available?startTime=...&endTime=...&minCapacity=...` | Auth | Search rooms with no confirmed overlapping bookings |
| POST | `/bookings` | Auth | Create reservation |
| GET | `/bookings/me` | Auth | List my reservations |
| GET | `/bookings` | ADMIN | List all company bookings |
| GET | `/bookings/me/page?page=0&size=10` | Auth | Get a page of my bookings, optionally filtered by `query` and `status` |
| GET | `/bookings/page?page=0&size=10` | ADMIN | Get a page of company bookings, optionally filtered by `query` and `status` |
| GET | `/bookings/calendar?from=...&to=...` | Auth | Confirmed bookings in a time window |
| PATCH | `/bookings/{id}/cancel` | Owner/ADMIN | Cancel reservation |

### Example: create booking

```http
POST /api/v1/bookings
Authorization: Basic <base64(username:password)>
Content-Type: application/json

{
  "roomId": 1,
  "title": "Sprint planning",
  "startTime": "2026-10-27T09:00:00+07:00",
  "endTime": "2026-10-27T10:00:00+07:00"
}
```

Successful response: `201 Created`, with booking ID, owner, room, status and time range. Conflicting slot: `409 Conflict`.

### Standardized errors

```json
{
  "timestamp": "2026-10-26T08:00:00Z",
  "status": 409,
  "code": "BOOKING_TIME_CONFLICT",
  "message": "The room is already booked for the requested time range.",
  "path": "/api/v1/bookings"
}
```

Suggested HTTP conventions: 400 invalid input, 401 unauthenticated, 403 forbidden, 404 missing resource, 409 booking or uniqueness conflict, 500 unexpected error.

The paginated booking-list endpoints use zero-based `page`, `size` from 1 to 100,
optional text `query`, and optional `status` (`CONFIRMED` or `CANCELLED`). They
return `content`, `page`, `size`, `totalElements`, and `totalPages`; the legacy
array endpoints remain available for existing callers.

## 8. Code organization

Use the conventional Spring Boot layered architecture: REST controllers handle
HTTP, services hold business rules and transactions, Spring Data repositories
access persistence, entities model database data, and DTOs define API data. Use
separate `controller`, `service`, `repository`, `entity`, and `dto` packages.
Keep `common` and `config` for cross-cutting concerns. Do not add Clean
Architecture, Hexagonal Architecture, CQRS, or microservice-style layers for
this MVP.

```text
src/main/java/com/dki/meetingroom/
├── MeetingRoomApplication.java
├── controller/{RoomController,BookingController}.java
├── service/{RoomService,BookingService}.java
├── repository/{RoomRepository,BookingRepository}.java
├── entity/{Room,Booking}.java
├── dto/{room,booking}/
├── common/
└── config/
src/main/resources/
├── application.properties
└── db/migration/
    ├── V1__init_schema.sql
    └── V2__booking_constraints.sql
src/test/java/com/dki/meetingroom/
Dockerfile
compose.yaml
.env.example
README.md
PRODUCT_VISION.md
```

Design principles:

- Controllers validate transport inputs and delegate to services.
- Services own transactions and authorization/booking rules.
- Repositories contain database access; use focused queries to find available rooms.
- DTOs isolate API contract from JPA entities.
- Migrations own schema; prefer `spring.jpa.hibernate.ddl-auto=validate` over automatic schema changes.
- Use UTC inside persistence and compare instants, not local-clock strings.

## 9. Docker and configuration requirements

The exact command required by the assignment is **`docker compose up`** (not just app-only run). Commit a Dockerfile and Compose configuration allowing a reviewer to boot both application and PostgreSQL.

Acceptance:

- `docker compose up --build` works from repository root; a subsequent `docker compose up` also works.
- PostgreSQL has a named volume for local persistence, and a healthcheck.
- Backend waits for a healthy database / retries safely during startup.
- No external dependencies (such as local PostgreSQL or Java installation) are required for Compose startup beyond Docker.
- GitHub Actions builds the frontend and backend Dockerfiles on pull requests
  and publishes their images to GHCR on pushes to `main` and version tags. The
  Compose file keeps local build contexts and names the matching GHCR images;
  PostgreSQL continues to use the official `postgres:16-alpine` image.
- GHCR package visibility follows the linked repository by default. For
  anonymous public pulls, the repository or both container packages must be
  public in GitHub Packages settings.
- App port `5001`, PostgreSQL internal port `5432`; publishing DB to host is optional.
- Use environment variables for secrets, database settings and token config; commit `.env.example` only, **never** a real `.env`.
- Flyway migrations execute on app startup; JPA schema validation passes.
- Document default demo accounts and secure development-only passwords in README; never ship production secrets as defaults.
- Provide `/actuator/health` if Actuator is used, without exposing privileged endpoints publicly.

## 10. Security MVP

- Demo passwords are encoded with BCrypt and demo identities are stored in
  Spring Security's in-memory user store; this MVP has no persistent users table.
- Authenticate using Spring Security; issue short-lived JWT if implementation time permits.
- Authorize admin-only endpoints at server side and enforce booking ownership checks.
- Never trust `userId` passed by clients for ownership: derive authenticated user identity from the security context.
- Keep seeded credentials for local demo/test only and clearly marked as non-production.
- For JWT implementation, verify signature, expiration and expected algorithm; keep signing secret outside Git.

**If time constrained:** Complete working authentication/authorization and booking correctness first. JWT is an implementation choice, not a requirement explicitly named by DKI; do not break a functional MVP chasing a custom token implementation.

## 11. Testing strategy

### Minimum high-value tests

1. Valid booking succeeds and is visible in calendar.
2. Same-room overlapping booking returns 409.
3. Adjacent bookings succeed.
4. Same time in different rooms succeeds.
5. Cancelled booking frees the time slot.
6. Past/invalid time windows return 400.
7. Inactive room cannot be booked.
8. EMPLOYEE cannot create/edit/deactivate rooms.
9. EMPLOYEE cannot cancel another person's booking.
10. Concurrent overlapping booking requests yield **exactly one** success and one conflict.

Use a real PostgreSQL container for #10 and DB constraint behavior. H2 is not a faithful replacement for PostgreSQL range types and exclusion constraints.

## 12. Tonight's execution plan (MVP-first)

The deadline in the assignment is **four days after receiving it**, not necessarily four days from the document creation date. Tonight is an aggressive self-imposed implementation target.

| Block | Deliverable | Exit condition |
| --- | --- | --- |
| 1 — Foundation | Spring Initializr, Git, Dockerfile, Compose, PostgreSQL, Flyway | Docker boots app; DB migrations pass |
| 2 — Data/Rooms | Entities, repositories, Room DTO/controller/service | CRUD works; admin restrictions wired |
| 3 — Booking core | Create/cancel/list/calendar/search availability | Overlap prevention guaranteed by PostgreSQL |
| 4 — Auth/validation | Basic authenticated users, roles, global errors | Access restrictions and 409 behavior correct |
| 5 — Proof & delivery | Seed data, core tests, README, Swagger if time | Fresh clone + `docker compose up` works |

### Critical path / scope cut rules

- **P0 — must ship:** Compose startup, migrations, rooms, bookings, calendar, free-room search, user/admin authorization, no double-booking, README, Git history.
- **P1 — strongly recommended:** Unit/integration tests for overlap and authorization, OpenAPI, seed data, clear error handling.
- **P2 — only if stable:** Pagination polish, additional filters, JWT refresh tokens, extended audit data, performance tuning.
- Do not spend the evening on frontend, microservices, styling, event buses, caching, or recurring meetings.
- Make small, meaningful commits throughout; do not squash away history because the assignment asks to preserve it.

### Suggested commit sequence

```text
chore: bootstrap Spring Boot service and docker compose
feat: add flyway schema and room management
feat: implement booking lifecycle and availability search
fix: enforce non-overlapping bookings in postgres
feat: secure endpoints and validate requests
test: cover booking overlap and role permissions
docs: add setup instructions and architecture decisions
```

## 13. Definition of done

- [ ] `docker compose up` starts API + database on a fresh checkout.
- [ ] Flyway applies all migrations without manual SQL.
- [ ] Demo authentication works; EMPLOYEE and ADMIN are enforced.
- [ ] Admin can create/update/deactivate rooms.
- [ ] Employee can list rooms, check free rooms, book, view schedules and cancel own reservations.
- [ ] Invalid requests get useful 4xx responses.
- [ ] Overlapping confirmed bookings cannot coexist in PostgreSQL.
- [ ] Concurrent write test demonstrates one winner, one conflict.
- [ ] README includes prerequisites, run instructions, demo users, API examples, tests, architecture and trade-offs.
- [ ] Source is pushed to a Git repository with clear commit history.
- [ ] No secrets or local `.env` file are committed.

## 14. README content checklist

The repository README should include:

1. Problem summary and product scope.
2. Why modular monolith + PostgreSQL exclusion constraint.
3. Prerequisite Docker / Compose and how to execute `docker compose up`.
4. API base URL, Swagger URL (if available), sample credentials and curl requests.
5. Entity relationship summary and important booking semantics.
6. How to run tests and explain concurrent-booking test.
7. Design trade-offs and known limitations.
8. Optional: screenshots of successful `docker compose up` and API calls.

## 15. Reviewer's top questions and planned answers

**Why not just check if a room is available before INSERT?**  
Because two requests can pass the same check concurrently. PostgreSQL's exclusion constraint is the final source of truth.

**Why not use microservices?**  
Approximately 200 employees and 10 rooms: a modular monolith offers simpler deployment and transaction boundaries without meaningful scale sacrifice.

**How is timezone correctness handled?**  
Clients send offset-aware timestamps, data is stored in `timestamptz`, intervals use `[start,end)` semantics.

**What happens if the room becomes unavailable between search and booking?**  
The reservation can fail with HTTP 409. Search is informational; successful creation is authoritative.

**How do you avoid losing reservation history?**  
Bookings are cancelled by status, and rooms are deactivated rather than physically removed.

---

**Implementation rule:** Keep this document aligned with shipped behavior. A smaller correct system beats ambitious endpoints that are documented but not actually implemented.
