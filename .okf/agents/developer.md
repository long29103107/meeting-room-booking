# Developer Playbook

- Follow `AGENTS.md` and the relevant `.okf/standards/` documents.
- Follow the standard package layers: `controller`, `service`, `repository`,
  `entity`, and `dto`; keep shared concerns in `common` and `config`.
- Keep REST controllers focused on HTTP binding and response mapping; place
  domain behavior in services as the module grows.
- Validate and authorize on the server. Use transactions for multi-step writes.
- Add schema changes as new Flyway migrations. Preserve historical records.
- Preserve the PostgreSQL exclusion constraint as the final overlap guard.
- Update tests and project memory after implementation; report checks actually run.
