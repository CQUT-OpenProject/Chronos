# 端口契约

宿主平台能力经 `ServiceContainer` 以五个标准端口注入。运行时代码（引擎、插件）一律通过容器或 `ctx.service(...)` 访问，不允许直接触碰平台 API。类型定义见 `packages/core/src/types/services.ts`。

| 端口                | 必需 | 职责                                                      |
| ------------------- | ---- | --------------------------------------------------------- |
| `IHttpService`      | 是   | 网络请求与可选会话；`proxy` 供插件服务端调用              |
| `IStorageService`   | 是   | 课表、偏好、壁纸、插件 KV 的结构化持久化                  |
| `IVaultService`     | 否   | 加密凭据保险箱（原生 Keychain/Keystore）；**不是通用 KV** |
| `IRuntimeService`   | 是   | 平台标识 + SHA-256（Round 6 后仅此两项）                  |
| `IAnalyticsService` | 否   | 匿名产品统计，未注册时静默                                |

## IHttpService

```ts
request(url, options?: HttpRequestOptions): Promise<HttpResponse>
proxy?(pluginId, action, payload, options?): Promise<HttpResponse>
```

- `HttpRequestOptions` 支持 `method` / `headers` / `body`（string 或 Uint8Array）/ `timeoutMs` 与 `bypassCors`（由原生宿主兑现）。
- `proxy` 把载荷 POST 到 `/api/plugins/{pluginId}/{action}`；响应信封必须是 core 单源的 `PluginServerResponse<T>`（`pluginServerSuccess` / `pluginServerError` / `parsePluginServerResponse`）。签名保持非泛型——契约作用于 HTTP body（[ADR 0025](/adr/0025-official-plugin-modules-and-proxy-contract)）。

## IStorageService

课表 CRUD + 活动课表指针 + 偏好读写 + 按 pluginId 自动命名空间的 KV（`getPluginData` 等）+ 可选的 `clearAllData` / `estimateStorageBytes` / `onChanged`。

**RESERVED**：`queryCourses(filter)` 提供跨课表课程查询，当前零生产消费者。它是 Round 4 的保留决策：不要"清理"它，也不要在出现真实消费者前扩展（复核时间见冻结基线说明）。

## IVaultService

硬件安全凭据存取：`isSupported` / `storeSecret` / `getSecret` / `removeSecret`，可要求生物识别。语义约束：

- 只存放高敏感小秘密（如教务凭据），不是通用键值库；
- Web 端实现已随 [ADR 0017](/adr/0017-webauthn-credential-retirement) 退役，端口本身保留给原生宿主；engine 仅在 `env.vault` 存在时注册。

## IRuntimeService

`platform: 'web' | 'ios' | 'android' | 'node'` 与 `sha256(data)`。计时器与 UTF-8 辅助成员已在 Round 6 修剪（零消费即删）。

## IAnalyticsService

单一 `track(event, properties?)`。经 `ChronosEnv.analytics → container` 注册；未配置密钥的构建不启用埋点，运行时调用应容忍端口缺失。

## 宿主装配规则

`ChronosEnv` 只是宿主引导适配器（web + native）。构造后由 `registerEnvProviders` 把各端口复制进容器；所有宿主必须在构造时传入 `env`——不存在只有容器的门面。
