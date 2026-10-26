# Phase 001 — Core MVP Completion

## Vision alignment and outcome

Complete the Core MVP from `PRODUCT_VISION.md`: an employee can discover and
book rooms, manage their reservations, and an administrator can manage rooms
and inspect company bookings. A reviewer can start the full stack with Docker
Compose and exercise the API and UI.

## Scope

In scope: finish the existing backend/API contracts, implement essential React
employee and administrator workflows, align configuration and README, and run
frontend/backend/PostgreSQL integration checks where the environment permits.

Out of scope: SSO, production identity storage, recurring meetings, approval
flows, notifications, and production deployment.

## Accepted contracts

- Backend remains a conventional Spring Boot MVC/service/repository/entity/DTO
  application using PostgreSQL and Flyway.
- `/api/v1` is the API base. `EMPLOYEE` and `ADMIN` roles, server-side ownership
  and authorization, and standardized error responses remain authoritative.
- Booking intervals are offset-aware, future-only, and half-open `[start,end)`.
  PostgreSQL's exclusion constraint is the final overlap guard.
- The React UI uses the existing Basic-auth demo accounts and discovers admin
  capability by checking the protected admin API; the client never grants access.
- Backend settings live in `application.properties`; frontend API URL is a
  non-secret Vite `VITE_API_BASE_URL` setting in `frontend/.env`.
- API interface is published through Swagger UI/OpenAPI; API requests require
  HTTP Basic credentials, while the documentation page itself is public.
- Flyway owns initial schema and sample room seed data. Demo users remain
  in-memory identities; there is no public data-reset/seed endpoint.

## Acceptance criteria

- Employee can sign in, browse/search rooms, create a booking, view own bookings,
  and cancel their own future booking.
- Admin can create, edit, deactivate/reactivate rooms, and view/cancel company
  bookings; server permissions remain enforced.
- Invalid booking ranges and API 4xx/409 results are visible without losing the
  values entered in the booking form.
- Frontend production build and backend automated tests pass.
- Compose configuration resolves from the repository root; when Docker is
  available, all services start, Flyway initializes PostgreSQL, and the
  documented employee/admin smoke flows succeed.
- Swagger UI renders the current API contract and can call protected endpoints
  after applying the appropriate demo Basic Auth credentials.
- README and phase summary reflect actual implementation and verification.

## Verification

- `mvn test` and `mvn package` in `backend/`.
- `npm run build` in `frontend/`.
- `docker compose config` and, when Docker daemon is available,
  `docker compose up --build` plus API/UI smoke checks.
- PostgreSQL-specific overlap and concurrency guarantees require the existing
  Testcontainers suite to execute against PostgreSQL; skipped tests are not
  considered verified.
