# ADR 0027: Round 6 架构减法 — 颜色契约、引擎瘦面、宿主 i18n、传输管道与插件工厂

- **状态**: Accepted
- **日期**: 2026-08-24
- **关联提交**: `c834023`, `3ce1d8c`, `3076a87`, `9375f15`, `ddcc841`, `e3909c1`, `7e728c0`, `3eeefa0`, `72e624d`
- **关联**: 执行第六轮架构深化计划（`DEEPENING-PLAN.md`）；**部分修订** [ADR 0024](./0024-plugin-message-catalog-i18n.md) §D4 宿主桥接；**延续** [ADR 0023](./0023-round4-gate-typing-dead-face-component-single-track.md) FROZEN BASELINE（C1 挂起）；**闭环** [ADR 0023](./0023-round4-gate-typing-dead-face-component-single-track.md) §7 构建元数据双源（version 单源）
- **范围**: `packages/core`, `packages/ui-kit`, `packages/plugins/*`, `apps/web`, `scripts/*`

---

## 背景与问题

Round 4–5 之后，质量门禁与插槽单轨已经稳定；但架构评审仍指出六类可以削减的冗余，外加一处用户可见缺陷：

1. **颜色键双轨（用户可见 bug）**：`workbench-colors` 注册表产出驼峰命名的 CSS 变量（如 `--color-onSurface`），而 M3 生成的主题与 Tailwind 消费的是连字符命名（`--color-on-surface`）。yumemita 与壁纸插件写入的都是无效的驼峰键，导致主题配色不生效。
2. **引擎公开面冗余**：`ChronosEngine.t()`、`ChronosEngineOptions.i18nHandler` 与 Paraglide 桥接三者功能重复；`refreshTimetables()` 暴露为公开方法，却只有内部使用；宿主调用动作时仍要经过 `.actions.` 别名（插件侧 `ctx.actions` 保留不动）。
3. **宿主翻译双 API**：`hostText` / `hostTextRead(controller, key)` 两个 API 并存，全仓约 400 处调用；8 个基础 UI 组件为了拿翻译单独调用 `getAppController()`；`day-labels.ts` 里维护着成对的 full/Read 函数。
4. **传输管道泄漏**：导出页为了读取 warning 而实例化完整的 `transfer-state`；`/s` 页复制了一份预览流程的实现，并用 `err.message === hostText(...)` 这种脆弱方式识别错误；覆盖当前课表的规则分散在 UI 三层，而且 `confirmImport` 不拦截非法组合。
5. **插件作者样板代码**：四个内置插件各自重复实现 `translate` 闭包与 `registerMessages` 调用；另有 4 份内容雷同的 `plugin-text.ts`、5 处 `as unknown as ConfigSchema` 强转、三套约 50 行的测试用 `createMockEnv`；官方插件的 `version: '1.0.0'` 与 build/verify 目录映射分散在三处硬编码。
6. **休眠端口**：`IStorage.patchTimetable`、`IHttp` 的 session 成员、`IRuntime` 除 `sha256` 外的 timer/UTF-8 方法均没有消费方；`IVaultService` 在 Web 端已退役，但 `ChronosEnv.vault` 仍是必填字段。

**挂起（C1）**：`EventPipeline` 的 serial/waterfall 机制与六处引擎动作 guard 包装仍然零注册。按 ADR 0023 的 FROZEN BASELINE 条款，本轮既不删除它们，也不补齐 `updateCourse` 的 guard 不一致。

**缓议（C7）**：把启动步骤收拢进 `bootstrapChronos({ pathname })` 的事项，留待批次 1 合并后单独评审。

## 判据

贯穿全部批次的三条裁剪标准：

1. **零消费即删**：没有消费方就直接删除。（本批例外：保留 `queryCourses`、badge 槽位；`IVaultService` 改为可选。）
2. **双写合一**：同一信息写两处时合并为一处。（涉及：`actions` 宿主别名、三份消息注册、插件样板等。）
3. **不变量进数据层**：业务规则下沉到数据层强制执行。（涉及：导出/导入覆盖规则等。）

## 架构决策

### C4 — Workbench 颜色键坍缩为连字符（P0 缺陷修复）

