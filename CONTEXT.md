# Chronos domain glossary

Canonical vocabulary for runtime modules. Prefer these names over file names.

## Ports (`I*Service`)

Registered on `ServiceContainer`. Hosts bootstrap them once; runtime code reads the container (or `engine.storage` / `ctx.service(...)`), not ad-hoc `env` fallbacks.

| Port                | Role                                                                |
| ------------------- | ------------------------------------------------------------------- |
| `IHttpService`      | Network + optional session                                          |
| `IStorageService`   | Timetables, preferences, wallpaper, plugin KV                       |
| `IVaultService`     | Encrypted secret store (WebAuthn PRF / Keychain). Not a general KV. |
| `IRuntimeService`   | Platform timers, SHA-256, UTF-8                                     |
| `IAnalyticsService` | Optional product analytics                                          |

`ChronosEnv` is only a host bootstrap adapter (web + native). After construction, `registerEnvProviders` copies ports into the container. `createEnvFacade` exists for “container only, no `env` argument”.

## Timetable and UserPreferences

Core owns the shapes. Web Dexie / Share codecs are strict Zod adapters (schemaVersion `1`).

- **Timetable**: courses, `academicConfig` (including `periodTimes`), `viewPrefs`, optional `importMetadata`, optional `customMetadata`.
- **ImportMetadata**: `{ source: string; campusId?: string }`. Campus period tables live in `customMetadata['source-cqut']`, not on `importMetadata`.
- **UserPreferences** tokens: theme `light` \| `dark` \| `auto`; palette `vibrant` \| `wallpaper`; layout `fixed` \| `compact`; corners `rounded` \| `sharp` \| `pill`.

## Period clock

One lookup module (`packages/core/src/engine/period-clock.ts`), two fallbacks:

- `'none'` — Engine `updateTime` (period only while in progress).
- `'upcomingOrLast'` — grid highlight.

CQUT campus tables (花溪 1 节 `08:20`, 两江下午 `14:20`, 10 节) live only in `@chronos/plugin-source-cqut`.

## CredentialVault vs IVaultService

- **IVaultService**: encrypt/decrypt secrets.
- **CredentialVault**: teaching-admin account module on that port. Password → `storeSecret` / `getSecret`. Account-only mode stays on a non-secret record. `source-cqut` may save credentials directly via `IVaultService` during slot import.

## EventPipeline

Single event + hook runtime (`emit` / `on`, `serial` guards, `waterfall`). Engine keeps both `events` and `pipeline` fields pointing at the same instance (`registerPipelineHook` → `pipeline:exportTransform`).

**Removed:** `EventBus` and `Pipeline` (`DataPipeline`). Do not reintroduce them.

## Transfer ingest (`IImportSessionCoordinator`)

Import UI executes `import.source.tab` slots directly. Session coordinator only handles preview persistence + `confirmImport` → `Engine.actions.importTimetable`. Share-link codec lives in `@chronos/plugin-codec-share` only (no web copy). Export uses `export.action` slots; clipboard write happens in UI, not a second coordinator call.

## Plugin activation (single-track)

- **Profile builtin plugins**: `ProfileManager` → in-process `plugin.apply(ScopedContext)`.
- **Official online plugins**: `OfficialPluginService` → fetch manifest + bundle (SHA-256) → `parsePluginBundle` → `engine.loadPlugin`.

Both paths share the same `ChronosEngine` lifecycle and slot owner tracking. Catalog: `apps/web/static/official-plugins/catalog.json`.

## Core shell (`core-shell`)

Builtin plugin registering `shell.bottom-bar.tab` and `mine.*` slots. Loaded first in every profile.

## Official plugin install

`OfficialPluginService` manages manifest-based online install, enable/disable, and local cache. Build official bundles via `vp run build:official-plugins`.

## Share-link codec

Canonical implementation: `@chronos/plugin-codec-share/share-link`. Slots: `import.source.tab` (`share-link`), `export.action` (`share-link`).
