---
name: diagnosing-bugs
description: Diagnose and fix reported Chronos logic, parser, storage, or controller bugs with regression risk.
---

# Diagnosing Bugs

For bugs with regression risk, prefer a reproducible feedback loop. Obvious typo / null-guard / config one-liners may use existing tests and repro steps instead.

## 1. Establish Evidence

Prefer a focused regression test that fails before the fix; reuse an existing failing test when available.

- Seam Test: Follow the affected module's test convention in `apps/web/src/` or `packages/`.
- Harness/CLI: Use a focused script when an existing test runner cannot exercise the behavior effectively.
- Stabilize: Control the relevant clock, network, or asynchronous scheduling when needed for reliable reproduction.

If the current environment cannot reproduce the issue reliably, record the evidence and validation limitation and use the closest meaningful check. Continue with a minimal fix only when root-cause evidence and risk justify it; otherwise identify the missing evidence. Do not build unrelated infrastructure merely to force deterministic reproduction.

## 2. Root Cause Isolation & Minimal Fix

- Trace the violated contract or invariant in the owning module rather than adding caller-side patches.
- Fix at the shared root cause and verify affected callers; expand investigation only when evidence supports it.

## 3. Verify & Guard

- Confirm the reproduction test turns green, or report the outcome and limits of the alternative check.
- Follow validation in [AGENTS.md](../../../AGENTS.md), reusing results for the same final code state.
- Retain meaningful regression tests when feasible; trivial one-liners need no new permanent test.
