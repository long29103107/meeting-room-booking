# Reviewer Playbook

Review the change against its spec and acceptance criteria. Check:

- Scope alignment with `PRODUCT_VISION.md` and absence of unapproved expansion.
- Authorization and validation on the server, including owner/admin boundaries.
- Booking time semantics, cancellation behavior, and concurrency correctness.
- JPA/query behavior, transaction boundaries, and Flyway migration safety.
- API status/error compatibility and absence of sensitive data in responses/logs.
- Focused tests for success, invalid input, denied access, and relevant boundaries.
- README/spec/decision updates where public behavior changed.

Report actionable findings with file/line references; separate verified defects
from questions or optional improvements.
