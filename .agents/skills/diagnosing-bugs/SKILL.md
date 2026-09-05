# Diagnosing Bugs

For logic / parser / storage / controller bugs with regression risk, do not fix without a reproducible feedback loop. Obvious typo / null-guard / config one-liners may use the existing suite + repro steps instead.

## 1. Build a Deterministic Red Loop (Mandatory for regression-risk bugs)

Before fixing such bugs, construct and run one specific command that deterministically fails on this bug:

- Seam Test: Write a failing test in `src/lib/**/*.test.ts` (Domain, Parser/Codec, Storage, Clock).
- Harness/CLI: For complex Dexie timings or Brotli streams, run a standalone script under `scripts/`.
- Stabilize: Freeze time (`time-provider`), mock erratic network, or loop microtasks to eliminate flakes.

## 2. Root Cause Isolation & Minimal Fix

- Trace to the origin schema or invariant in `domain/interfaces` rather than adding caller-side patches.
- Fix at the shared root cause and verify all upstream dependents (`AppShellController`, `TimetableScreenState`, Dexie).

## 3. Verify & Guard

- Confirm the Phase 1 test turns green.
- Run `vp run test` and `vp run check` (full suite once at the end; scoped single-file run during iteration).
- Retain the test as a permanent regression guard for regression-risk bugs; trivial one-liners need no new permanent test.
