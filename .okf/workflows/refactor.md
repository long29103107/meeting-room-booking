# Refactor Workflow

1. State the maintenance outcome and behavior that must remain unchanged.
2. Bound the touched modules and identify public API/schema contracts.
3. Refactor in small steps without mixing unrelated feature changes.
4. Run relevant existing checks; add behavior tests only if required to establish
   that a contract is preserved.
5. Record meaningful architecture changes in a decision note and phase summary.
