# Test-Driven Development (TDD)

Follow the Red → Green → Refactor loop for domain logic, binary codecs, parsers, and state controllers.

## Testing Boundaries (Seams Only)

Test only public contracts at these defined seams. Do not test private `$state` fields or trivial pass-throughs:

1. Domain Use Cases (`src/lib/domain/usecases/`): Input models ➔ verify `AppResult` and updated entities.
2. Codecs & Layout Algorithms (`src/lib/parsers/`, `src/lib/timetable/capsule-layout.ts`): Verify Brotli ratios, CRC32, HTML parsing, and 2D grid placement.
3. State Controllers (`*.svelte.ts`): Invoke public controller methods ➔ assert on read-only `.state` snapshots.

## The Cycle

1. Red: Write a test describing the public behavior and run `vp test` to observe the failure.
2. Green: Write the minimal code required to pass the test (per `tobelazy`).
3. Refactor: Simplify structure and deduplicate while keeping tests green.
