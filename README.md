# Meeting Room Booking System — DKI Coding Test

Backend REST API + optional React demo UI for an internal meeting-room reservation system (~10 rooms, ~200 employees).

## Mandatory assignment requirements (from DKI PDF)

- Java **17+**, **Spring Boot 3**, **PostgreSQL**.
- Docker: all components runnable using **`docker compose up`**.
- Room management, booking, calendar, available-room search APIs.
- Roles: ordinary employee and administrator.
- Preserve Git commit history and submit Git repository URL.
- README must document startup instructions, architecture, important decisions and reasons.
- Submission deadline: **4 days after receiving the assignment**.

These are from the PDF. The frontend, authentication scheme, API shapes and business rules below are **our design decisions**, not DKI-provided specifications.

## Quickstart

Prerequisites: Docker Desktop (Compose v2). From repository root:

```bash
docker compose up --build
```

- UI: http://localhost:3000
- API: http://localhost:5001/api/v1/rooms
- Swagger UI: http://localhost:5001/swagger-ui.html
- OpenAPI JSON: http://localhost:5001/v3/api-docs
- Health: http://localhost:5001/actuator/health

No manual database initialization required. Flyway creates tables, constraints and initial demo rooms. If port 3000 or 5001 is busy, change the host-side mapping in `docker-compose.yaml`.

Optional: copy the root `.env.example` to `.env` to customize the PostgreSQL credentials used by Docker Compose.

### Demo accounts (local evaluation only)

| Role | Username | Password |
| --- | --- | --- |
| EMPLOYEE | `employee@demo.local` | `Employee123!` |
| ADMIN | `admin@demo.local` | `Admin123!` |

**Security note:** HTTP Basic with in-memory demo accounts is an MVP tradeoff. It is **not suitable for production over plain HTTP**. Production must use HTTPS, an identity provider or persisted user store, rotated secrets and stronger operational controls. No user registration endpoint is included.

### API smoke test

```bash
curl -u employee@demo.local:Employee123! http://localhost:5001/api/v1/rooms
curl -u employee@demo.local:Employee123! 'http://localhost:5001/api/v1/rooms/available?startTime=2027-01-10T09:00:00Z&endTime=2027-01-10T10:00:00Z'
```

## Architecture

```text
React + TypeScript (port 3000) -> nginx reverse proxy /api -> Spring Boot (port 5001)
                                                         -> Spring Data JPA
                                                         -> PostgreSQL 16
                                                         -> Flyway migrations
```

The backend uses conventional Spring layers in `controller`, `service`, `repository`, `entity`, and `dto` packages, with `config` and `common` for cross-cutting concerns. Authentication is stateless Spring Security HTTP Basic. The frontend stores demo credentials only in browser session storage for a simple evaluation flow. No frontend business rule is trusted by the server.

## Business rules (team design decisions)

1. Only an authenticated user can access room/booking APIs.
2. Only ADMIN can create, edit, deactivate rooms; soft-deactivation retains historical booking references.
3. Rooms must be active to accept new reservations.
4. Every booking must have `startTime < endTime` and begin in the future.
5. Use ISO-8601 timestamps with offsets; PostgreSQL `TIMESTAMPTZ` persists instants.
6. A confirmed booking for the same room may **never** overlap another confirmed booking. Intervals are half-open `[start,end)`: adjacent bookings are permitted.
7. PostgreSQL GiST exclusion constraint over `tstzrange` is the **source of truth** under concurrent requests; conflicts return HTTP 409.
8. Only booking owner or ADMIN may cancel a booking; employees can cancel their own future bookings. Cancellation preserves history and releases its time slot.
9. Availability results include active rooms having no overlapping confirmed booking.
10. Rooms and booking history remain available to the appropriate authenticated roles; admin sees all bookings, employees view their own plus the shared calendar.

## API reference

