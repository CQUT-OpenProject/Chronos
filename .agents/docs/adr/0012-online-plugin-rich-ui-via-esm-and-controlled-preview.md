# ADR 0012: 在线插件富 UI — ESM 独立编译 Svelte 与受控 Schema 预览

- **状态**: Accepted
- **日期**: 2026-08-21
- **关联提交**: `c698656`, `f796ea8`, `aa723e7`, `2215c00`, `94c6436`, `9fc3495`, `428b495`, `63c0046`, `7da4a43`, `ca4d7f5`
- **范围**: 官方插件体系 (`scripts/build-official-plugins.ts`, `packages/core`, `packages/ui-kit`, `packages/plugins/wallpaper`, `apps/web`)

---

## 背景与问题

ADR 0011 确立了单轨在线插件分发机制，但在将课表壁纸等强交互能力移出核心包时遇到以下挑战：

1. **复杂交互难以用声明式表单承载**：`SchemaForm` 适合纯配置项，但课表壁纸需要图片裁切、网格透明度即时调整、实时缩放预览与 IndexedDB 图像缓存，纯 JSON Schema 无法胜任；
2. **直接在浏览器编译 Svelte 成本高**：浏览器端运行时编译 Svelte 会导致宿主额外引入数兆字节的编译依赖，且缺乏类型安全与 Tailwind 样式注入；
3. **缺少针对特定领域的富预览契约**：课表背景调整需要实时渲染课表网格，若由插件自行实现网格渲染则会导致核心排课逻辑重复且 UI 不一致。

---

## 架构决策

```mermaid
flowchart TD
    subgraph BuildTime [构建期 (Node.js / Vite)]
        PluginSrc["插件源码 (Svelte 5 + TS)"] --> ViteBundle["Vite ESM Bundle (inline Svelte runtime)"]
        ViteBundle --> OutputJS["static/official-plugins/bundles/{id}.bundle.js"]
        ViteBundle --> OutputCSS["static/official-plugins/manifests/{id}.css"]
        ViteBundle --> Manifest["manifest.json (含 JS/CSS SHA-256)"]
    end

    subgraph Runtime [运行时 (浏览器)]
        Fetch["下载 Manifest + JS + CSS"] --> Verify["双 SHA-256 完整性校验"]
        Verify --> DynamicImport["Blob URL / dynamic import()"]
        DynamicImport --> Mountable["Symbol.for('chronos.mountable') 组件"]
        Mountable --> Outlet["PluginScreenContainer / MountableSlotOutlet"]
    end
```

### 1. 构建期 ESM 打包机制

- 官方插件构建脚本 `scripts/build-official-plugins.ts` 基于 Vite 将插件编译为自包含的 ESM 模块；
- Svelte 5 客户端运行时直接内联进各插件 bundle 中，CSS 单独提取并通过 Manifest 中的 `cssSha256` 独立分发；
- 宿主加载插件时将代码转换为 `Blob URL` 后通过原生 `import()` 载入，确保完全标准的 ESM 加载行为。

### 2. 标准组件挂载契约 (`ChronosMountable`)

- 插件通过 `createSvelteMountable(Component, propsMapper)` 导出标准挂载对象；
- 对象携带 `Symbol.for('chronos.mountable')` 唯一标识，包含 `mount(target, props)` 与 `unmount()` 确定性生命周期；
- `@chronos/ui-kit` 提供 `PluginScreenContainer`，负责安全挂载、Props 响应式同步及卸载时的 DOM 与事件清理。

### 3. 受控预览组件与通用渲染原语

- 宿主与 `@chronos/ui-kit` 提供受控的通用预览原语（如 `TimetablePreviewGrid`），插件无需自行实现复杂的课表排版；
- 插件仅需声明预览配置与图层参数，由通用预览容器统一渲染，确保各插件视觉与排版表现高度统一。

---

## 影响与收益

- **完整交互能力**：插件支持使用 Svelte 5 编写任意高保真交互界面，打破了声明式配置表单的能力边界；
- **零运行时编译负担**：Svelte 编译全部前置在构建期完成，宿主运行时无需加载任何编译器代码；
- **样式与逻辑确定性隔离**：独立 CSS 与基于 Symbol 的组件生命周期管理，避免全局样式污染与内存泄漏。

---

## 验证

- `vp check` 与 `vp test` 全量通过；
- 官方插件独立编译产物成功运行，课表壁纸插件的图片上传、缩放、透明度调节及实时网格预览表现流畅无卡顿。