- 从 `WORKBENCH_COLOR_KEYS` 中删除与连字符键同义的驼峰项；规范键形如 `color.on-surface`、`color.on-primary`、`color.surface-variant` 等。
- 新增 `normalizeWorkbenchColorKey(s)` 函数：`validateWorkbenchColors` 读入时先做归一化；dev 环境下对非法键输出 `console.warn`；拒绝不安全的值。
- `designTokensToWorkbenchColors` 与壁纸插件的 `createWorkbenchColorsFromTokens` 改为输出连字符键。
- 源主题 `theme-yumemita.colors.json` 与官方构建产物 `colors.json` 同步更新。

### C2 — ChronosEngine 接口收窄

- 删除 `engine.t()`、`ChronosEngineOptions.i18nHandler` 以及 `app-engine` 内的 Paraglide 桥接代码。
- 预设主题与 `HOST_MESSAGES` 改经 `ChronosEngineOptions.presetThemes` / `presetI18nCatalogs` 在 init 时注册（复用 ProfileManager 通道）。
- `refreshTimetables()` 改为 `private`。
- **宿主**侧调用方由 `engine.actions.*` 改为直接调用引擎方法；**`ChronosContext.actions` 与 `EngineContextHost.actions` 保留**（插件的 `ctx.actions` 契约不变）。
- `updateCourse` 处留下注释指向 C1 挂起项；guard 包装不补。

### C8 — 端口休眠成员修剪

| 成员                                                             | 处置                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `ChronosEnv.vault`                                               | 改为可选；engine 仅 `env.vault` 存在时注册 `IVaultService` |
| `IHttp.clearSession` / `useSession` / `sessionId`                | 删除                                                       |
| `IStorage.patchTimetable`                                        | 删除                                                       |
| `IRuntime` `setTimeout`/`clearTimeout`/`encodeUtf8`/`decodeUtf8` | 删除，保留 `platform` + `sha256`                           |
| `queryCourses`                                                   | **不动**（RESERVED）                                       |

### C3 — 宿主页翻译收口为 `hostT`

- 新建 `apps/web/src/lib/i18n/host-i18n.svelte.ts`，提供 `configureHostI18n({ onLocaleChanged })` 与响应式的 `hostT(key, params?)`。其内部订阅 locale 版本号，并经 `translateForPlugin('host-ui', …)` 取文案。
- `platform-bootstrap` 在 `ensureEngineReady` 之后完成注入；删除 `host-text.ts` 及其静态兜底。
- 把全仓的 `hostText` / `hostTextRead` 机械替换为 `hostT`；拆除仅为传递翻译而存在的 controller prop 链。
- `components/ui/` 下 8 个组件移除仅用于 i18n 的 `getAppController`；`day-labels.ts` 把成对函数合并。

**修订 ADR 0024 §D4**：宿主 Shell 文案不再经 `engine.t()` / `i18nHandler`。Paraglide 仍负责 cookie、`document.lang` 与 URL de-localization；插件与宿主 UI 的文案统一走 engine catalog 加 `hostT` / `translatePlugin`。

### C5 — 导入导出管道闭环

- `transfer-state` 成为导入导出流程的唯一拥有者：
  - 用 `checkPrimaryExportWarning(engine)` 取代导出页对 `getExportMetadata` 的滥用
  - 提供 `previewAndPersist` / `previewDeepLinkImport` 供 `/s` 页复用
  - `setImportMode` / `confirmImport` 在数据层拒绝「`OVERWRITE_CURRENT` 且无当前课表」的非法组合
- 新增 `ImportSlotError` 与 `ImportSlotErrorKind`（位于 `packages/core/src/types/slots.ts`）；codec-share 负责错误映射；`/s` 按 `kind` 选择 snackbar 文案的 key。
- 新建 `apps/web/src/lib/platform/transfer.ts`，收纳 `downloadExportResult`、`copyTextWithFallback`、`withTimeout` 三个函数（各有独立单测）。
- `dispatch.ts` 的限流响应改为 `pluginServerError('RateLimited', 'rate_limited')`，由客户端按 locale 生成文案。

### C6 — 插件作者工厂

