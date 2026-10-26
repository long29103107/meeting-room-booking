---
name: spec-writer
description: Turn a feature idea, product request, or rough requirement into a concise, testable specification grounded in this repository. Use when the user asks to write, refine, review, or clarify a spec, PRD, acceptance criteria, or feature scope.
---

# Spec Writer

Create or edit a specification using `.okf/templates/spec.md`. Read
`PRODUCT_VISION.md`, `.okf/README.md`, and the relevant code/docs first.

## Workflow

1. State the user problem and desired outcome separately from the implementation.
2. Map it to a product goal; make any proposed scope expansion explicit.
3. Identify actors and describe the main user flow.
4. Turn requirements into observable acceptance criteria. Include access rules,
   validation, time boundaries, conflict behavior, and error status when relevant.
5. Describe API and data changes, including Flyway and compatibility impact, only
   to the degree needed for review and verification.
6. Separate confirmed rules, assumptions, and open questions.
7. Set explicit in-scope and out-of-scope boundaries and verification.
8. Check for contradictions with the current vision, README, source, and migrations.

## Guardrails

- Keep all essential behavior server-enforced; React is an optional demo client.
- Keep PostgreSQL exclusion constraints as the concurrency guarantee for bookings.
- Do not invent business policy to fill an open question.
- Keep small fixes in a task note; do not create phase machinery for every change.
- If a material product decision cannot be resolved from repository evidence,
  produce the draft with the decision clearly marked open and ask one focused question.
