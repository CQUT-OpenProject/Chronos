# Code Review & Pre-Commit Audit

Before committing completed features, bug fixes, or major refactors, perform a two-axis review of the diff:

---

## Axis 1: Spec & Intent Fidelity

Verify that changes align strictly with the original requirement and edge-case contracts:

- [ ] Scope Focus: Implements only requested capabilities without extraneous side-effects or unverified refactoring.
- [ ] Edge Cases & Resilience: Handles offline states, Dexie errors, corrupt share payloads, and upstream CAS failures gracefully (`AppResult` / user notices).
- [ ] Breaking Changes: Clearly documents any schema or protocol format adjustments.

---

## Axis 2: Standards & Code Smells

Ensure compliance with Chronos coding standards and clean design practices:

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

Once the two-axis review passes, complete validation per the checklist in [AGENTS.md](file:///Users/uednd/code/Chronos/AGENTS.md) (`vp run check` & `vp run test`) and format the commit message using the Gitmoji convention.
