# Project Working Guide

This folder holds project-specific agent playbooks, engineering standards,
feature specifications, task notes, decisions, workflows, and phase memory.
It is adapted from a workflow used in another repository; only its reusable
planning and documentation practices are carried over. This repository's
`PRODUCT_VISION.md`, source code, and migrations remain authoritative for this
project's stack and behavior.

## Source of truth

- `PRODUCT_VISION.md`: product scope, business rules, actors, stack, and accepted
  design decisions.
- `.okf/specs/`: detailed feature specifications, including open questions.
- `.okf/decisions/`: durable decisions and their rationale.
- `.okf/phase/`: implementation outcome, verification, and current next step.
- `.okf/standards/`: implementation guidance for this Java/PostgreSQL/React repo.
- `README.md`: setup, API overview, and evaluator-facing instructions.

When documents conflict, do not silently invent a rule. Follow the product
vision for intended scope, verify actual behavior in code and migrations, then
record the correction in the document that owns the subject.

## How to write a spec

1. Start with the user problem and desired outcome, not a proposed class or endpoint.
2. Link the outcome to a goal and boundary in `PRODUCT_VISION.md`.
3. Describe actors, the main flow, and observable acceptance criteria.
4. State business rules, validation, authorization, time semantics, errors, and
   boundary cases explicitly. Distinguish confirmed decisions from open questions.
5. Describe API and data changes only as far as needed to make behavior testable.
   Identify migration and compatibility concerns.
6. List in-scope and out-of-scope work, dependencies, verification, and risks.
7. Keep React optional; specify server-enforced behavior independently of UI.
8. Review the spec for contradictions with existing code, migrations, README, and
   product vision before implementation.

Use `.okf/templates/spec.md` for features and `.okf/templates/task.md` for a
single bounded implementation task. Specs should be concise enough to review
and detailed enough that acceptance does not depend on guesswork.

## Workflow

1. Read the relevant vision, spec, code, standards, and existing tests.
2. Write or refine the spec/task note and list acceptance criteria.
3. Implement the smallest complete backend slice; update the optional UI only
   when it helps demonstrate that capability.
4. Add or update focused automated checks for the behavior.
5. Run relevant verification and record actual outcomes in the phase summary.
6. Update the spec, README, or decision record if implementation changes a contract.

## Project memory

- Stack: Java 21, Spring Boot 3, Maven, REST/JSON, Spring Data JPA, PostgreSQL
  16, Flyway, Spring Security, Docker Compose; optional React/TypeScript/Vite UI.
- Modules currently include `room`, `booking`, `common`, and `config`.
- Confirmed booking intervals are half-open `[start,end)`; adjacent bookings are
  permitted, and PostgreSQL exclusion constraints prevent concurrent overlap.
- Room deactivation and booking cancellation preserve history.
- Keep assumptions and unresolved business policy in `.okf/specs/` as open
  questions until the user or authoritative requirement settles them.
