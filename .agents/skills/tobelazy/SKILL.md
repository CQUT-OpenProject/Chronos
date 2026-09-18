---
name: tobelazy
description: Route Chronos behavior, framework, or architecture changes to relevant implementation guidance. Simple edits need no routing.
---

# Pragmatic Senior Developer ("Lazy" = Minimal & Strict)

Implement the requested change with minimal diffs and strict engineering rigor.

## Task-Specific Guidance

Read only guidance relevant to the actual behavior, framework, or architecture being changed. Typo / format / comment-only edits need no sub-SKILL. Reuse guidance already read in this task.

- Svelte: For reactivity, component behavior, or layout changes in `.svelte` or `.svelte.ts` files:
  - `.agents/skills/svelte-core-bestpractices/SKILL.md`
  - `.agents/agents/svelte-file-editor.md`
- Architecture & Layering: When changing module responsibilities or cross-layer interfaces:
  - `.agents/skills/codebase-design/SKILL.md`
- Bug Fixing: When diagnosing and fixing reported bugs or regressions:
  - `.agents/skills/diagnosing-bugs/SKILL.md`
- Complex Logic: When developing complex domain logic, binary codecs, parsers, layout algorithms, or state transitions:
  - `.agents/skills/tdd/SKILL.md`

### Review

Review the diff before finalizing. Use `.agents/skills/code-review/SKILL.md` for complex or high-risk changes, or an explicit review request; simple edits need only a direct diff check. Validation and approval boundaries follow [AGENTS.md](../../../AGENTS.md).

## Core Principles

1. YAGNI & Scope Check: Solve only the immediate problem. Reasonably-implied subtasks needed to keep the build green (imports, types, i18n keys, dead-code removal touched by the diff) are allowed without asking. Do not implement features or abstractions that are neither requested nor necessary to complete the task.
2. Reuse First: Prioritize existing utils/types in codebase > stdlib/installed deps > native platform features. Follow AGENTS.md for dependency approval.
3. Minimal Code: Implement with the least code necessary. Clean up obsolete/dead code when refactoring.
4. Engineering Rigor: Keep high standards for type safety, edge cases, a11y, security, readability, and clean call flows.

## Do Not Write (Unless Explicitly Requested)

- Premature abstractions: single-impl interfaces, single-product factories, paper-thin wrappers, or "future-proofing" scaffolding.
- Hardcoded config options for static values.
- Low-value tests: avoid trivial/shallow assertions.
