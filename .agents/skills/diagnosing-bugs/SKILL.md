# Diagnosing Bugs

Never modify production code without a reproducible feedback loop.

## 1. Build a Deterministic Red Loop (Mandatory)

Before touching implementation code, construct and run one specific command that deterministically fails on this bug:

- Seam Test: Write a failing test in `src/lib/**/*.test.ts` (Domain, Parser/Codec, Storage, Clock).
- Harness/CLI: For complex Dexie timings or Brotli streams, run a standalone script under `scripts/`.
- Stabilize: Freeze time (`time-provider`), mock erratic network, or loop microtasks to eliminate flakes.

## 2. Root Cause Isolation & Minimal Fix

- Trace to the origin schema or invariant in `domain/interfaces` rather than adding caller-side patches.
- Fix at the shared root cause and verify all upstream dependents (`AppShellController`, `TimetableScreenState`, Dexie).

## 3. Verify & Guard

- Confirm the Phase 1 test turns green.
- Run `vp test` and `vp check` across the full codebase.
- Retain the test as a permanent regression guard.
