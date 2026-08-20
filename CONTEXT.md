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

Core owns the shapes. Web Dexie / Share codecs are Zod adapters that digest legacy JSON.

- **Timetable**: courses, `academicConfig` (including `periodTimes`), `viewPrefs`, optional `importMetadata`, optional `customMetadata`.
- **ImportMetadata**: `{ source: string; campusId?: string }`. Campus period tables live in `customMetadata['source-cqut']`, not on `importMetadata`.
- **UserPreferences** tokens: theme `light` \| `dark` \| `auto`; palette `vibrant` \| `random` \| `wallpaper`; layout `fixed` \| `compact`; corners `rounded` \| `sharp` \| `pill`.
- Legacy Dexie keys: `system→auto`, `fit/scroll→compact/fixed`, `default/merge/square/monochrome→vibrant/pill/sharp/random`.

## Period clock

One lookup module (`packages/core/src/engine/period-clock.ts`), two fallbacks:

- `'none'` — Engine `updateTime` (period only while in progress).
- `'upcomingOrLast'` — grid highlight.

CQUT campus tables (花溪 1 节 `08:20`, 两江下午 `14:20`, 10 节) live only in `source-cqut`. Web re-exports them.

## CredentialVault vs IVaultService

- **IVaultService**: encrypt/decrypt secrets.
- **CredentialVault**: teaching-admin account module on that port. Password → `storeSecret` / `getSecret`. Account-only mode stays on a non-secret record. `source-cqut` may save credentials directly via `IVaultService` during slot import.

## EventPipeline

Single event + hook runtime (`emit` / `on`, `serial` guards, `waterfall`). Engine keeps both `events` and `pipeline` fields pointing at the same instance (`registerPipelineHook` → `pipeline:exportTransform`).

**Removed:** `EventBus` and `Pipeline` (`DataPipeline`). Do not reintroduce them.

## Transfer ingest (`IImportSessionCoordinator`)

Import UI executes `import.source.tab` slots directly. Session coordinator only handles preview persistence + `confirmImport` → `Engine.actions.importTimetable`. Share-link codec lives in `@chronos/plugin-codec-share` only (no web copy). Export uses `export.action` slots; clipboard write happens in UI, not a second coordinator call.

## Plugin activation (intentional dual-track)

- **Builtin plugins** (profile): `ProfileManager` → in-process `plugin.apply(ScopedContext)`.
- **Marketplace plugins**: `WorkerPluginBridge` → sandbox Worker runtime.

Both tracks share slot RPC protocol; do not merge into a single activation path.

## Core shell (`core-shell`)

Builtin plugin registering `shell.bottom-bar.tab` and `mine.*` slots. Loaded first in every profile.

## Sandbox

`InProcessSandboxAdapter` implements `Worker` and runs the same RPC as the real worker runtime (apply plugin, round-trip slot calls). Tests may inject a mock `Worker`. No Worker and no injected adapter → throw. Empty `postMessage` stubs are not a sandbox.

## Share-link codec

Canonical implementation: `@chronos/plugin-codec-share/share-link`. Slots: `import.source.tab` (`share-link`, `share-json`), `export.action` (`share-link`, `share-json`).
