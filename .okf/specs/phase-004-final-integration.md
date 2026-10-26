# Phase 004 — Final Integration and Delivery

## Status

In progress

## Vision alignment

- Product goal: A reviewer can start the API, UI, and PostgreSQL with the
  documented Compose command and verify the booking MVP.
- User outcome: The whole application starts reproducibly, migrations apply,
  security/API flows work, and PostgreSQL prevents overlapping bookings.
- Explicitly out of scope: New product features, production deployment, and
  production identity/security hardening.

## Problem and actors

- Problem: Phase 1 and 2 feature checks pass in development, but containerized
  startup and PostgreSQL-specific behavior have not been exercised end to end.
- Primary actors: Coding-test reviewer and local developer.

## User flow

1. Run `docker compose up --build` from the repository root.
2. Wait for PostgreSQL health and backend startup/migrations.
3. Open the UI and Swagger, authenticate with demo accounts, and exercise the
   employee and administrator flows.
4. Run the PostgreSQL Testcontainers suite, including concurrent overlap tests.

## Requirements and business rules

- Compose uses PostgreSQL 16 with persistent named volume and healthcheck.
- Backend waits for a healthy database and applies Flyway migrations on startup.
- Backend is available on port 5001; frontend is available on port 5000.
- Booking overlap remains enforced by PostgreSQL's exclusion constraint.
- No real secrets or populated local `.env` files are committed.

## Acceptance criteria

- [x] `docker compose config` resolves from repository root.
- [x] Non-Docker backend tests and frontend production build pass.
- [ ] `docker compose up --build` starts PostgreSQL, backend, and frontend.
- [ ] Flyway and JPA schema validation pass against PostgreSQL.
- [ ] Employee/admin API and UI smoke flows pass against the running stack.
- [ ] PostgreSQL overlap and concurrent-write integration tests execute and pass.
- [ ] README and Product Vision verification status reflect the actual results.

## API and data impact

- API changes: None planned.
- Persistence/migration changes: None planned; verify the current Flyway schema.
- Compatibility/error behavior: Keep the documented API v1 error and status
  contracts.

## Security and validation

- Authentication/authorization: Verify the demo Basic Auth and Employee/Admin
  server-side boundaries using existing accounts.
- Validation and boundary cases: Verify invalid windows, overlaps, adjacent
  windows, cancellation, and room deactivation against PostgreSQL.

## Open questions and assumptions

- Open questions: Docker Desktop reports `running`, but its engine API currently
  responds with HTTP 500 through both configured Windows named-pipe contexts.
- Explicit assumptions: Feature phases 001–003 are complete before the final
  integration checks are considered complete.

## Scope

In:

- Validate Compose configuration and run containerized builds/startup.
- Execute PostgreSQL-backed tests and API/UI smoke flows when Docker is usable.
- Record exact checks and remaining environment limitations.

Out:

- Feature work, new migrations, publishing/deployment, and external service
  configuration.

## Dependencies and risks

- Requires a functioning Docker Desktop Linux engine and access to pull base
  images if they are not cached.
- Docker engine failure prevents Compose startup and Testcontainers execution.

## Verification

- Automated: `docker compose config`, Maven test suite, frontend build.
- Manual/integration: Compose startup, health, migrations, Swagger/API auth,
  employee/admin UI flows, and overlapping/concurrent PostgreSQL bookings.
