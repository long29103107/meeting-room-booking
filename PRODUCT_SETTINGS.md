# Product Setup and Release Checklist

## Agent instructions

When a request is limited to setting up or starting this product, use this file
as the setup runbook. Start the published Compose stack; do not change product
code, build application images locally, reset the database volume, or push to
GitHub unless the user separately asks for that work.

For feature implementation, `PRODUCT_VISION.md` and `AGENTS.md` remain the
sources of truth for scope and repository workflow.

## Start the published stack

Prerequisites: Docker Desktop with Docker Compose v2, network access to GHCR,
and public access (or an authenticated Docker session) for the two application
packages.

From the repository root:

```bash
docker compose up -d
docker compose ps
```

All services use registry images. Compose is configured with
`pull_policy: always`, so startup pulls the current images before starting:

- Frontend: `ghcr.io/long29103107/meeting-room-booking-frontend:latest`
- Backend: `ghcr.io/long29103107/meeting-room-booking-backend:latest`
- Database: `postgres:16-alpine`

The local endpoints are:

- Frontend: <http://localhost:5000>
- Backend health: <http://localhost:5001/actuator/health>
- Swagger UI: <http://localhost:5001/swagger-ui.html>

Check startup logs when a service is not ready:

```bash
docker compose logs --tail 100 postgres backend frontend
```

Stop the stack while preserving database data:

```bash
docker compose down
```

Do not use `docker compose down -v` for routine setup; it removes the persistent
PostgreSQL volume and all data in it. Use it only when the user explicitly wants
a fresh database and accepts deleting local data.

## Update released images

GitHub Actions in `.github/workflows/publish-images.yml` builds both application
images on pull requests and publishes them on pushes to `main` or `v*` tags.
After a release, run `docker compose up -d` to pull and start the latest images.
If a GHCR pull is denied, check package visibility or authenticate with Docker;
do not change the image names or build local substitutes as part of a setup-only
request.

Flyway applies database migrations when the backend starts. In particular,
`V2__seed_demo_schedule.sql` adds six rooms and up to 70 non-conflicting future
bookings for the demo accounts. It runs once per database and preserves existing
data. Ensure the backend image was published from a revision containing that
migration before expecting the seed data in the running stack.

## Coding-test completion checklist

- [ ] Commit and push the intended source changes while preserving the existing
  Git history; the workflow publishes images from `main` and `v*` tags.
- [ ] Confirm the GitHub Actions image workflow succeeds for frontend and backend.
- [ ] Confirm the GHCR packages are public, or document that consumers need GHCR
  authentication.
- [ ] Pull and start the released stack with `docker compose up -d`; verify all
  three services and the backend health endpoint.
- [ ] Run backend tests from `backend/` with Docker available so PostgreSQL
  Testcontainers checks can execute, and run `bun run build` from `frontend/`.
- [ ] Sign in as both demo accounts and complete the employee/admin walkthrough
  in `README.md`, including booking overlap behavior and room administration.
- [ ] Submit the Git repository URL and ensure `README.md` contains the startup,
  architecture, and key design decisions.

## Setup-only handoff

For a request such as “just set it up” or “start the app,” follow **Start the
published stack** and report the service status and endpoints. Treat release,
source changes, database resets, and submission steps as separate work unless
the user explicitly includes them.
