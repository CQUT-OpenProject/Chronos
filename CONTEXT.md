# Chronos domain glossary

Canonical vocabulary for runtime modules. Prefer these names over file names.

## Ports (`I*Service`)

Registered on `ServiceContainer`. Hosts bootstrap them once; runtime code reads the container (or `engine.storage` / `ctx.service(...)`), not ad-hoc `env` fallbacks.

| Port                | Role                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `IHttpService`      | Network + optional session                                                                                                                      |
| `IStorageService`   | Timetables, preferences, wallpaper, plugin KV                                                                                                   |
| `IVaultService`     | Encrypted secret store (native hosts: Keychain / Keystore). Not a general KV.                                                                   |
| `IRuntimeService`   | Platform id + SHA-256 (`sha256` only; timers/UTF-8 helpers removed Round 6)                                                                     |
| `IAnalyticsService` | Optional product analytics (registered via `ChronosEnv.analytics` → container; screens may still call `$lib/client/analytics` during migration) |
| `IHostNavigation`   | Optional host routes (`openCourseEditor`); plugins use `ctx.tryService(IHostNavigation)` — never hardcode host paths                            |

`ChronosEnv` is only a host bootstrap adapter (web + native). After construction, `registerEnvProviders` copies ports into the container. All hosts must pass `env` at construction (no container-only facade).

## Timetable and UserPreferences

Core owns the shapes. Web Dexie / Share codecs are strict Zod adapters (schemaVersion `1`).

- **Timetable**: courses, `academicConfig` (including `periodTimes`), `viewPrefs`, optional `importMetadata`, optional `customMetadata`. `academicConfig.holidayCalendar` is **plugin-managed** (`tool-calendar-holidays` syncs public holidays); core only renders holidays already on the timetable (`buildHolidayLookup`, grid column headers, muted courses).
- **ImportMetadata**: `{ source: string; campusId?: string }`. Campus period tables live in `customMetadata['source-cqut']`, not on `importMetadata`.
- **Weekend columns**: initial `showSaturday` / `showSunday` derive from course occupancy via core `deriveWeekendViewPrefs` — import-constructing plugins must use it; users override afterwards in details editing.
- **UserPreferences** tokens: theme `light` \| `dark` \| `auto`; palette `vibrant` \| `wallpaper`; layout `fixed` \| `compact`; corners `rounded` \| `sharp` \| `pill`; `visualThemeId`; optional `locale` (`zh-cn` \| `en`). Active icon theme is **derived**, never stored: engine resolves it from the active theme's `recommendedIconTheme` (fallback `host-default`) — see ADR 0026.

## Period clock

One lookup module (`packages/core/src/engine/period-clock.ts`), two fallbacks:

- `'none'` — Engine `updateTime` / `currentPeriodIndex` (period only while in progress).
- `'upcomingOrLast'` — grid highlight (host/plugin screens derive from `clockNow`).

**Scheduler (single):** `ChronosEngine` owns the only `createDayClock` instance (midnight + period-boundary timers with `reschedule`/`dispose`). `time:tick` emits `{ currentWeek, currentPeriod, now, todayIso }`; `ReactiveChronosController` mirrors `clockNow` / `clockTodayIso`. Host timetable screen and `tool-today` must not instantiate their own clocks.

Also exports period parsing helpers and delay utilities. ISO local weekday (`dayOfWeekFromIso`, 1 = Monday … 7 = Sunday) lives in `packages/core/src/engine/date.ts`.

CQUT campus tables (花溪 1 节 `08:20`, 两江下午 `14:20`, 10 节) live only in `@chronos/plugin-source-cqut`.

## EventPipeline

Single event + hook runtime on `ChronosEngine.events` (`emit` / `on`, `serial` guards, `waterfall`).

**Removed:** `EventBus`, `DataPipeline`, `engine.pipeline` aliases, the plugin-facing `ctx.registerWaterfallHook` / `ctx.registerSerialHook` registration face, and the never-emitted `import:before/after` / `export:before/after` events plus `ExportTransformHook` types. Do not reintroduce them.

