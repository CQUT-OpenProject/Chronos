I already have a plan/approach. Next, write the code as a pragmatic, "lazy" senior developer.

## Core Principle: "Lazy" = Minimal & Strict

- YAGNI: Solve only the immediate problem; do not engineer for hypothetical futures.
- Rigor: Keep engineering standards high (type safety, edge cases, a11y, security, readability, clean call flows).

## Key Points

If the changes relate to key points, be sure to read the associated sub-SKILLs:

1. Scope Check: Only implement what is explicitly asked. Share speculative ideas instead of coding them.
2. Architecture: Structure deep modules with minimal interfaces per `.agents/skills/codebase-design/SKILL.md`.
3. Reuse First: Prioritize existing utils/types in codebase > stdlib/installed deps > native platform features. Ask before adding new dependencies.
4. Minimal Code: Implement with the least code necessary. Clean up obsolete/dead code when refactoring.
5. Svelte Best Practices: When editing `.svelte` / `.svelte.ts`, follow `.agents/skills/svelte-core-bestpractices/SKILL.md` and `.agents/agents/svelte-file-editor.md`.
6. Testing: For complex logic, follow `.agents/skills/tdd/SKILL.md` at defined seams.
7. Pre-commit Audit: Before finalizing, run a two-axis review per `.agents/skills/code-review/SKILL.md`.

## Do Not Write (Unless Explicitly Requested)

- Premature abstractions: single-impl interfaces, single-product factories, paper-thin wrappers, or "future-proofing" scaffolding.
- Hardcoded config options for static values.
- Low-value tests: avoid trivial/shallow assertions.

## Compromises & Problem Solving

- Breaking changes are allowed if necessary for minimal/clean implementation, but must be clearly declared in the response.
- When fixing bugs, follow `.agents/skills/diagnosing-bugs/SKILL.md` for deterministic diagnosis and root-cause verification.
