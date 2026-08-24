# 架构地图

改动 `packages/` 下的任何内容之前，请先阅读本文。本文是一张有序地图：描述系统由什么组成、各部分负责什么、如何协作；类型定义与字段细节见[参考](../reference/ports.md)，决策缘由见对应的 [ADR](/adr/)。

## 分层拓扑

| 包                                    | 角色                                                                                 | 可依赖                                   |
| ------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| `apps/web`                            | Web 宿主：SvelteKit 外壳、页面路由、Dexie/HTTP 适配器、transfer-state 导入流         | core、ui-kit、plugins（经 Profile 装配） |
| `packages/core` (`@chronos/core`)     | 微内核：引擎、服务容器、插槽树、领域模型、Schema 校验                                | 无运行时依赖                             |
| `packages/ui-kit` (`@chronos/ui-kit`) | 与内核配套的 Svelte 组件库：响应式控制器、SchemaForm、插槽出口                       | core                                     |
| `packages/plugins/*`                  | 内置/官方插件（source-cqut、codec-share、codec-qrcode、wallpaper、theme-yumemita）   | core、ui-kit；彼此不依赖                 |
| `packages/codec-kit`                  | 构建期共享字节编解码原语（deflate/base64/CRC/varint/bitmask），普通 npm 依赖，非插件 | —                                        |

依赖规则只有一条方向：**宿主装配插件，插件不感知宿主**。插件之间禁止互相 import——共享原语走 `codec-kit` 这类公共库。

## 核心概念

### ChronosEngine

`@chronos/core` 的中枢对象，持有领域状态、动作分发（`createTimetable` / `importTimetable` / `saveCourse` …）、`EventPipeline` 事件总线与插槽注册表。所有写操作都是引擎动作，视图层通过 `ReactiveChronosController` 订阅状态快照。

### 服务容器与端口

`ServiceContainer` 注册五个标准端口：`IHttpService`、`IStorageService`、`IVaultService`（可选）、`IRuntimeService`、`IAnalyticsService`（可选）。宿主在启动时把平台适配器（Dexie、fetch、WebAuthn 等）注册进去，此后运行时代码一律经容器或 `ctx.service(...)` 取能力，不直接触碰平台 API。契约详见[端口契约](../reference/ports.md)。

### 分层插槽树

`HierarchicalSlotRegistry` 以分层路径（如 `import.source.tab`、`shell.bottom-bar.tab`）组织扩展点。插件在 `apply(ctx)` 中调用 `ctx.registerSlot(slotName, contribution)` 声明贡献，卸载时自动撤销。多贡献者默认共存并按 `order` 排序；同 id 后注册覆盖前者并在开发期告警。标准槽位全集见[槽位目录](../reference/slots-catalog.md)。

### ScopedContext

每个插件激活时会拿到一个 `ScopedContext`（实现 `ChronosContext` 接口），其中包含：按插件隔离的配置、以 pluginId 自动命名空间的私有存储、i18n 运行时、只读状态快照和动作分发器。插件能访问的一切都通过它。

## 插件的两条激活轨

1. **Profile 内置轨**：`ProfileManager` 按 profile 清单在启动时以进程内方式 `apply` 内置插件。Profile 决定装配哪些插件与四层合并后的默认配置。
2. **官方在线轨**：`OfficialPluginService` 是对外门面，内部由四个模块分工完成——catalog 客户端、资产管线（下载 manifest 与 bundle 并做 SHA-256 双哈希校验）、已安装记录存储、运行时激活器——最终同样调用 `engine.loadPlugin`。JSON-only 主题（不含 JS）经一个不涉及 UI 的 `ScopedContext` 直接注册资产。

两条轨共享同一引擎生命周期与插槽 owner 追踪；没有 `plugin.inject` 依赖拓扑，可选能力用 `ctx.service(...)` 探测。

## 导入管道

```
import.source.tab 插槽（每数据源一个贡献）
        │ executeImport(inputs)
        ▼
宿主 transfer-state（唯一流程属主）
   预览持久化 → 确认页（confirmSchema / confirmComponent）
   → finalizePreview 合并确认输入 → engine.importTimetable
```

- 数据源插件只实现 `executeImport` 与可选的确认阶段钩子，不触碰 UI 路由。
- `/s` 分享链接落地页由 `deepLink.fromLocation` 元数据统一分发：宿主不需要知道任何具体的链接格式。
- 失败用结构化的 `ImportSlotError`（kind：`no-data` / `invalid-data` / `network` / `unsupported` / `unknown`）传递。

## 事件与动态配色

引擎事件经统一 `EventPipeline` 分发（`emit` / `on`）。主题相关的 `dynamicColor:set/changed/hydrate` 是内核泛化契约：壁纸等插件发事件，宿主 `app-shell` 桥接到 `dynamicColorUri` 并调用当前主题的 `dynamicColorAdapter` 上色。引擎内部的 serial/waterfall 钩子机制处于 FROZEN BASELINE（两个发布周期无真实注册者则整体移除），不要新增消费。

## 主题系统

主题是 `theme.definition` 插槽的贡献：封闭的 workbench 颜色键 + 设计令牌 + 课程画笔；图标主题不再独立选择，由激活配色方案的 `recommendedIconTheme` 派生。详见[主题契约](../reference/themes.md)。

## 深读路径

按时间线完整记录设计取舍的是 [ADR 索引](/adr/)。建议顺序：

1. [ADR 0001](/adr/0001-microkernel-and-monorepo-modularization) 微内核与 Monorepo 分层
2. [ADR 0003](/adr/0003-hierarchical-slot-registry-and-extensibility) 分层插槽树与声明式扩展
3. [ADR 0011](/adr/0011-single-track-official-plugin-install) 单轨官方插件安装
4. [ADR 0023](/adr/0023-round4-gate-typing-dead-face-component-single-track) Round 4 门禁与单轨化
5. [ADR 0027](/adr/0027-round6-architecture-subtraction) Round 6 架构减法（最新基线）
