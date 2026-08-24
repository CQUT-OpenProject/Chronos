# ADR 0013: 导入管道插槽化闭环、微内核事件收敛与徽章双轨统一

- **状态**: Accepted
- **日期**: 2026-08-22
- **关联提交**: `324d295`, `b516c98`, `12aae54`, `18f1324`
- **关联**: 细化 [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md)、[ADR 0009](./0009-deep-architecture-convergence-and-dead-code-purge.md)、[ADR 0012](./0012-online-plugin-rich-ui-via-esm-and-controlled-preview.md)
- **范围**: 导入插槽体系、微内核事件与徽章契约、ESM 单轨加载与宿主解耦 (`packages/core`, `packages/plugins/*`, `apps/web`)

---

## 背景与问题

ADR 0012 引入在线插件富 UI（ESM 编译 Svelte 的自包含挂载能力）之后，架构中仍存在几处历史遗留问题与「双轨现象」（同一功能存在两套做法）：

1. **导入管道没有完全走插槽**：
   - 宿主 `TransferImportScreen.svelte` 内部硬编码了三条专用分支与手写逻辑，分别对应 `cqut-online`（知行理工表单）、`share-link`（剪贴板卡片）、`edu-html`（HTML 文件选择）；
   - 历史上曾尝试改由 `inputSchema` 驱动，但通用 `SchemaForm` 表达不了 Material 3 风格的精细表单卡片、离线提示、WebAuthn PRF 凭据列表与快捷验证、一键剪贴板导入等富交互，只能退回手写 UI；
   - 结果是第三方课表源插件无法零改动接入；宿主导入状态层 `transfer-state.svelte.ts` 里也存在针对具体插件的硬编码和对插件常量的反向 import。

2. **壁纸私有事件写进了微内核**：
   - `wallpaper:set`、`wallpaper:changed`、`wallpaper:hydrate` 三个事件硬编码在 `@chronos/core` 的 `ChronosEvents` 接口中。内核应当与具体业务无关，这破坏了它的通用性。

3. **徽章系统有两套契约**：
   - 微内核同时保留了已废弃的 `CourseBadgeContribution`（通过 `projectBadges` 计算）与 ADR 0003 的插槽契约 `CourseBadgeSlotContribution`，两套并存造成重复维护。

4. **插件加载器残留 CJS eval 兼容层**：
   - `plugin-bundle.ts` 仍保留 `parseCjsBundle` / `isLikelyCjs` / `new Function` 兜底与正则替换代码，还没有成为纯 ESM 单一路径。

5. **宿主层的反向依赖与死代码**：
   - `app-shell.svelte.ts` 在 `clearAllData` 中直接引用了 `source-cqut` 插件私有的凭据存储 key；壁纸插件内部还残留未使用的存储函数。

---

## 架构决策

```mermaid
flowchart TD
    subgraph Core["@chronos/core (微内核)"]
        EventPipeline["EventPipeline\n(CustomChronosEvents 扩展)"]
        BadgeManager["BadgeManager\n(单契约 CourseBadgeSlotContribution)"]
        ScopedContext["ScopedContext\nregisterSlot 自动路由"]
    end

    subgraph Plugins["@chronos/plugins (插件包)"]
        SourceCqut["source-cqut\nCqutOnlineImportTab.svelte\nEduHtmlImportTab.svelte"]
        CodecShare["codec-share\nShareLinkImportTab.svelte"]
        Wallpaper["wallpaper\nCustomChronosEvents 声明\nWallpaperScreen.svelte"]
    end

    subgraph Host["apps/web (宿主层)"]
        TransferScreen["TransferImportScreen.svelte\n(activeSlot.component ?? SchemaForm 动态驱动)"]
        TransferState["transfer-state.svelte.ts\n(previewWithSlot 统一单出口)"]
        ESMLoader["plugin-bundle.ts\n(Blob URL / Data URL 纯 ESM 单轨)"]
    end

    SourceCqut -->|挂载 component| TransferScreen
    CodecShare -->|挂载 component| TransferScreen
    Wallpaper -->|declare module| EventPipeline
    ScopedContext -->|timetable.cell.badge 路由| BadgeManager
    TransferScreen --> TransferState
    ESMLoader -->|动态 import| Host
```

### 1. 导入管道插槽化闭环（保持 UI 像素级一致）

