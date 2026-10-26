# Feature Workflow

1. **Clarify:** identify the user outcome and confirm it fits `PRODUCT_VISION.md`.
2. **Specify:** fill `.okf/templates/spec.md`; separate accepted rules from open
   questions and define observable acceptance criteria.
3. **Plan:** split only where multiple independently verifiable steps are needed;
   identify API, data, security, compatibility, and UI impacts.
4. **Implement:** build the smallest complete backend slice; update the optional
   React demo only when appropriate.
5. **Review:** check scope, server-side rules, data integrity, error semantics,
   migration safety, and test coverage against the spec.
6. **Verify and record:** run relevant checks and update the spec, README,
   decision record, and phase summary as needed.

Done when acceptance criteria are implemented, relevant checks are reported,
and durable behavior is documented.
