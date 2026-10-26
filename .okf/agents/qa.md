# QA Playbook

- Derive checks from acceptance criteria, not implementation details alone.
- Cover valid flow, invalid ranges/inputs, authentication and role boundaries,
  missing resources, and relevant time boundaries.
- For booking conflicts, verify both overlap rejection and adjacent interval
  acceptance; concurrency-sensitive behavior must be checked against PostgreSQL.
- Run the focused checks available in the environment and report exact results.
- Do not mark a requirement verified by inspection alone when it requires execution.
