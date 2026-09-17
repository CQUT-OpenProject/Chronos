---
name: codebase-design
description: Design Chronos module responsibilities and cross-layer interfaces when those boundaries change.
---

# Codebase & Deep Module Design

Hide complex implementations behind small, high-leverage interfaces. Avoid shallow pass-through wrappers.

## Architectural Layer Boundaries

Use the [architecture map in CONTRIBUTING.md](../../../CONTRIBUTING.md#架构地图) for current package responsibilities and allowed dependencies.

1. UI Components (`*.svelte`): Keep markup, event bindings, and simple display-derived values local. Extract complex business calculations and data transforms when they belong to another layer, not merely because a component contains logic.
2. Controllers (`*.svelte.ts`): Manage component lifecycles and UI state via Svelte 5 runes (`$state`, `$derived.by`). Expose read-only `state` and semantic action methods.
3. Domain Logic (`packages/core/src/domain/`, `packages/core/src/algorithms/`): Pure TypeScript business logic. Zero dependencies on Svelte runes or UI frameworks.
4. Adapters & Codecs: Keep Dexie persistence in the host (`apps/web/src/lib/storage/`, `apps/web/src/lib/providers/`), shared byte primitives in `packages/codec-kit/`, and plugin-specific formats in their owning plugins. Follow existing ports and package boundaries.

## Locality & Leverage

- Locality: Confine domain rule changes (e.g. week calculation) entirely within their domain services without leaking to UI components.
- Leverage: Provide cohesive operations (e.g. `jumpToCurrentWeek()`) that encapsulate offsets, boundary clamping, and state transitions internally.