**FROZEN BASELINE:** engine-internal serial/waterfall machinery (and the guard/waterfall wrappers inside every engine action) has zero hook registrants. Like `hosts/native-protocol.ts`: no new public API; if no real consumer appears within two release cycles, remove the machinery and the action wrappers wholesale.

## Reserved port: queryCourses

`IStorageService.queryCourses` (cross-timetable course lookup) is a **reserved capability**: implemented by Dexie, threaded through env/engine facades. First production consumer: official plugin `tool-today` (`queryTodayCourses`). Kept deliberately (Round 4 decision); do not extend query parameters without revisiting that decision.

## Transfer ingest

Import UI executes `import.source.tab` slots directly. Host `transfer-state` is the sole flow owner: preview persistence, `previewAndPersist` / `previewDeepLinkImport` (for `/s`), `setImportMode` / `confirmImport` with overwrite guards, and `engine.importTimetable` on confirm. All import plugins throw `ImportSlotError` + `kind` (`no-data` / `invalid-data` / `network` / `unsupported` / `unknown`); rich import tabs notify via `controller.notify`, not `alert`. Share-link codec lives in `@chronos/plugin-codec-share` only (no web copy). Export uses `export.action` slots; clipboard/download helpers live in `apps/web/src/lib/platform/transfer.ts`.

`ImportTabSlotContribution.importKind` (`online` \| `file` \| `link`) drives host onboarding/import copy without plugin-id hardcoding.

## Plugin activation (single-track)

- **Profile builtin plugins**: `ProfileManager.loadPlugins` / `applyProfile` is the only assembly surface. Host supplies `resolveBuiltinPlugin`; phase 1/2 filters run through `loadPlugins`. Plugin-center listing prefers a display cache from `resolveProfileBuiltinPlugins` (metadata import, no `loadPlugin`), else `listLoadedPlugins()`.
- **Official online plugins**: `OfficialPluginService` facade orchestrates four deep modules (`OfficialPluginCatalogClient`, `OfficialPluginAssetPipeline`, `OfficialPluginInstalledStore`, `OfficialPluginRuntimeActivator`) → fetch manifest + assets (SHA-256) → `loadEsmPluginFromCode` (when bundle present) → `engine.loadPlugin`. `init()` order: `load → dedupeBuiltinOverlap → activate cache → syncInstalledWithHost`.

Both paths share the same `ChronosEngine` lifecycle and slot owner tracking. No `plugin.inject` dependency topology — optional services use `ctx.service(...)` inside `apply`. Catalog: `apps/web/static/official-plugins/catalog.json`.

## Plugin server proxy

Server-side plugin handlers expose HTTP actions via `/api/plugins/{pluginId}/{action}`. Wire envelope is `PluginServerResponse<T>` in `@chronos/core` (`pluginServerSuccess` / `pluginServerError` / `parsePluginServerResponse`). `IHttpService.proxy` posts to this route from the browser; handler implementation errors use plugin-local `AppResult`, mapped at the handler boundary.

## Plugin i18n

- **Host shell UI**: `host-ui` message catalog (`apps/web/src/lib/i18n/host-messages.ts`), registered on engine bootstrap; screens use reactive `hostT()` from `host-i18n.svelte.ts`. Paraglide handles cookie, `document.lang`, and URL de-localization only — locale switches do not reload the page.
- **Host navigation slots**: `core-shell` plugin registers shell/mine keys from the same catalog subset.
- **Plugins**: `defineChronosPlugin` or `ctx.i18n.registerMessages(catalog)` in `apply`; slots/schemas use `() => ctx.i18n.t('key')`; rich UI uses ui-kit `pluginText(controller, pluginId, messages, key, params?)`.
- **Locale hub**: `ChronosEngine.setLocale` emits `i18n:localeChanged`; `ReactiveChronosController.slotVersion` increments so slot UI re-resolves `LocalizedText`; `host-i18n` subscribes via `configureHostI18n`.
- See ADR 0024 (revised §D4 in ADR 0027).

