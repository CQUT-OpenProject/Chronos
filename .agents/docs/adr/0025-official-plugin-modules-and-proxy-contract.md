# ADR 0025: 官方插件安装 module 拆分与 Plugin-server Proxy 类型契约

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `7fe3892`, `1b47f77`, `8cc2b02`, `a92b2dc`
- **关联**: 闭环架构评审候选 1–2；衔接 ADR 0011、0023 §5、0002、0008
- **范围**: `apps/web/src/lib/services/official-plugins`, `packages/core/src/types/plugin-server.ts`, `apps/web/src/lib/server/plugin-proxy`, `apps/web/src/lib/providers/plugin-proxy-http.ts`, `packages/plugins/source-cqut`

---

## 背景与问题

Round 4 之后主链路已经整理到位，但仍有两处缝隙，损害 locality（相关知识集中一处）与 test leverage（同一套设施支撑多个测试）：

1. **`OfficialPluginService`**（~400 LOC）把 catalog 拉取、SHA 校验、Dexie 持久化、ESM 运行时、ScopedContext 主题注册、CSS DOM 注入与 lifecycle FSM 全部混在同一个 class 内；内部没有独立的 seam（可单独替换的接缝），测试只能 mock 整棵 engine。
2. **Plugin-server proxy** 的 wire 信封 `{ ok, payload?, error? }` 在 handler、dispatch、HTTP adapter、插件 client 五处重复声明；`dispatch.ts` 没有契约单测。CQUT server 内部已经整理到位，但跨 seam 的传输层在 core 中没有单源类型。

## 架构决策

### 1. 官方插件四深 module + 薄 facade

在 `apps/web/src/lib/services/official-plugins/` 拆分：

| Module                           | 职责                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| `OfficialPluginCatalogClient`    | `fetchCatalog` / `fetchManifest` + manifest 校验                      |
| `OfficialPluginAssetPipeline`    | 按 manifest 下载 bundle/colors/icon/css，SHA-256 校验                 |
| `OfficialPluginInstalledStore`   | `installed_plugins` 读写、change 通知、builtin overlap dedup          |
| `OfficialPluginRuntimeActivator` | load/unload：CSS、ESM、`engine.loadPlugin`、JSON 主题 `ScopedContext` |
| `OfficialPluginService`          | lifecycle 编排 + notify；**public API 不变**                          |

必须维持的不变量：存储键 `core.official-plugins` / `installed_plugins` 不变；JSON-only 主题仍经 `ScopedContext` 注册（ADR 0023 §5）；`plugin-bundle.ts` 保持独立文件。

### 2. Plugin-server wire 契约（core 单源）

在 `packages/core/src/types/plugin-server.ts` 新增：

- `PluginServerErrorKind` / `PluginServerError`
- `PluginServerResponse<T>`
- `pluginServerSuccess` / `pluginServerError` / `parsePluginServerResponse` / `pluginServerErrorMessage`

`IHttpService.proxy` 的签名保持不变（ADR 0002）。契约只作用于 HTTP body，不把端口泛型化。

CQUT server 内部的 `AppResult` 与 wire 层的 `PluginServerResponse` 属于不同分层，不合并。

### 3. 明确不做

- 不引入 Worker / 第二激活轨（ADR 0011）
- 不把 catalog 元数据搬进插件源码 import（ADR 0023 §7）
- 不把 `OfficialPluginService` 下沉 `@chronos/core`
- 不在 core 引入 SvelteKit `json()` 依赖
- 不把 `IHttpService.proxy` 改为泛型 `proxy<TReq, TRes>`

## 影响与收益

- **Locality**：官方插件安装的全部副作用集中于 `RuntimeActivator` 一个模块；proxy 信封在 core 单源
- **Depth**：facade 的接口很薄；四个 module 可独立做单测
- **Leverage**：将来出现第二个 server plugin 时，可直接复用 `PluginServerResponse` 与接入清单

## 验证

- `vp check` + `vp test -- --run`
- `npm run verify:official-plugins`
- CQUT 在线导入、官方插件 enable/disable 手动回归
