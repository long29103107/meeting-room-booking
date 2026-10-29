# Task: Start the stack from published container images

## Vision alignment

- Product goal: Keep the complete application runnable through Docker Compose.
- User-facing or developer-facing outcome: Compose pulls CI-published frontend
  and backend images from GHCR and starts them with PostgreSQL.
- Explicitly out of scope: Building/publishing images, changing CI, or local
  development hot reload.

## Scope

In:

- Remove application build contexts from Compose and configure registry pulls.
- Align README startup instructions with the pull-and-start workflow.

Out:

- Changing image names/tags or GitHub Actions behavior.

## Acceptance criteria

- [x] Compose has no local build contexts for the application services.
- [x] Compose is configured to pull the configured images when started.
- [x] README describes the pull-only startup flow.

## Affected areas

- API/UI: None.
- Data/migration: None.
- Modules/files: `docker-compose.yaml`, `README.md`.

## Dependencies and open questions

- CI-published GHCR images must exist and be accessible to the Docker client.

## Verification

- `docker compose config`.

## Done notes

- Implementation:
  Removed local build contexts and configured all three images to pull on
  startup. README now documents `docker compose up -d`.
- Checks run and results: `docker compose config -q` passed; config lists three
  expected images and contains no build sections.
