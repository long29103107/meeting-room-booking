# Task: Install Linux native frontend build dependencies in Docker

## Vision alignment

- Product goal: Keep the documented Docker Compose build reproducible.
- User-facing or developer-facing outcome: The Alpine frontend build stage has
  the Linux Rollup and esbuild binaries required by Vite.
- Explicitly out of scope: Changing frontend runtime behavior or the local Bun
  dependency contract.

## Scope

In:

- Install Alpine/musl native packages matching the versions pinned in `bun.lock`.
- Keep the committed lockfile and package manifest unchanged during the image build.

Out:

- Changing the frontend base/runtime image or adding application dependencies.

## Acceptance criteria

- [x] Dockerfile adds an install step for Alpine native packages for amd64 and
  arm64, using versions already installed from the lockfile.
- [ ] Frontend container image builds successfully through Docker.

## Affected areas

- API/UI: Frontend image build only.
- Data/migration: None.
- Modules/files: `frontend/Dockerfile`.

## Dependencies and open questions

- Docker engine access is required to execute the container build.

## Verification

- `npm run build` in `frontend/` for the app bundle.
- Build the frontend Docker image to validate musl native dependency resolution.

## Done notes

- Implementation: After the frozen install, the Dockerfile installs matching
  `@rollup/rollup-linux-*-musl` and `@esbuild/linux-*` packages with `--no-save`.
- Checks run and results: Local Docker engine is unavailable here, so the
  container build remains pending.
