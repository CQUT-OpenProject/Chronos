# Chronos 架构决策记录

本文档索引了 Chronos 自微内核与插件化重构以来的所有关键架构决策记录（ADR）。

---

## 架构决策索引 (ADR Index)

| 编号                                                                       | 标题                                                  | 状态                   | 涉及范围                      | 核心概述                                                                                                 |
| :------------------------------------------------------------------------- | :---------------------------------------------------- | :--------------------- | :---------------------------- | :------------------------------------------------------------------------------------------------------- |
| [ADR 0001](./0001-microkernel-and-monorepo-modularization.md)              | **微内核与 Monorepo 模块化分层架构**                  | Accepted               | `packages/*`, `apps/*`        | 确立 `@chronos/core` 微内核、`@chronos/ui-kit`、`@chronos/plugins/*` 与 `apps/web` 的分层依赖规则        |
| [ADR 0002](./0002-service-container-and-ports-adapters.md)                 | **服务容器与六边形端口适配器架构**                    | Accepted               | `packages/core`               | 引入 `ServiceContainer` 与标准六边形端口契约（HTTP、Storage、Vault 等），解耦宿主环境                    |
| [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md)         | **分层插槽树与声明式扩展机制**                        | Accepted               | `packages/core`, `ui-kit`     | 建立 `HierarchicalSlotRegistry` 分层路径插槽树与 `SchemaForm` 声明式配置驱动体系                         |
| [ADR 0004](./0004-plugin-architecture-builtin-and-sandbox.md)              | **双轨插件激活与沙箱隔离架构**                        | Superseded by ADR 0011 | `packages/core`               | 历史：Worker 沙箱双轨；已由 ADR 0011 单轨 `loadPlugin` 取代                                              |
| [ADR 0005](./0005-unified-event-pipeline.md)                               | **响应式事件与拦截钩子收敛至统一 EventPipeline**      | Accepted               | `packages/core`               | 废除双轨 `EventBus` 与 `DataPipeline`，收敛为统一的 `EventPipeline` 调度核心                             |
| [ADR 0006](./0006-hardware-credential-vault-via-webauthn-prf.md)           | **基于 WebAuthn PRF 与硬件安全的凭据保险箱**          | Accepted               | `packages/core`, `apps/web`   | 定义 `IVaultService` 硬件加密端口，在 Web 端基于 WebAuthn PRF 衍生 AES-GCM 密钥保护教务凭据              |
| [ADR 0007](./0007-plugin-profile-and-preset-assembly.md)                   | **基于 Profile 的高校预设包与插件装配体系**           | Accepted               | `packages/core`, `profiles/*` | 引入 Profile 与 `ProfileManager`，支持按高校零冗余定制装配与独立发行                                     |
| [ADR 0008](./0008-host-decoupling-and-deep-ingest-seam.md)                 | **宿主与插件解耦深化、端口纯粹化及全槽位摄取演进**    | Accepted               | `apps/web`, `packages/*`      | 废除导入来源双轨枚举，纯粹化存储端口，剥离宿主特定源 UI 胶水与清理死代码                                 |
| [ADR 0009](./0009-deep-architecture-convergence-and-dead-code-purge.md)    | **架构深化收敛、双轨清理与死代码彻底剥离**            | Accepted               | `packages/*`, `apps/web`      | 彻底插槽化导入管道，剥离宿主影子模型与残留胶水，消除排版跨层泄漏与修复死引用                             |
| [ADR 0010](./0010-host-state-collapse-and-architecture-deepening.md)       | **宿主状态折叠、双轨消除与架构深化收敛**              | Accepted               | `packages/core`, `apps/web`   | 废除 AppState 影子模型，清除 Dexie 壁纸残余，消除 Profile 双重注册，统一槽位哈希与事件契约               |
| [ADR 0011](./0011-single-track-official-plugin-install.md)                 | **单轨官方插件与 manifest 在线安装**                  | Accepted               | `packages/core`, `apps/web`   | 退役 Worker 沙箱双轨，统一 `loadPlugin`；官方 catalog + manifest URL 在线安装                            |
| [ADR 0012](./0012-online-plugin-rich-ui-via-esm-and-controlled-preview.md) | **在线插件富 UI：ESM 编译 Svelte 与受控 Schema 预览** | Accepted               | `packages/*`, `apps/web`      | ESM 自包含 Svelte 编译进 bundle，Blob 导入 + 双哈希；新增 timetable/wallpaper 预览原语，壁纸 UI 回归插件 |
| [ADR 0013](./0013-import-pipeline-slot-closure-and-deep-convergence.md)    | **导入管道插槽化闭环、微内核事件收敛与徽章双轨统一**  | Accepted               | `packages/*`, `apps/web`      | 导入管道挂载组件闭环并保持 UI 一致，微内核剥离 wallpaper 事件，徽章双轨统一与 ESM 单轨加载               |