- 在 `@chronos/plugin-source-cqut` 中创建 [`CqutOnlineImportTab.svelte`](file:///Users/uednd/code/Chronos/packages/plugins/source-cqut/src/CqutOnlineImportTab.svelte)（知行理工账号密码登录、离线提示、WebAuthn 凭据列表、验证与清除）与 [`EduHtmlImportTab.svelte`](file:///Users/uednd/code/Chronos/packages/plugins/source-cqut/src/EduHtmlImportTab.svelte)（教务系统 HTML 文件选择与解析）；
- 在 `@chronos/plugin-codec-share` 中创建 [`ShareLinkImportTab.svelte`](file:///Users/uednd/code/Chronos/packages/plugins/codec-share/src/ShareLinkImportTab.svelte)（剪贴板一键读取与口令解析）；
- 插件在 `apply()` 注册 `import.source.tab` 插槽时挂载 `component` 与 `inputSchema`（作为降级兜底）；
- `TransferImportScreen.svelte` 改为按 `activeSlot.component` 动态挂载组件，没有组件时回退到 `SchemaForm`；**删除了全部硬编码的来源分支，同时 UI 布局与交互体验保持像素级一致**；
- `transfer-state.svelte.ts` 收拢为通用出口 `previewWithSlot(tabId, inputs)`，移除对插件常量的反向依赖。

### 2. 壁纸事件移出微内核

- 从 `@chronos/core` 的 `ChronosEvents` 中删除 `wallpaper:set`、`wallpaper:changed`、`wallpaper:hydrate`；
- 在 `@chronos/plugin-wallpaper` 中通过 TypeScript 模块增强（`declare module '@chronos/core'`）把这些私有事件扩展到 `CustomChronosEvents`，事件定义归插件所有。

### 3. 徽章契约合并为一套

- 删除已废弃的 `CourseBadgeContribution` 及 `projectBadges`，微内核徽章契约统一为 `CourseBadgeSlotContribution`；
- `BadgeManager` 改为只适配这一套契约并结合上下文同步计算；
- `ScopedContext.registerSlot('timetable.cell.badge')` 注册时自动路由到 `host.badges`。

### 4. 在线插件加载器只保留 ESM 一条路径

- 移除 `plugin-bundle.ts` 中的 `new Function` / `parseCjsBundle` / CJS eval 回退代码；
- 浏览器环境使用 Blob URL 动态加载 ESM，Node / Vitest 测试环境使用 Data URL 动态加载 ESM；
- `validatePluginManifest` 严格校验 `bundleFormat === 'esm'`。

### 5. 宿主层解耦与死代码清理

- `app-shell.svelte.ts` 中 `clearAllData` 简化为直接调用 `controller.clearAllData()`，消除对 `source-cqut` 私有凭据存储 key 的逆向依赖；
- 移除壁纸插件中未使用的存储函数（`saveWallpaperBytes`、`clearLocal`、`clearPersisted`）。

---

## 插件体积（ESM Svelte 化后）

各插件使用 Vite / Rolldown 打包为独立 ESM bundle 后的产物体积：

| 插件 ID          | 插件名称           | 产物格式   | Bundle 体积 (未压缩) | Gzip 压缩后体积 | 说明                                                    |
| :--------------- | :----------------- | :--------- | :------------------- | :-------------- | :------------------------------------------------------ |
| `theme-yumemita` | YUMEMITA 主题      | ESM (`es`) | **2.14 kB**          | **1.03 kB**     | 轻量主题令牌与排版                                      |
| `source-cqut`    | 重庆理工知行理工源 | ESM (`es`) | **62.89 kB**         | **20.09 kB**    | 含登录/离线/凭据/HTML解析完整富 UI                      |
| `tool-wallpaper` | 课表壁纸           | ESM (`es`) | **188.60 kB**        | **45.11 kB**    | 含 Material 3 取色引擎、图片压缩、壁纸设置完整富 UI     |
| `codec-share`    | 分享短链编解码     | ESM (`es`) | **1.43 MB**          | **676.80 kB**   | 含 brotli-wasm 完整 WebAssembly 压缩二进制与剪贴板富 UI |

---

## 结论与后续

本决策完成后，Chronos 的导入体系实现了**插件自带富 UI 挂载**，微内核不再包含任何具体导入源的知识。任何第三方或高校插件都可以用同样的方式声明自己的导入卡片富 UI（或 Schema 降级版本），宿主不需要为此修改任何代码。

---

## 修订记录

- 2026-08-22 · [ADR 0016](./0016-round3-convergence-and-deprecated-removal.md) §2：将本文 §2 的 wallpaper 专用事件策略修订为泛化 `dynamicColor:*` 内核契约。