## Official plugin shapes

1. **`ChronosPlugin` (ESM bundle)** — full `apply()` + slots (e.g. `tool-wallpaper`).
2. **`ThemeManifest` (JSON-only)** — `colorsUrl` / `iconThemeUrl` without JS; assets register through a headless `ScopedContext` owned by `OfficialPluginService` (e.g. `theme-yumemita`). Manifests declare `themeId` explicitly; the host never guesses id prefixes.

### Component protocol (single)

Slot field `component?: ChronosMountable` is the only rich-UI protocol. In-process Svelte components are wrapped via ui-kit `mountableSvelteComponent()`; ESM bundles ship their own mountable wrapper. Hosts render through `MountableSlotOutlet` (+ SchemaForm fallback) and never branch on component shape.

## Plugin conflict strategy

No global conflict arbitrator. Behavior by resource type:

| Resource                                                                  | Strategy                                                                                                         |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Multi-contribution slots (`import.source.tab`, `mine.*`, `export.action`) | Coexist; sorted by `order`                                                                                       |
| `timetable.cell.badge`                                                    | Aggregate all contributors (**RESERVED** — pipeline live, zero producers; `BadgeManager` early-exits when empty) |
| Color / icon themes                                                       | Register many; user picks the color scheme, its `recommendedIconTheme` supplies icons (ADR 0026)                 |
| Same `contribution.id` under one slot                                     | Last registration wins (warned in dev)                                                                           |
| Same `plugin.id` reload                                                   | Unload then load                                                                                                 |
| Profile builtin vs official install overlap                               | Builtin wins; official record deduped                                                                            |
| Plugin uninstall with active theme                                        | `revertThemeIfNeeded` → defaults                                                                                 |
| `dynamicColor:*` events                                                   | Broadcast; host keeps single `dynamicColorUri` (last emit wins)                                                  |

## Core shell (`core-shell`)

Builtin plugin (`defineChronosPlugin`) registering `shell.bottom-bar.tab` and `mine.*` slots. Loaded first in every profile. Host tabs declare `hostPanel: 'timetable' | 'mine'`; the host switches views via `activeTabId` on `/` and branches on `hostPanel`, never on tab id literals (ADR 0029 / 0032). `defaultLaunch: true` sets initial tab via `resolveDefaultLaunchTab` (first `defaultLaunch` in registry order); fallback is `resolveHostPanelTab(tabs, 'timetable')`. Plugin tabs omit `hostPanel` and render through `resolveSlotOwner` + `PluginScreenContainer`. Secondary tools still use `/plugins/[pluginId]/...` or `IHostNavigation` for host-owned editors. Mine items without `sectionId` use `DEFAULT_MINE_SECTION_ID` (`app-support`). Search `keywords` come from the host catalog (`item.*.keywords`).

## Dynamic color

Kernel events: `dynamicColor:set`, `dynamicColor:changed`, `dynamicColor:hydrate`. Host `app-shell` bridges to `dynamicColorUri`; `ThemeContribution.dynamicColorAdapter` (`DynamicColorAdapter`) paints course palette from image URI. Scheme id `wallpaper` in preferences is legacy-compatible naming.

## Codec kit

`@chronos/codec-kit`: shared build-time byte-codec primitives consumed as a normal dependency by codec plugins (not a plugin, not in profiles). Exports `deflateRaw/inflateRaw` (deflate-raw; throws on failure — fallback policy belongs to callers), base64/base64url, `crc32/appendCrc32/verifyAndStripCrc32`, varint, canonical week bitmask (`bit(w-1)`, `MAX_TIMETABLE_WEEK=32`, `assertValidWeeks`), and `StringInterner`. No wire-format envelopes live here. See ADR 0020.

## Share-link codec

Canonical implementation: `@chronos/plugin-codec-share/share-link`. Slots: `import.source.tab` (`share-link`), `export.action` (`share-link`).
