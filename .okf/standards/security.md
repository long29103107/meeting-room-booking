# Security Standard

- Enforce authentication, roles, ownership, and input validation in the backend.
- Do not return credentials, hashes, or internal security configuration.
- Never commit real credentials, tokens, or populated environment files.
- Keep demo credentials clearly limited to local evaluation and follow README
  boundaries; do not imply HTTP Basic demo auth is production ready.
- Avoid logging secrets or unnecessary personal data.
