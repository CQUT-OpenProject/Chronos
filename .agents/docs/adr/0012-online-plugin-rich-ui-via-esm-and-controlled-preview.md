# ADR 0012: 在线插件富 UI：ESM 编译 Svelte 与受控 Schema 预览

- **状态**: Accepted
- **日期**: 2026-08-22
- **关联提交**: `7b4d8fa`, `d360fcf`, `5001d27`, `28e6833`, `3091159`, `865bb18`, `c2bc5c7`, `eca940a`, `1d53d9c`, `c388671`
- **关联**: 细化 [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md) 与 [ADR 0011](./0011-single-track-official-plugin-install.md)
- **范围**: 插件 UI 能力、打包与加载 (`packages/core`, `packages/ui-kit`, `packages/plugins/wallpaper`, `apps/web`, `scripts/build-official-plugins.ts`, `apps/web/static/official-plugins`)

---

## 背景与问题

`ADR 0003` 确立了 `HierarchicalSlotRegistry` + `SchemaForm` 的声明式扩展方式；`ADR 0011` 把插件加载统一为单一路径 `engine.loadPlugin`，在线插件以 `iife + new Function('module','exports')` 方式执行。但 `packages/core/src/types/slots.ts:64` 的注释明确规定「Profile 插件可用 `component`，在线插件只能用 `schema`」，由此产生三个问题：

1. **Svelte 没有进入构建产物**：`scripts/build-official-plugins.ts:28` 配置为 `configFile:false` + `formats:['iife']`，且没有接入 `svelte` 插件，因此产物无法包含 `.svelte` 组件、`svelte/internal` 运行时与作用域样式；`apps/web/src/lib/services/official-plugins/plugin-bundle.ts:13` 的 CJS shim 也无法执行 ESM 代码和 CSS。
2. **壁纸逻辑写在宿主里**：`packages/plugins/wallpaper` 只声明了一个 `defineSchema({file})` 表单；而真正的富 UI 散落在宿主——`apps/web/src/lib/boot/wallpaper-plugin.ts:4` 注释写明 "Rich UI lives at host /wallpaper" 并硬编码了路由，另有 `apps/web/src/lib/components/mine/WallpaperScreen.svelte` 组件和 `apps/web/src/lib/app/app-shell.svelte.ts:61` 对 `wallpaper:set/changed/hydrate` 三个事件的镜像处理。这违背了「宿主零特判」原则（宿主代码中不出现针对具体插件的特殊处理）。
3. **SchemaForm 能力不够**：它只有 6 种基础字段类型（`string/password/number/boolean/select/file`），无法表达预览、取色等富交互，继续原地扩展空间有限。

---

## 架构决策

采用 **A（ESM 编译 Svelte 自包含）+ C（受控 Schema 预览原语）混合**方案。当前没有存量用户，所以不需要兼容旧格式：

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

- `scripts/build-official-plugins.ts` 接入 `@sveltejs/vite-plugin-svelte`；`resolve.alias` 指向 `@chronos/core`/`@chronos/ui-kit`/`@chronos/plugin-*` 源码；`build.lib.formats=['es']`；不把 `svelte` 设为外部依赖（版本由插件自己锁定，避免跨大版本兼容问题）；`cssCodeSplit:false` 把作用域样式内联进产物。Tailwind 仍由宿主 `apps/web/src/routes/layout.css` 的 `@source` 扫描（新增了 `@source '../../../../packages/plugins/wallpaper/src'`），插件复用宿主的 `bottom-bar` 等 M3 变量。
- `packages/plugins/wallpaper/bundle/entry.ts` 改为 `export default createWallpaperPlugin({screenComponent: WallpaperScreen})`。`WallpaperScreen.svelte` 复用 `@chronos/ui-kit/TimetablePreviewGrid` 与 `@chronos/core` 计算；`package.json` 新增 `./WallpaperScreen` 导出；`apps/web/vite.config.ts` 与根 `vite.config.ts` 相应新增别名。

### 2. 加载：Blob ESM + 双重校验 + 样式注入

- `apps/web/src/lib/services/official-plugins/plugin-bundle.ts` 新增 `loadEsmPluginFromCode(code)`：单测环境走 CJS（`module.exports`）路径，生产环境把代码包装成 Blob URL 后用动态 `import()` 加载 ESM；若结果只有 `export default` 则再转回 CJS 形态作为回退。`parsePluginBundle` 保留同步 CJS 路径供单元测试使用；`validatePluginManifest` 校验 `bundleFormat==='esm'`（`iife` 仅在单测中兼容）。
- `apps/web/src/lib/services/official-plugins/official-plugin-service.ts` 移除 `migrateLegacyStorage`；`InstalledOfficialPluginRecord` 新增 `cssCode` 字段；`downloadBundle` 同时校验 JS 的 `sha256` 与可选的 `cssSha256`；`loadPluginInstance` 负责样式的注入与移除（通过 `style[data-plugin-id]` 标记），其生命周期与 `activeHandles` 保持同步；`enable/disable/uninstall` 时同步清理。`init` 仍会过滤与 profile 内置插件重复的项。

