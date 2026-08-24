# ADR 0027: Round 6 架构减法 — 颜色契约、引擎瘦面、宿主 i18n、传输管道与插件工厂

- **状态**: Accepted
- **日期**: 2026-08-24
- **关联**: 执行第六轮架构深化计划（`DEEPENING-PLAN.md`）；**部分修订** [ADR 0024](./0024-plugin-message-catalog-i18n.md) §D4 宿主桥接；**延续** [ADR 0023](./0023-round4-gate-typing-dead-face-component-single-track.md) FROZEN BASELINE（C1 挂起）；**闭环** [ADR 0023](./0023-round4-gate-typing-dead-face-component-single-track.md) §7 构建元数据双源（version 单源）
- **范围**: `packages/core`, `packages/ui-kit`, `packages/plugins/*`, `apps/web`, `scripts/*`

---

## 背景与问题

Round 4–5 后门禁与插槽单轨已稳，但架构评审仍指出六类可减法与一处用户可见缺陷：

1. **颜色键双轨（用户可见 bug）**：`workbench-colors` 注册表产出驼峰 CSS 变量（如 `--color-onSurface`），而 M3 生成主题与 Tailwind 消费连字符键（`--color-on-surface`）；yumemita 与壁纸插件均写入无效驼峰键，主题配色不生效。
2. **引擎公开面冗余**：`ChronosEngine.t()`、`ChronosEngineOptions.i18nHandler` 与 Paraglide 桥接重复；`refreshTimetables()` 对外暴露但仅内部使用；宿主仍经 `.actions.` 别名调用（插件 `ctx.actions` 保留）。
3. **宿主翻译双 API**：`hostText` / `hostTextRead(controller, key)` 约 400 处调用；8 个基础 UI 组件为翻译单独 `getAppController()`；`day-labels.ts` 成对 full/Read 函数。
4. **传输管道泄漏**：导出页为取 warning 实例化完整 `transfer-state`；`/s` 复制预览流程并以 `err.message === hostText(...)` 识别错误；覆盖当前课表规则分散在 UI 三层且 `confirmImport` 不拦截非法组合。
5. **插件作者样板**：四内置插件重复 `translate` 闭包、`registerMessages`、4 份 `plugin-text.ts`、5 处 `as unknown as ConfigSchema`、三套 ~50 行 test `createMockEnv`；官方插件 `version: '1.0.0'` 与 build/verify 目录映射三处硬编码。
6. **休眠端口**：`IStorage.patchTimetable`、`IHttp` session 成员、`IRuntime` 除 `sha256` 外的 timer/UTF-8 方法零消费；`IVaultService` 在 Web 已退役但 `ChronosEnv.vault` 仍必填。

**挂起（C1）**：`EventPipeline` serial/waterfall 与六处引擎动作 guard 包装仍零注册；按 ADR 0023 FROZEN BASELINE **本轮不删、不补** `updateCourse` guard 不一致。

**缓议（C7）**：`bootstrapChronos({ pathname })` 启动收拢留待批次 1 合并后单独评审。

## 判据

贯穿全部批次的三条减法判据：

1. **零消费即删**（保留：`queryCourses`、badge 槽位、`IVaultService` 改可选）
2. **双写合一**（`actions` 宿主别名、三份消息注册、插件样板等）
3. **不变量进数据层**（导出/导入覆盖规则等）

## 架构决策

### C4 — Workbench 颜色键坍缩为连字符（P0 缺陷修复）

- `WORKBENCH_COLOR_KEYS` 删除与连字符键同义的驼峰项；规范键为 `color.on-surface`、`color.on-primary`、`color.surface-variant` 等。
- 新增 `normalizeWorkbenchColorKey(s)`：`validateWorkbenchColors` 读入时归一化，dev 下 `console.warn`；拒绝不安全值。
- `designTokensToWorkbenchColors` 与壁纸 `createWorkbenchColorsFromTokens` 输出连字符键。
- 源主题 `theme-yumemita.colors.json` 与官方产物 `colors.json` 同步更新。

### C2 — ChronosEngine 接口收窄

- 删除 `engine.t()`、`ChronosEngineOptions.i18nHandler` 及 `app-engine` 内 Paraglide 桥接。
- 预设主题与 `HOST_MESSAGES` 经 `ChronosEngineOptions.presetThemes` / `presetI18nCatalogs` 在 init 注册（复用 ProfileManager 通道）。
- `refreshTimetables()` 改 `private`。
- **宿主**调用方由 `engine.actions.*` 改为直接方法；**`ChronosContext.actions` 与 `EngineContextHost.actions` 保留**（插件 `ctx.actions` 契约不变）。
- `updateCourse` 处留注释指向 C1 挂起项，不补 guard 包装。

### C8 — 端口休眠成员修剪

| 成员 | 处置 |
| ---- | ---- |
| `ChronosEnv.vault` | 改为可选；engine 仅 `env.vault` 存在时注册 `IVaultService` |
| `IHttp.clearSession` / `useSession` / `sessionId` | 删除 |
| `IStorage.patchTimetable` | 删除 |
| `IRuntime` `setTimeout`/`clearTimeout`/`encodeUtf8`/`decodeUtf8` | 删除，保留 `platform` + `sha256` |
| `queryCourses` | **不动**（RESERVED） |

### C3 — 宿主页翻译收口为 `hostT`

