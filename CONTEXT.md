# Chronos domain glossary

Canonical vocabulary for runtime modules. Prefer these names over file names.

## Ports (`I*Service`)

Registered on `ServiceContainer`. Hosts bootstrap them once; runtime code reads the container (or `engine.storage` / `ctx.service(...)`), not ad-hoc `env` fallbacks.

| Port                | Role                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| `IHttpService`      | Network + optional session                                                    |
| `IStorageService`   | Timetables, preferences, wallpaper, plugin KV                                 |
| `IVaultService`     | Encrypted secret store (native hosts: Keychain / Keystore). Not a general KV. |
| `IRuntimeService`   | Platform timers, SHA-256, UTF-8                                               |
| `IAnalyticsService` | Optional product analytics                                                    |

`ChronosEnv` is only a host bootstrap adapter (web + native). After construction, `registerEnvProviders` copies ports into the container. `createEnvFacade` exists for “container only, no `env` argument”.

## Timetable and UserPreferences

Core owns the shapes. Web Dexie / Share codecs are strict Zod adapters (schemaVersion `1`).

- **Timetable**: courses, `academicConfig` (including `periodTimes`), `viewPrefs`, optional `importMetadata`, optional `customMetadata`.
- **ImportMetadata**: `{ source: string; campusId?: string }`. Campus period tables live in `customMetadata['source-cqut']`, not on `importMetadata`.
- **UserPreferences** tokens: theme `light` \| `dark` \| `auto`; palette `vibrant` \| `wallpaper`; layout `fixed` \| `compact`; corners `rounded` \| `sharp` \| `pill`; `visualThemeId`; `visualIconThemeId`.

## Period clock

One lookup module (`packages/core/src/engine/period-clock.ts`), two fallbacks:

- `'none'` — Engine `updateTime` (period only while in progress).
- `'upcomingOrLast'` — grid highlight.

CQUT campus tables (花溪 1 节 `08:20`, 两江下午 `14:20`, 10 节) live only in `@chronos/plugin-source-cqut`.

## EventPipeline

Single event + hook runtime on `ChronosEngine.events` (`emit` / `on`, `serial` guards, `waterfall`).

**Removed:** `EventBus`, `DataPipeline`, `engine.pipeline` aliases, and the plugin-facing `ctx.registerWaterfallHook` / `ctx.registerSerialHook` registration face (zero real consumers; engine-internal serial/waterfall machinery is retained for future re-introduction). Do not reintroduce them.

## Transfer ingest

Import UI executes `import.source.tab` slots directly. Host `transfer-state` handles preview persistence + `confirmImport` → `engine.actions.importTimetable`. Share-link codec lives in `@chronos/plugin-codec-share` only (no web copy). Export uses `export.action` slots; clipboard write happens in UI.

`ImportTabSlotContribution.importKind` (`online` \| `file` \| `link`) drives host onboarding/import copy without plugin-id hardcoding.

## Plugin activation (single-track)

- **Profile builtin plugins**: `ProfileManager` → in-process `plugin.apply(ScopedContext)`.
- **Official online plugins**: `OfficialPluginService` → fetch manifest + assets (SHA-256) → `loadEsmPluginFromCode` (when bundle present) → `engine.loadPlugin`.

Both paths share the same `ChronosEngine` lifecycle and slot owner tracking. Catalog: `apps/web/static/official-plugins/catalog.json`.

## Official plugin shapes

1. **`ChronosPlugin` (ESM bundle)** — full `apply()` + slots (e.g. `tool-wallpaper`).
2. **`ThemeManifest` (JSON-only)** — `colorsUrl` / `iconThemeUrl` without JS; `OfficialPluginService` registers themes directly (e.g. `theme-yumemita`).

## Plugin conflict strategy

No global conflict arbitrator. Behavior by resource type:

| Resource                                                                  | Strategy                                                                                   |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Multi-contribution slots (`import.source.tab`, `mine.*`, `export.action`) | Coexist; sorted by `order`                                                                 |
| `timetable.cell.badge`                                                    | Aggregate all contributors (currently a reserved contract — pipeline live, zero producers) |
| Color / icon themes                                                       | Register many; user picks one via preferences                                              |
| Same `contribution.id` under one slot                                     | Last registration wins (warned in dev)                                                     |
| Same `plugin.id` reload                                                   | Unload then load                                                                           |
| Profile builtin vs official install overlap                               | Builtin wins; official record deduped                                                      |
| Plugin uninstall with active theme                                        | `revertThemeIfNeeded` → defaults                                                           |
| `dynamicColor:*` events                                                   | Broadcast; host keeps single `dynamicColorUri` (last emit wins)                            |

## Core shell (`core-shell`)

Builtin plugin registering `shell.bottom-bar.tab` and `mine.*` slots. Loaded first in every profile.

## Dynamic color

Kernel events: `dynamicColor:set`, `dynamicColor:changed`, `dynamicColor:hydrate`. Host `app-shell` bridges to `dynamicColorUri`; `ThemeContribution.dynamicColorAdapter` (`DynamicColorAdapter`) paints course palette from image URI. Scheme id `wallpaper` in preferences is legacy-compatible naming.

## Codec kit

`@chronos/codec-kit`: shared build-time byte-codec primitives consumed as a normal dependency by codec plugins (not a plugin, not in profiles). Exports `deflateRaw/inflateRaw` (deflate-raw; throws on failure — fallback policy belongs to callers), base64/base64url, `crc32/appendCrc32/verifyAndStripCrc32`, varint, canonical week bitmask (`bit(w-1)`, `MAX_TIMETABLE_WEEK=32`, `assertValidWeeks`), and `StringInterner`. No wire-format envelopes live here. See ADR 0020.

## Share-link codec

Canonical implementation: `@chronos/plugin-codec-share/share-link`. Slots: `import.source.tab` (`share-link`), `export.action` (`share-link`).
