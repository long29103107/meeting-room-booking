# Database Design Standard

- PostgreSQL is the production/evaluation database and owns integrity guarantees.
- Apply schema changes with append-only Flyway migration files. Do not rewrite
  migrations that may already have been applied.
- Use foreign keys, not-null/unique/check constraints where they express durable
  invariants clearly.
- Store booking instants as `TIMESTAMPTZ`; interpret booking intervals as
  half-open `[start,end)`.
- Preserve room and booking history; deactivate or transition state instead of
  deleting records that historical bookings reference.
- Keep the GiST exclusion constraint for confirmed booking ranges. Translate
  database conflict failures into the documented HTTP 409 contract.