The interactive API contract is available in [Swagger UI](http://localhost:5001/swagger-ui.html)
after starting the backend. Choose **Authorize** and enter one of the demo
accounts from the table above using HTTP Basic authentication. Use the employee
account for room browsing and booking, and the admin account for room mutations
or the company booking list. The docs page is public; each API still enforces
its server-side authentication and role rules.

Flyway migration `V1__init.sql` creates the `rooms` and `bookings` schema and
seeds four rooms (`Orchid`, `Lotus`, `Jasmine`, `Bamboo`). Demo identities are
in-memory Spring Security users rather than rows in a users table. JPA validates
the migrated schema at startup (`ddl-auto=validate`), so a schema mismatch stops
the backend before the API becomes available.

| Method | URL | Role | Function |
| --- | --- | --- | --- |
| GET | `/api/v1/rooms` | EMPLOYEE/ADMIN | List active rooms; ADMIN may pass `includeInactive=true` |
| GET | `/api/v1/rooms/{id}` | EMPLOYEE/ADMIN | Room details |
| POST | `/api/v1/rooms` | ADMIN | Add room |
| PUT | `/api/v1/rooms/{id}` | ADMIN | Edit room |
| DELETE | `/api/v1/rooms/{id}` | ADMIN | Deactivate room |
| GET | `/api/v1/rooms/available?startTime=...&endTime=...&minCapacity=...` | EMPLOYEE/ADMIN | Available rooms |
| POST | `/api/v1/bookings` | EMPLOYEE/ADMIN | Book a room |
| GET | `/api/v1/bookings/me` | EMPLOYEE/ADMIN | Own bookings |
| GET | `/api/v1/bookings` | ADMIN | All bookings |
| GET | `/api/v1/bookings/calendar?from=...&to=...` | EMPLOYEE/ADMIN | Calendar data |
| PATCH | `/api/v1/bookings/{id}/cancel` | Owner/ADMIN | Cancel booking |

Create booking JSON:

```json
{"roomId":1,"title":"Team planning","startTime":"2027-01-10T09:00:00Z","endTime":"2027-01-10T10:00:00Z"}
```

Errors use one JSON envelope with `timestamp`, `status`, `code`, `message`, and `path`.
Expected statuses: 400 invalid request/range, 401 unauthenticated, 403 forbidden,
404 missing resource, and 409 booking/uniqueness conflict or invalid state transition.

## Important design decisions and rationale

- **Modular monolith**: clear modules without distributed-system complexity for ~200 employees.
- **PostgreSQL GiST exclusion constraint**: guarantees no double booking even with concurrent writers; application-level pre-check alone is not sufficient.
- **Flyway**: version-controlled migrations and reproducible database setup.
- **Soft room deactivation**: keep referential integrity and history.
- **HTTP Basic demo auth**: rapid, inspectable role-based MVP; production requires stronger auth and TLS.
- **React UI as add-on**: easy end-to-end demonstration without affecting the backend-only grading contract.

## Development and verification

Backend local run defaults to PostgreSQL at `jdbc:postgresql://localhost:5432/meetingroom`
with user `postgres`; the local password default is `Password123`. Set
`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, and
`SPRING_DATASOURCE_PASSWORD` to override these values. Keep these demo defaults
local-only and change them for any shared or deployed environment.

Backend (requires local Maven + PostgreSQL configured):

```bash
cd backend
mvn test
mvn spring-boot:run
```

### Run or debug the backend in IntelliJ IDEA

Open the repository root as the IntelliJ project, then add/reload
`backend/pom.xml` as a Maven project. Select the shared
`MeetingRoomApplication` configuration from the Run Configuration menu and
press **Run** or **Debug**. The app uses the local PostgreSQL settings in
`backend/src/main/resources/application.properties` by default; make sure the
`meetingroom` database is available on `localhost:5432` first. The same
configuration works with any `SPRING_DATASOURCE_*` environment overrides.

Frontend (requires Node.js):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
npm run build
```

Set `VITE_API_BASE_URL` in `frontend/.env` when the API uses a different base URL. The default `/api/v1` goes through the Vite or nginx proxy.

### One-pass MVP walkthrough

Run `docker compose up --build`, then open http://localhost:3000.

1. Sign in as `employee@demo.local` / `Employee123!`, search for a future time
   range, book an available room, open **My bookings**, then cancel it.
2. Sign in as `admin@demo.local` / `Admin123!`, add a room, edit it, deactivate
   it, then edit it again and re-enable it. Open **Company bookings** to inspect
   reservations across users.
3. To check conflict handling, create one booking for a room and attempt an
   overlapping booking for that same room. The server returns a conflict and
   the form keeps the entered values. Adjacent time ranges remain allowed.

These accounts are local demo identities. The frontend detects admin capability
from the protected API response; authorization remains enforced by Spring Security.

### Automated checks

```bash
cd backend
mvn test
```

The PostgreSQL Testcontainers integration tests require a running Docker daemon.
They are skipped when Docker is unavailable, so a successful Maven exit alone
does not verify PostgreSQL migrations or concurrent overlap protection. The
frontend check is `npm run build` from `frontend/`.

Manual acceptance checks:

- [ ] `docker compose up --build` launches all 3 services.
- [ ] Employee can view rooms and available times, book, view own bookings and cancel.
- [ ] Admin can create/edit/deactivate rooms; regular users get 403 on admin endpoints.
- [ ] Two overlapping requests for the same room cannot both commit; second gets 409.
- [ ] Back-to-back time slots (`10:00–11:00`, `11:00–12:00`) are permitted.
- [ ] Canceled booking no longer blocks its original slot.
- [ ] Calendar and availability return correct results.

The current verification status is recorded in `.okf/phase/001/PHASE_SUMMARY.md`.

## Submission

Push this monorepo to GitHub, preserve incremental commit history, and paste the repository URL in your submission. Remove demo passwords and replace authentication before any real-company deployment.
