# Codebase & Deep Module Design

Hide complex implementations behind small, high-leverage interfaces. Avoid shallow pass-through wrappers.

## Architectural Layer Boundaries

1. UI Components (`*.svelte`): Declarative markup and event bindings only. No complex calculations or data transforms.
2. Controllers (`*.svelte.ts`): Manage component lifecycles and UI state via Svelte 5 runes (`$state`, `$derived.by`). Expose read-only `state` and semantic action methods.
3. Domain Layer (`src/lib/domain/`): Pure TypeScript business logic and use cases. Zero dependencies on Svelte runes or UI frameworks.
4. Storage & Parsers (`src/lib/storage/`, `src/lib/parsers/`): Concrete adapters implementing domain ports (`domain/interfaces`). Isolate Dexie schemas and transport protocols.

## Locality & Leverage

- Locality: Confine domain rule changes (e.g. week calculation) entirely within their domain services without leaking to UI components.
- Leverage: Provide cohesive operations (e.g. `jumpToCurrentWeek()`) that encapsulate offsets, boundary clamping, and state transitions internally.
