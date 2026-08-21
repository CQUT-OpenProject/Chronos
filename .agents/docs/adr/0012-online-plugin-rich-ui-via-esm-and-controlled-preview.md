# ADR 0012: 在线插件富 UI：ESM 编译 Svelte 与受控 Schema 预览

- **状态**: Accepted
- **日期**: 2026-08-22
- **关联**: 细化 [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md) 与 [ADR 0011](./0011-single-track-official-plugin-install.md)
- **范围**: 插件 UI 能力、打包与加载 (`packages/core`, `packages/ui-kit`, `packages/plugins/wallpaper`, `apps/web`, `scripts/build-official-plugins.ts`, `apps/web/static/official-plugins`)

---

## 背景与问题

`ADR 0003` 确立 `HierarchicalSlotRegistry` + `SchemaForm` 声明式，`ADR 0011` 收敛为单轨 `engine.loadPlugin` 并以 `iife + new Function('module','exports')` 加载在线插件。`packages/core/src/types/slots.ts:64` 显式注释“Profile 可用 `component`，在线仅 `schema`”，导致：

1. **Svelte 未进 bundle**：`scripts/build-official-plugins.ts:28` `configFile:false` + `formats:['iife']` 无 `svelte` 插件，产物无法含 `.svelte`、`svelte/internal` 与作用域样式；`apps/web/src/lib/services/official-plugins/plugin-bundle.ts:13` 的 CJS shim 无法执行 ESM/CSS。
2. **壁纸胶水化**：`packages/plugins/wallpaper` 仅 `defineSchema({file})`，`apps/web/src/lib/boot/wallpaper-plugin.ts:4` `Rich UI lives at host /wallpaper` 硬编码路由与 `apps/web/src/lib/components/mine/WallpaperScreen.svelte`、`apps/web/src/lib/app/app-shell.svelte.ts:61` 三事件 `wallpaper:set/changed/hydrate` 镜像，违反“宿主零特判”。
3. **声明式天花板**：`SchemaForm` 仅 6 基础类型（`string/password/number/boolean/select/file`），无预览、取色等富交互，原地扩展受限。

---

## 架构决策

采用 **A（ESM 编译 Svelte 自包含）+ C（受控 Schema 预览原语）混合**，无兼容包袱（当前无用户）：

```mermaid
flowchart TD
  Src[插件 .svelte + .ts] --> ViteBuild[build-official-plugins\nsvelte() + esm self-contained]
  ViteBuild --> ESM["/official-plugins/bundles/<id>.bundle.js\nESM + svelte/internal inline"]
  ViteBuild --> Manifest["manifest: bundleFormat=esm + sha256 (+cssSha256)"]
  Manifest --> Catalog["catalog.json v2"]
  Catalog --> Fetch[OfficialPluginService.fetchCatalog/fetchManifest]
  Fetch --> Verify[IRuntimeService.sha256 JS+CSS]
  Verify --> Blob[Blob URL → import()]
  Blob --> LoadPlugin[engine.loadPlugin]
  LoadPlugin --> SlotReg[shell.route.screen.component]
  SlotReg --> RichUI["PluginScreenContainer\nDynamicComponent {controller, pluginId}"]
  SlotReg --> Fallback["SchemaForm wallpaper-preview/timetable-preview"]
```

### 1. 打包：ESM 自包含 Svelte

- `scripts/build-official-plugins.ts` 引入 `@sveltejs/vite-plugin-svelte`，`resolve.alias` 指向 `@chronos/core`/`@chronos/ui-kit`/`@chronos/plugin-*` 源码，`build.lib.formats=['es']`，不外置 `svelte`（插件自负责版本，免跨大版本桥接），`cssCodeSplit:false` 内联作用域样式；`tailwind` 仍由宿主 `apps/web/src/routes/layout.css` `@source` 扫描（含新增 `@source '../../../../packages/plugins/wallpaper/src'`），插件复用宿主 `bottom-bar` 等 M3 变量。
- `packages/plugins/wallpaper/bundle/entry.ts` `export default createWallpaperPlugin({screenComponent: WallpaperScreen})`，`WallpaperScreen.svelte` 复用 `@chronos/ui-kit/TimetablePreviewGrid` + `@chronos/core` 计算，`package.json` 新增 `./WallpaperScreen` 导出，`apps/web/vite.config.ts` 与根 `vite.config.ts` 新增别名。

### 2. 加载：Blob ESM + 双重校验 + 样式注入