- 新建 `apps/web/src/lib/i18n/host-i18n.svelte.ts`：`configureHostI18n({ onLocaleChanged })` + 响应式 `hostT(key, params?)`，内部订阅 locale 版本并走 `translateForPlugin('host-ui', …)`。
- `platform-bootstrap` 在 `ensureEngineReady` 后注入；删除 `host-text.ts` 及静态兜底。
- 机械替换 `hostText` / `hostTextRead` → `hostT`；拆除仅为翻译传递的 controller prop 链。
- `components/ui/` 下 8 个组件移除仅用于 i18n 的 `getAppController`；`day-labels.ts` 合并成对函数。

**修订 ADR 0024 §D4**：宿主 Shell 文案不再经 `engine.t()` / `i18nHandler`；Paraglide 仍管 cookie、`document.lang` 与 URL de-localization，插件与宿主 UI 文案均走 engine catalog + `hostT` / `translatePlugin`。

### C5 — 导入导出管道闭环

- `transfer-state` 为唯一流程拥有者：
  - `checkPrimaryExportWarning(engine)` 取代导出页滥用 `getExportMetadata`
  - `previewAndPersist` / `previewDeepLinkImport` 供 `/s` 复用
  - `setImportMode` / `confirmImport` 在数据层拒绝 `OVERWRITE_CURRENT` 且无当前课表
- `ImportSlotError` + `ImportSlotErrorKind`（`packages/core/src/types/slots.ts`）；codec-share 映射；`/s` 按 `kind` 选 snackbar key。
- `apps/web/src/lib/platform/transfer.ts`：`downloadExportResult`、`copyTextWithFallback`、`withTimeout`（独立单测）。
- `dispatch.ts` 限流响应改为 `pluginServerError('RateLimited', 'rate_limited')`，由客户端按 locale 出文案。

### C6 — 插件作者工厂

| 能力 | 位置 |
| ---- | ---- |
| `defineChronosPlugin` | `packages/core/src/plugin/define-chronos-plugin.ts` — 自动 `registerMessages`；`name`/`description` 惰性解析 |
| `registerImportTab<FormState>` | `packages/core/src/plugin/register-import-tab.ts` — 泛型 `inputSchema` 无 `as unknown as ConfigSchema` |
| `callPluginServer` / `callPluginServerJson` | `packages/core/src/plugin/call-plugin-server.ts` |
| `createMockEnv` | `@chronos/core/test-utils` |
| `pluginText` | `packages/ui-kit/src/i18n/plugin-text.ts` |
| `ImportTabComponentProps` | `packages/ui-kit/src/plugin-screen/import-tab-props.ts` |
| 官方插件清单 | `scripts/official-plugins.config.ts` — build/verify 共读；`OFFICIAL_PLUGIN_VERSION` 单源 |

四内置插件（codec-qrcode、codec-share、source-cqut、wallpaper）迁移至 `defineChronosPlugin`；删除 4 份 `plugin-text.ts`。

### 挂起 · C1 serial/waterfall

**不执行。** 机制与六处引擎动作包装保持现状。解除挂起条件：出现第一个真实注册需求时**按需求重设计接口**，不复活当前猜测式 API。

### 缓议 · C7 启动收拢

**不执行。** 目标形态：`bootstrapChronos({ pathname })` 有序编排启动步骤并返回 dispose；`getAppEngine()` 退化为纯读取。重启条件：C2 合并后单独评审。

### 明确不做

- `queryCourses`、badge 槽位管线删除或扩展
- core-shell 子集消息与 host-ui 合并（无跨命名空间需求前）
- Paraglide runtime 与空 `apps/web/messages/` 目录清理
- C1 删除或 `updateCourse` guard 补齐（挂起期间）
- 官方插件 `name`/`description` 迁入 `official-plugins.config.ts`（仍属 catalog 层；插件源含 Svelte 无法被 node 脚本安全 import，维持 build 脚本内嵌文案）

## 影响与收益

- **用户可见**：yumemita / 壁纸 workbench 配色与 M3 变量对齐；locale 切换后宿主 Shell 即时重算，无需 `hostTextRead` 骗刷新。
- **Locality**：传输不变量集中于 `transfer-state`；插件 i18n 与注册样板各单点（`defineChronosPlugin` + `pluginText`）。
- **Depth**：引擎公开面收缩；休眠端口从类型与 fake env 中消失；`ImportTabSlotContribution` 泛型经 `registerImportTab` 端到端传递。
- **Leverage**：新官方插件作者减少 ≥60 行/个样板；`ImportTabComponentProps` 提供 mountable 契约类型检查。

## 验证

- `vp check` / `vp test -- --run`：106 文件 / 466 用例全绿
- `grep '\.actions\.' apps packages`（宿主路径）归零；`hostTextRead` / `hostText(` 归零；`as unknown as ConfigSchema` 在 `packages/plugins` 归零
- `npm run build:official-plugins && npm run verify:official-plugins`：产物与 manifest 哈希自洽（`theme-yumemita/src` Tailwind 映射告警为既有项）
- `npm run build`（SvelteKit）：通过

## 后续

- 手动回归：yumemita 配色、分享链接/二维码导入导出、`/s` 深链、覆盖导入非法组合拦截、en/zh-cn 切换
- 两个发布周期后复审 C1 FROZEN BASELINE 与 `queryCourses` RESERVED
- 单独评审 C7 `bootstrapChronos` 启动收拢
