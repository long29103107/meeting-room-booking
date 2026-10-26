# API Design Standard

- Keep resources and paths consistent with existing `/api` routes.
- Use request/response DTOs at API boundaries; do not expose persistence entities
  or password/security internals.
- Validate input at the boundary and enforce role/ownership checks on the server.
- Use documented status semantics: 400 invalid input, 401 unauthenticated,
  403 forbidden, 404 missing resource, 409 state/conflict.
- Use ISO-8601 offset-aware timestamps and document interval semantics.
- Keep error responses consistent through the shared API exception handler.
