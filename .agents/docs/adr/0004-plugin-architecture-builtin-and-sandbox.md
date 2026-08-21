# ADR 0004: 双轨插件激活与沙箱隔离架构 (Builtin vs Sandbox)

- **状态**: Superseded by [ADR 0011](./0011-single-track-official-plugin-install.md)
- **日期**: 2026-08-19
- **关联提交**: `1d4f327`, `693cb4f`, `0f5612f`, `76db36a`, `7def476`, `b84b2ff`, `c7606d9`
- **范围**: 插件执行体系 (`packages/core/src/types/sandbox.ts`, `packages/core/src/types/marketplace.ts`)

---

## 背景与问题

Chronos 面向两类不同的插件场景：

1. **官方/高校深度定制插件**：需要极致的运行效率、无网络开销、直接操作引擎上下文；
2. **社区与第三方市场插件**：存在不可控的代码执行风险，必须防止窃取 IndexedDB 敏感数据或污染全局原型链。

若统一采用 Worker 沙箱，会给官方轻量级插件带来不必要的序列化开销；若统一采用进程内执行，则完全丧失了安全性。

---

## 架构决策

确立**官方内置插件与第三方市场插件的双轨激活体系**（Intentional Dual-track）：

```mermaid
flowchart TD
    subgraph Track1 [轨道一：内置插件 (Profile Builtin)]
        Profile[ProfileManager / Preset] --> ScopedCtx[ScopedContext]
        ScopedCtx --> InProcess[进程内直接执行 plugin.apply(ctx)]
    end

    subgraph Track2 [轨道二：第三方市场插件 (Marketplace Sandbox)]
        Marketplace[MarketplaceService] --> Bridge[WorkerPluginBridge]
        Bridge <== JSON-RPC / postMessage ==> Worker[WebWorker 隔离沙箱]
        Worker --> SandboxPlugin[沙箱插件执行]
    end
```

### 1. 轨道一：内置插件（In-Process Builtin）

- 由 `ProfileManager` 在引擎启动时直接加载；
- 运行在主进程中，通过 `ScopedContext` 提供自动按 `pluginId` 隔离的命名空间存储与受控服务访问。

### 2. 轨道二：市场插件（Worker Sandbox）

- 由 `MarketplaceService` 动态下载与管理；
- 运行在独立的 Web Worker 沙箱隔离环境中；
- 通过 `WorkerPluginBridge` 与 `WorkerProtocol` 严格基于消息序列化进行插槽注册与服务调用，阻断全局 DOM 与未经授权的存储访问；
- 无 Worker 环境（如 SSR 或测试环境）下提供 `InProcessSandboxAdapter` 标准进程内降级适配器。

---

## 影响与收益

- **Security & Performance Balanced（安全与性能兼顾）**：官方核心模块获得零损耗性能，社区扩展具备严格的权限与执行边界；
- **Unified Slot Protocol（统一协议契约）**：无论是进程内还是沙箱插件，对外暴露的插槽能力契约完全一致，对上层 UI 表现完全透明。
