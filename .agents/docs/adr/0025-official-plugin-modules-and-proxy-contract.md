# ADR 0025: 官方插件安装模块拆分与服务端代理契约

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `7fe3892`, `1b47f77`, `8cc2b02`, `a92b2dc`
- **关联**: 衔接 ADR 0011 官方插件安装、ADR 0002 端口适配器与 ADR 0008
- **范围**: `apps/web/src/lib/services/official-plugins`, `packages/core/src/types/plugin-server.ts`, `apps/web/src/lib/server/plugin-proxy`, `apps/web/src/lib/providers/plugin-proxy-http.ts`, `packages/plugins/source-cqut`

---

## 背景与问题

在官方插件在线安装与服务端代理的早期实现中：

1. **服务文件过于庞大混乱**：`OfficialPluginService` 承担了下载、哈希校验、解包、激活、持久化和卸载等全部职责，代码行数过多，难以针对性单测；
2. **服务端跨域代理协议缺乏强类型约束**：针对教务系统的代理网络请求（Proxy）未在微内核中定义统一的数据信封（Wire Contract），导致客户端与服务端通信格式松散。

---

## 架构决策

```mermaid
flowchart TD
    subgraph ModularService [OfficialPluginService (薄 Facade 门面)]
        Downloader[PluginDownloader - 下载与校验]
        BundleParser[PluginBundleParser - 模块解析]
        Activator[RuntimeActivator - 运行时装配]
        Store[PluginStorageManager - 状态存储]
    end

    subgraph WireContract [微内核标准代理协议]
        Contract["PluginServerResponse<T>
(packages/core/src/types/plugin-server.ts)"]
    end

    ModularService --> WireContract
```

### 1. 将官方插件服务重构为职责单一的深层模块

将庞大的服务拆分为四个职责单一的内部模块，并对外提供精简的门面（Facade）接口：

- **`PluginDownloader`**：专注 Manifest 与 Bundle 资源的下载重试与 SHA-256 完整性校验；
- **`PluginBundleParser`**：负责 Blob URL 转换、ESM 动态 import 与 Mountable 组件契约验证；
- **`RuntimeActivator`**：专注管理插件在微内核中的生命周期激活、依赖注入与插槽挂载；
- **`PluginStorageManager`**：负责已安装插件清单的本地存储与缓存同步。

### 2. 微内核定义统一的服务端代理协议

- 在 `@chronos/core` 中正式定义 `PluginServerResponse<T>` 强类型信封（包含 `code`, `message`, `data`, `cookies` 等字段）；
- `IHttpService.proxy` 方法入参及返回严格遵循此信封契约，客户端与服务端实现双向类型对齐。

---

## 影响与收益

- **高内聚低耦合**：插件安装的全部副作用清晰收敛在 `RuntimeActivator` 中，各子模块可独立进行高质量单元测试；
- **契约单源维护**：服务端代理通信格式由核心统一管理，消除了客户端与后端代理之间的口径漂移；
- **易于复用**：未来若新增需要后端代理的高校数据源插件，可直接复用成熟的 `PluginServerResponse` 协议。

---

## 验证

- `vp check` / `vp test` 全量通过；
- 官方插件下载、哈希校验失败拦截、动态激活与代理教务拉取各链路单测均正常通过。
