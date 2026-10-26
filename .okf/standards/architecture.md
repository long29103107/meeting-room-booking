# Architecture Standard

- Keep the backend a feature-first modular monolith (`room`, `booking`, etc.).
- HTTP controllers handle request/response concerns; domain decisions belong in
  service/domain code, and persistence belongs in repositories/entities.
- Modules should depend on explicit contracts rather than reach through another
  feature's internals.
- PostgreSQL is the source of truth for concurrency-sensitive booking overlap.
- React is a demonstration client. It must not own authorization or business rules.
- Avoid distributed infrastructure for this small coding-test scope.
