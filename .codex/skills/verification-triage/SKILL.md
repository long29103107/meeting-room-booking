---
name: verification-triage
description: Classify Maven, frontend, Docker Compose, migration, or CI verification failures before deciding whether to rerun, fix code, or report an environment blocker. Use when a check fails or its output needs triage.
---

# Verification Triage

Use the actual failing command and first meaningful error to choose the smallest
trustworthy next action.

## Workflow

1. Read the exact command and relevant error output, not just the exit code.
2. Classify the failure as environment/dependency restore, permission, transient
   process/lock, non-blocking warning, docs-only no-run, or likely regression.
3. Choose one action: retry only for a transient issue; request required access
   for a permission/network blocker; patch only when evidence points to a code or
   configuration regression; skip heavy checks for docs-only changes.
4. Report the classification and exact next action briefly.

## Project guidance

- Backend: use Maven commands in `backend/` (for example `mvn test` or
  `mvn package`) when relevant.
- Frontend: use `npm run build` in `frontend/` when relevant.
- Compose: use `docker compose config` or a focused Compose smoke check for
  deployment/config changes when Docker is available.
- PostgreSQL-specific migration and overlap behavior cannot be established by
  an unrelated in-memory database check.
- Do not claim a check passed unless it completed successfully.
- For documentation-only edits, read back the changed files; do not run the full
  application build unless commands, executable scripts, or build metadata changed.
