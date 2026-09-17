---
name: code-review
description: Review Chronos diffs for requirement fidelity and design issues when review is requested or changes are complex or high risk.
---

# Code Review & Pre-Commit Audit

Review the requested diff for requirement fidelity and relevant standards. Check only areas touched by the change or supported by evidence of impact; simple edits need only a direct diff check.

---

## Axis 1: Spec & Intent Fidelity

Verify that changes align strictly with the original requirement and edge-case contracts:

- [ ] Scope Focus: Implements only requested capabilities without extraneous side-effects or unverified refactoring.
- [ ] Edge Cases & Resilience: Check relevant failure modes, such as offline states, Dexie errors, corrupt share payloads, or upstream CAS failures (`AppResult` / user notices), only when affected.
- [ ] Breaking Changes: Clearly documents any schema or protocol format adjustments.

---

## Axis 2: Standards & Code Smells

Ensure compliance with Chronos coding standards and clean design practices:

Consult the following references only when the diff involves that concern and the guidance is not already available in the task.

### 1. Framework & Architecture Standards

- Svelte 5 Runes: Follows `.agents/skills/svelte-core-bestpractices/SKILL.md` (no legacy Svelte 4 patterns, prefers `$derived` over `$effect`, keyed each blocks).
- Pragmatic Minimalism: Follows `.agents/skills/tobelazy/SKILL.md` (no premature abstractions, no dead code, no low-value tests).
- Module Depth: Follows `.agents/skills/codebase-design/SKILL.md` (small interfaces, deep implementations, high locality).

### 2. Code Smells Baseline

- Mysterious Name: Names across functions, variables, and types reveal clear domain intent.
- Duplicated Code: Logic across parsers, mappers, or components is properly unified.
- Feature Envy: Functions avoid directly manipulating external module internals instead of calling dedicated methods.

---

## Post-Review Delivery

For implementation tasks, follow validation in [AGENTS.md](../../../AGENTS.md), reusing results for the same final code state. For review-only tasks, run checks only when needed to investigate a concrete concern. Format a commit message using the Gitmoji convention only when the user requests a commit or a draft message.
