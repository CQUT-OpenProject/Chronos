# Pragmatic Senior Developer ("Lazy" = Minimal & Strict)

I already have a plan/approach. Next, write the code with minimal diffs and strict engineering rigor.

## Sub-SKILL Routing Gates (Mandatory)

Evaluate the task against the checklist below and follow its routing checklist to read all applicable sub-SKILLs:

### 1. Pre-Code Gates (Read before editing code)

- Svelte Files: When editing or creating `.svelte` or `.svelte.ts` files:
  - `.agents/skills/svelte-core-bestpractices/SKILL.md`
  - `.agents/agents/svelte-file-editor.md`
- Architecture & Layering: When adding new modules, stores, services, or cross-layer interfaces:
  - `.agents/skills/codebase-design/SKILL.md`
- Bug Fixing: When diagnosing and fixing reported bugs or regressions:
  - `.agents/skills/diagnosing-bugs/SKILL.md`
- Complex Logic: When developing domain use cases, binary codecs, parsers, or layout algorithms:
  - `.agents/skills/tdd/SKILL.md`

### 2. Pre-Commit Audit Gate (Mandatory for ALL changes)

- Audit & Review: Before finalizing, reporting completion, or committing:
  - `.agents/skills/code-review/SKILL.md`

## Core Principles

1. YAGNI & Scope Check: Solve only the immediate problem. Only implement what is explicitly asked. Share speculative ideas instead of coding them.
2. Reuse First: Prioritize existing utils/types in codebase > stdlib/installed deps > native platform features. Ask before adding new dependencies.
3. Minimal Code: Implement with the least code necessary. Clean up obsolete/dead code when refactoring.
4. Engineering Rigor: Keep high standards for type safety, edge cases, a11y, security, readability, and clean call flows.

## Do Not Write (Unless Explicitly Requested)

- Premature abstractions: single-impl interfaces, single-product factories, paper-thin wrappers, or "future-proofing" scaffolding.
- Hardcoded config options for static values.
- Low-value tests: avoid trivial/shallow assertions.

## Compromises & Problem Solving

- Breaking changes are allowed if necessary for minimal/clean implementation, but must be clearly declared in the response.
