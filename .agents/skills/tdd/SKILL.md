---
name: tdd
description: Develop complex Chronos domain logic, codecs, parsers, layout algorithms, or state transitions through public-contract tests.
---

# Test-Driven Development (TDD)

Follow the Red → Green → Refactor loop for complex domain logic, binary codecs, parsers, layout algorithms, and state transitions. For reported bugs that cannot be reproduced in the current environment, use the evidence fallback in [diagnosing-bugs](../diagnosing-bugs/SKILL.md).

## Testing Boundaries (Seams Only)

Test only public contracts at these defined seams. Do not test private `$state` fields or trivial pass-throughs:

1. Domain Logic (`packages/core/src/domain/` and the owning engine operations): Verify public results and entity changes.
2. Codecs & Layout Algorithms (`packages/codec-kit/`, relevant `packages/plugins/`, `packages/core/src/algorithms/`): Verify the behavior being changed, such as round trips, malformed input handling, checksums, or grid placement.
3. State Controllers (`*.svelte.ts`): Invoke public controller methods ➔ assert on read-only `.state` snapshots.

## The Cycle

1. Red: Write a test describing the public behavior (or reuse an existing failing test) and run the scoped single-file test to observe the failure.
2. Green: Write the minimal code required to pass the test (per `tobelazy`).
3. Refactor: Simplify structure and deduplicate while keeping tests green.

Follow final validation in [AGENTS.md](../../../AGENTS.md), reusing results for the same final code state.
