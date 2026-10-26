# Testing Standard

- Test observable behavior and access boundaries at the narrowest suitable layer.
- Cover valid requests, validation failures, unauthenticated/unauthorized access,
  missing resources, and relevant state transitions.
- Use PostgreSQL-backed integration checks for database-specific exclusion,
  migration, and concurrent booking behavior; an in-memory substitute cannot
  establish those guarantees.
- Keep tests deterministic around time by using explicit instants or an injected
  clock where practical.
- Run and report the checks relevant to the changed modules.
