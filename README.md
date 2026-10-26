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
- API: http://localhost:8080/api/rooms
- Health: http://localhost:8080/actuator/health

No manual database initialization required. Flyway creates tables, constraints and initial demo rooms. If port 3000 or 8080 is busy, change the host-side mapping in `compose.yaml`.

### Demo accounts (local evaluation only)

| Role | Username | Password |
| --- | --- | --- |
| USER | `employee@demo.local` | `Employee123!` |
| ADMIN | `admin@demo.local` | `Admin123!` |

**Security note:** HTTP Basic with in-memory demo accounts is an MVP tradeoff. It is **not suitable for production over plain HTTP**. Production must use HTTPS, an identity provider or persisted user store, rotated secrets and stronger operational controls. No user registration endpoint is included.

### API smoke test

```bash
curl -u employee@demo.local:Employee123! http://localhost:8080/api/rooms
curl -u employee@demo.local:Employee123! 'http://localhost:8080/api/rooms/available?start=2027-01-10T09:00:00Z&end=2027-01-10T10:00:00Z'
```

## Architecture

```text
React + TypeScript (port 3000) -> nginx reverse proxy /api -> Spring Boot (port 8080)
                                                         -> Spring Data JPA
                                                         -> PostgreSQL 16
                                                         -> Flyway migrations
```

Feature-first modules: `room`, `booking`, `config`, `common`. Stateless authentication via Spring Security HTTP Basic. Frontend stores demo credentials only in browser session storage for a simple evaluation flow. No frontend business rule is trusted by the server.

## Business rules (team design decisions)

1. Only an authenticated user can access room/booking APIs.
2. Only ADMIN can create, edit, deactivate rooms; soft-deactivation retains historical booking references.
3. Rooms must be active to accept new reservations.
4. Every booking must have `startTime < endTime` and begin in the future.
5. Use ISO-8601 timestamps with offsets; PostgreSQL `TIMESTAMPTZ` persists instants.
6. A confirmed booking for the same room may **never** overlap another confirmed booking. Intervals are half-open `[start,end)`: adjacent bookings are permitted.
7. PostgreSQL GiST exclusion constraint over `tstzrange` is the **source of truth** under concurrent requests; conflicts return HTTP 409.
8. Only booking owner or ADMIN may cancel a booking. Cancellation preserves audit history and releases its time slot.
9. Availability results include active rooms having no overlapping confirmed booking.
10. Rooms and booking history remain available to the appropriate authenticated roles; admin sees all bookings, employees view their own plus the shared calendar.

## API reference

| Method | URL | Role | Function |
| --- | --- | --- | --- |
| GET | `/api/rooms` | USER/ADMIN | List rooms |
| POST | `/api/rooms` | ADMIN | Add room |
| PUT | `/api/rooms/{id}` | ADMIN | Edit room |
| DELETE | `/api/rooms/{id}` | ADMIN | Deactivate room |
| GET | `/api/rooms/available?start=...&end=...&minCapacity=...` | USER/ADMIN | Available rooms |
| POST | `/api/bookings` | USER/ADMIN | Book a room |
| GET | `/api/bookings/my` | USER/ADMIN | Own bookings |
| GET | `/api/bookings` | ADMIN | All bookings |
| GET | `/api/bookings/calendar?start=...&end=...` | USER/ADMIN | Calendar data |
| PATCH | `/api/bookings/{id}/cancel` | Owner/ADMIN | Cancel booking |

Create booking JSON:

```json
{"roomId":1,"title":"Team planning","startTime":"2027-01-10T09:00:00Z","endTime":"2027-01-10T10:00:00Z"}
```

Expected errors: 400 invalid request/range, 401 unauthenticated, 403 forbidden, 404 missing resource, 409 conflict or already canceled.

## Important design decisions and rationale

- **Modular monolith**: clear modules without distributed-system complexity for ~200 employees.
- **PostgreSQL GiST exclusion constraint**: guarantees no double booking even with concurrent writers; application-level pre-check alone is not sufficient.
- **Flyway**: version-controlled migrations and reproducible database setup.
- **Soft room deactivation**: keep referential integrity and history.
- **HTTP Basic demo auth**: rapid, inspectable role-based MVP; production requires stronger auth and TLS.
- **React UI as add-on**: easy end-to-end demonstration without affecting the backend-only grading contract.

## Development and verification

Backend (requires local Maven + PostgreSQL configured):

```bash
cd backend
mvn test
mvn spring-boot:run
```

Frontend (requires Node.js):

```bash
cd frontend
npm install
npm run dev
npm run build
```

Manual acceptance checks:

- [ ] `docker compose up --build` launches all 3 services.
- [ ] Employee can view rooms and available times, book, view own bookings and cancel.
- [ ] Admin can create/edit/deactivate rooms; regular users get 403 on admin endpoints.
- [ ] Two overlapping requests for the same room cannot both commit; second gets 409.
- [ ] Back-to-back time slots (`10:00–11:00`, `11:00–12:00`) are permitted.
- [ ] Canceled booking no longer blocks its original slot.
- [ ] Calendar and availability return correct results.

**Current status:** starter implementation; commands and acceptance checks are **not claimed as passed** in this environment (Docker/Maven unavailable). Before submitting, execute and record test results, add more automated coverage (especially concurrency integration tests), and check the repository's actual commit history.

## Submission

Push this monorepo to GitHub, preserve incremental commit history, and paste the repository URL in your submission. Remove demo passwords and replace authentication before any real-company deployment.
