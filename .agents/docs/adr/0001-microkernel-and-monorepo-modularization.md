# ADR 0001: 微内核与 Monorepo 模块化分层架构

- **状态**: Accepted
- **日期**: 2026-08-19
- **关联提交**: `693797e`, `40eada3`, `97592eb`, `5c2fa30`, `bc3dc5c`, `918c252`, `c5e45ca`, `345e1b9`, `0dad3ef`, `6b28539`, `fd30d9d`, `900fbfc`, `b493c43`, `1fe7ebc`, `200cf04`, `852ddca`, `1471fa2`, `29ba0ba`, `1c7096c`
- **范围**: 全仓架构拓扑 (`packages/core`, `packages/ui-kit`, `packages/plugins/*`, `apps/web`)

---

## 背景与问题

Chronos 原先为单一的 SvelteKit Web 应用，所有领域模型、排课算法、特定高校解析器、本地存储以及 UI 视图紧密耦合在 `src/lib` 目录中。随着项目演进，出现以下痛点：

1. **跨端与多宿主扩展受阻**：核心业务规则（排课算法、时间推算、领域实体）与 Web DOM / SvelteKit 强绑定，无法复用于 Native 或无头测试环境；
2. **高校特性侵入通用核心**：特定高校（如重庆理工大学 CQUT）的认证与解析逻辑直接散落在通用排课流程中；
3. **缺少清晰的模块深度与隔离界限**：缺乏分层依赖约束，容易形成浅层相互引用的网状依赖。

---

## 架构决策

将项目重构为基于 pnpm/Vite+ Workspaces 的多包 Monorepo 架构，并确立**微内核 (Microkernel)** 核心引擎与外围模块的分层依赖规则：

```mermaid
flowchart TD
    App[apps/web\n宿主应用程序] --> UIKit[@chronos/ui-kit\n通用组件与响应式外壳]
    App --> Plugins[@chronos/plugins/*\n业务与高校特性插件]
    Plugins --> Core[@chronos/core\n微内核引擎与纯领域模型]
    UIKit --> Core
```

### 1. 核心分包拓扑

- **`packages/core`（微内核引擎）**：
  - 拥有核心领域实体（`Timetable`, `Course`, `AcademicConfig`, `UserPreferences`）；
  - 拥有纯排课与时钟算法（`computeTimetableWeekLayout`, `placeCapsules`, `PeriodClockService`）；
  - 拥有运行时控制调度中心（`ChronosEngine`, `ServiceContainer`, `HierarchicalSlotRegistry`, `EventPipeline`）；
  - **零 DOM 依赖、零特定高校依赖、纯 TypeScript 运行环境**。
- **`packages/ui-kit`（UI 契约与外壳套件）**：
  - 提供响应式控制器桥接（`ReactiveChronosController`）；
  - 提供声明式表单引擎（`SchemaForm`）与动态插槽出口（`SlotOutlet`, `PluginScreenContainer`）；
  - 提供 Material 3 动态色彩与设计系统基元。
- **`packages/plugins/*`（细粒度能力插件）**：
  - 将所有外部集成、高校适配、主题及特定工具拆解为独立插件包（如 `source-cqut`, `codec-share`, `theme-yumemita`, `wallpaper`）。
- **`apps/web`（Web 宿主应用）**：
  - 作为纯净的装配外壳，负责向 `ChronosEngine` 提供 Web 平台能力适配器（Dexie 存储、WebAuthn、Fetch、PWA 注册等），并挂载 SvelteKit 页面路由。

---

## 影响与收益

- **局部性**：通用排课算法、特定高校解析与平台持久化各放在自己的包里，职责明确；
- **易测试性**：核心包 `@chronos/core` 只依赖纯 Node 环境，测试不需要浏览器，可在秒级完成；
- **可扩展性**：新增高校数据源或平台端（如 Native 客户端）只需实现对应的插件或宿主适配器，不需要修改核心排课逻辑。