| 能力                                        | 位置                                                                                                         |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `defineChronosPlugin`                       | `packages/core/src/plugin/define-chronos-plugin.ts` — 自动 `registerMessages`；`name`/`description` 惰性解析 |
| `registerImportTab<FormState>`              | `packages/core/src/plugin/register-import-tab.ts` — 泛型 `inputSchema` 无 `as unknown as ConfigSchema`       |
| `callPluginServer` / `callPluginServerJson` | `packages/core/src/plugin/call-plugin-server.ts`                                                             |
| `createMockEnv`                             | `@chronos/core/test-utils`                                                                                   |
| `pluginText`                                | `packages/ui-kit/src/i18n/plugin-text.ts`                                                                    |
| `ImportTabComponentProps`                   | `packages/ui-kit/src/plugin-screen/import-tab-props.ts`                                                      |
| 官方插件清单                                | `scripts/official-plugins.config.ts` — build/verify 共读；`OFFICIAL_PLUGIN_VERSION` 单源                     |

四个内置插件（codec-qrcode、codec-share、source-cqut、wallpaper）迁移至 `defineChronosPlugin`；同时删除 4 份 `plugin-text.ts`。

### 挂起 · C1 serial/waterfall

**本轮不执行。** serial/waterfall 机制与六处引擎动作包装维持现状。解除挂起的条件是：出现第一个真实注册需求时，**按该需求重新设计接口**，而不是复活当前这套猜测式 API。

### 缓议 · C7 启动收拢

**本轮不执行。** 目标形态是：`bootstrapChronos({ pathname })` 有序编排各启动步骤并返回 dispose；`getAppEngine()` 退化为纯读取。重启评审的条件：C2 合并之后单独评审。

### 明确不做

- 不对 `queryCourses`、badge 槽位管线做删除或扩展
- 不合并 core-shell 子集消息与 host-ui（在没有跨命名空间需求之前）
- 不清理 Paraglide runtime 与空的 `apps/web/messages/` 目录
- 挂起期间不删除 C1 相关机制，也不补齐 `updateCourse` guard
- 官方插件 `name`/`description` 不迁入 `official-plugins.config.ts`（仍属 catalog 层职责；插件源码含 Svelte，无法被 node 脚本安全 import，故维持 build 脚本内嵌文案）

## 影响与收益

- **用户可见**：yumemita / 壁纸插件的 workbench 配色与 M3 变量对齐；切换 locale 后宿主 Shell 立即重算文案，无需再用 `hostTextRead` 强行触发刷新。
- **Locality**：传输相关不变量集中在 `transfer-state` 一处；插件 i18n 与注册样板各归一个入口（`defineChronosPlugin` + `pluginText`）。
- **Depth**：引擎公开面收缩；休眠端口从类型定义与 fake env 中消失；`ImportTabSlotContribution` 的泛型经 `registerImportTab` 端到端传递。
- **Leverage**：新的官方插件作者平均每个插件可少写 ≥60 行样板；`ImportTabComponentProps` 让 mountable 契约获得类型检查。

## 验证

- `vp check` / `vp test -- --run`：106 文件 / 466 用例全绿
- `grep '\.actions\.' apps packages`（宿主路径）归零；`hostTextRead` / `hostText(` 归零；`as unknown as ConfigSchema` 在 `packages/plugins` 归零
- `npm run build:official-plugins && npm run verify:official-plugins`：产物与 manifest 哈希自洽（`theme-yumemita/src` Tailwind 映射告警为既有项）
- `npm run build`（SvelteKit）：通过

## 后续

- 手动回归：yumemita 配色、分享链接/二维码导入导出、`/s` 深链、覆盖导入非法组合拦截、en/zh-cn 切换
- 两个发布周期后复审 C1 FROZEN BASELINE 与 `queryCourses` RESERVED
- 单独评审 C7 `bootstrapChronos` 启动收拢

## 修订记录

- 2026-08-24：初版 Accepted；C1（serial/waterfall 零注册）挂起、C7（`bootstrapChronos` 收拢）缓议，复审时钟见 `frozen-baseline-review.md`。
- 2026-08-28 · [ADR 0028](./0028-today-plugin-default-launch-and-day-clock.md) §6：`queryCourses` 出现首个生产消费者（`tool-today`），RESERVED 保留、形状冻结。