- `apps/web/src/lib/services/official-plugins/plugin-bundle.ts` 新增 `loadEsmPluginFromCode(code)`：CJS（`module.exports`，单测）→ Blob URL `import()`（生产 ESM）→ `export default` 转 CJS 回退；`parsePluginBundle` 保留同步 CJS 供单测；`validatePluginManifest` 校验 `bundleFormat==='esm'`（兼容 `iife` 仅单测）。
- `apps/web/src/lib/services/official-plugins/official-plugin-service.ts` 移除 `migrateLegacyStorage`，`InstalledOfficialPluginRecord` 新增 `cssCode`，`downloadBundle` 校验 `sha256` + `cssSha256`（`cssUrl` 可选），`loadPluginInstance` `injectCss/removeCss`（`style[data-plugin-id]`）生命周期与 `activeHandles` 同步，`enable/disable/uninstall` 同步清理；`init` 仍过滤与 profile 内置冲突。

### 3. 渲染：统一 `component` + 受控预览

- `packages/core/src/types/slots.ts:64` 注释改为“所有插件可用 `component`（在线经 ESM），缺省回退 `schema`”；`PluginScreenSlotContribution.component` 保持 `unknown`，在线 bundle 直接携带已编译组件。
- `packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte:47` `component` 分支 `flex min-h-0 flex-1 flex-col` 无 `p-4`；`schema` 分支保留 `p-4` 卡片；`apps/web/src/routes/(secondary)/plugins/[pluginId]/[...view]/+page.svelte:27` `flush={Boolean(screenSlot?.component)}` 使 `SecondaryPageShell:33` `flush ? flex flex-col overflow-hidden : mx-auto p-4` 全屏化。
- `packages/core/src/schema/schema.ts:3` 新增 `timetable-preview`/`wallpaper-preview`，`packages/ui-kit/src/schema-form/inputs/TimetablePreviewField.svelte`、`WallpaperPreviewField.svelte` 复用 `TimetablePreviewGrid` + `computeTimetableWeekLayout` + `COURSE_PALETTE_ENTRIES`，`SchemaForm.svelte` 透传 `controller`，作为轻量无编译路径与 Rich UI 降级。

### 4. 壁纸收敛范例

- `packages/plugins/wallpaper/src/create-wallpaper-plugin.ts:13` `wallpaperScreenSchema` 改 `wallpaper-preview`，`mine.item.href` `/wallpaper` → `/plugins/tool-wallpaper`，`shell.route.screen` 同时注册 `component`（Rich）与 `schema`（降级）；
- `apps/web/src/lib/boot/wallpaper-plugin.ts:4` 传入 `WallpaperScreen`，`apps/web/src/routes/(secondary)/wallpaper` 与宿主 `WallpaperScreen.svelte` 删除，`apps/web/src/routes/(secondary)/navigation.ts:5` 移除 `/wallpaper`；
- 保留 `app-shell.svelte.ts:61` `wallpaper:changed/hydrate` 桥接（课表背景与 `appearance.svelte.ts` 取色仍需），`WallpaperScreen` 直连 `getWallpaperRuntime().setWallpaper` + `controller.getPluginContext(pluginId).actions.notify` 错误提示。

---

## 影响与收益

- **Rich UI 闭环**：在线插件与 Profile 内置同等 `component` 能力，壁纸预览/取色等富交互不再宿主硬编码；`SchemaForm` 新增受控预览覆盖 80% 轻量场景。
- **深模块与解耦**：`@chronos/core` 仍零 DOM，`ui-kit` 承载 Svelte；`HierarchicalSlotRegistry` 保持 `ownerPluginId` 追踪与 LIFO 释放，`ServiceContainer` 单测缝隙不变。
- **工程简化**：`bundleFormat` 单值 `esm`，移除 `iife/module.exports` 生产路径与 `core.marketplace` 迁移；双哈希 + 同源可信 + 用户自担风险安全边界不变。

---

## 验证

- `vp check` / `vp test` 86/86，`node scripts/build-official-plugins.ts` 产 `theme-yumemita 2.14kB` + `tool-wallpaper 172kB` ESM，`vp -C apps/web build` 通过；`displayedWeek is not defined`（`{displayedWeek}` 简写误用）与 `flush`/`bottom-bar` 布局回归已修复。

---

## 后续

- 官方插件清单 `catalog.json` `version:2`，`manifest.minEngineVersion 0.4.0`；
- 新增插件直接 `bundle/entry.ts` 引入 `.svelte`，无需宿主改动；纯配置插件继续 `defineSchema` + `wallpaper-preview` 等原语。
