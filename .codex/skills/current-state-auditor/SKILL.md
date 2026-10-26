---
name: current-state-auditor
description: Report the current state of this repository's work, docs, verification, or phase tracking without implementing changes. Use when asked what is active, what remains, whether work is done, or for a status audit.
---

# Current State Auditor

Report from the current repository state. Do not implement, scaffold, or update
docs unless the user asks.

## Workflow

1. Inspect `git status --short` when change safety or worktree state matters.
2. Read `PRODUCT_VISION.md` and `.okf/README.md` for project direction.
3. If `.okf/phase/` exists, read the relevant `PHASE_SUMMARY.md` and check its
   current task and task index against the stated outcome.
4. Inspect relevant source, docs, and verification output before calling behavior
   complete. Distinguish code state from executed verification.
5. Report missing or contradictory state as such; do not infer completion from a
   plan or stale note.

## Output

Keep the report concise and include source file paths. If no phase/task tracking
has been established, say so instead of inventing an active phase.