### 3. 渲染：统一 `component` + 受控预览

- `packages/core/src/types/slots.ts:64` 的注释改为「所有插件可用 `component`（在线插件经 ESM 提供），缺省回退 `schema`」；`PluginScreenSlotContribution.component` 保持 `unknown` 类型，在线 bundle 直接携带已编译的组件。
- `packages/ui-kit/src/plugin-screen/PluginScreenContainer.svelte:47`：有 `component` 时使用 `flex min-h-0 flex-1 flex-col` 布局（不加 `p-4`）；`schema` 分支保留 `p-4` 卡片样式。`apps/web/src/routes/(secondary)/plugins/[pluginId]/[...view]/+page.svelte:27` 传入 `flush={Boolean(screenSlot?.component)}`，使 `SecondaryPageShell:33` 按 `flush ? flex flex-col overflow-hidden : mx-auto p-4` 切换为全屏布局。
- `packages/core/src/schema/schema.ts:3` 新增 `timetable-preview` / `wallpaper-preview` 两种字段类型；对应实现 `packages/ui-kit/src/schema-form/inputs/TimetablePreviewField.svelte`、`WallpaperPreviewField.svelte` 复用 `TimetablePreviewGrid`、`computeTimetableWeekLayout` 与 `COURSE_PALETTE_ENTRIES`；`SchemaForm.svelte` 向字段透传 `controller`。这条路径不需要编译组件，同时作为富 UI 不可用时的降级方案。

### 4. 壁纸收敛范例

- `packages/plugins/wallpaper/src/create-wallpaper-plugin.ts:13`：`wallpaperScreenSchema` 改用 `wallpaper-preview` 字段；「我的」页入口 `mine.item.href` 从 `/wallpaper` 改为 `/plugins/tool-wallpaper`；`shell.route.screen` 同时注册 `component`（完整版）与 `schema`（降级版）。
- 删除宿主侧壁纸实现：`apps/web/src/lib/boot/wallpaper-plugin.ts:4` 改为传入 `WallpaperScreen`；删除 `apps/web/src/routes/(secondary)/wallpaper` 路由与宿主的 `WallpaperScreen.svelte`；`apps/web/src/routes/(secondary)/navigation.ts:5` 移除 `/wallpaper` 条目。
- 保留 `app-shell.svelte.ts:61` 对 `wallpaper:changed/hydrate` 的桥接（课表背景与 `appearance.svelte.ts` 的取色仍依赖它）。新的 `WallpaperScreen` 直接调用 `getWallpaperRuntime().setWallpaper`，错误时通过 `controller.getPluginContext(pluginId).actions.notify` 提示。

---

## 影响与收益

- **富 UI 能力对齐**：在线插件与 Profile 内置插件拥有同等的 `component` 能力；壁纸预览、取色等富交互不再写在宿主里；`SchemaForm` 新增受控预览字段，可覆盖大部分轻量场景。
- **边界保持清晰**：`@chronos/core` 仍然零 DOM 依赖，Svelte 相关实现留在 `ui-kit`；`HierarchicalSlotRegistry` 保持 `ownerPluginId` 追踪与后进先出的释放顺序；`ServiceContainer` 的单测替换点不变。
- **工程更简单**：`bundleFormat` 只剩 `esm` 一种取值；删除了 `iife/module.exports` 生产路径与 `core.marketplace` 迁移逻辑；「双哈希校验 + 同源可信 + 用户自担风险」的安全边界不变。

---

## 验证

- `vp check` / `vp test` 86/86，`node scripts/build-official-plugins.ts` 产 `theme-yumemita 2.14kB` + `tool-wallpaper 172kB` ESM，`vp -C apps/web build` 通过；`displayedWeek is not defined`（`{displayedWeek}` 简写误用）与 `flush`/`bottom-bar` 布局回归已修复。

---

## 后续

- 官方插件清单 `catalog.json` `version:2`，`manifest.minEngineVersion 0.4.0`；
- 新增插件直接 `bundle/entry.ts` 引入 `.svelte`，无需宿主改动；纯配置插件继续 `defineSchema` + `wallpaper-preview` 等原语。
