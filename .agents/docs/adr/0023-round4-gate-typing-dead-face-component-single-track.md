# ADR 0023: Round 4 架构深化 — 门禁类型化、内核死面清剿与组件协议单轨

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联**: 执行 2026-08-23 架构评审候选 1–8；闭环 ADR 0009 §4「全仓严格 TypeScript 编译」的历史欠账；部分修订 CONTEXT.md EventPipeline 段的保留决策
- **范围**: `vite.config.ts`, `packages/core`, `packages/ui-kit`, `packages/plugins/*`, `apps/web`, `scripts/*`

---

## 背景与问题

三轮收敛后主链路已深，但架构审计发现三类残余：

1. **验证缝隙（系统性根因）**：`vp check` 仅 fmt+lint（`lint.options.typeCheck` 未开启）；Vite build 只转译不校验。两处断裂类型引用（`core/src/index.ts:29` 幽灵再导出已删除的 `CourseBadgeContribution`、`context.ts` 使用未 import 的 `ConfigSchema`）长期存活；vitest include 把 `packages/plugins/*/node_modules/zod/**` 自带的 192 个第三方测试文件扫进套件（520 用例假红）。
2. **接口死面**：`ChronosEvents` 中 `import:before/after`、`export:before/after` 四个事件零 emit 零订阅；`ExportTransformContext/Hook` 零消费；`IStorageService.queryCourses` 五层贯穿但零生产消费方；`transfer-state.statusMessage` 恒 null；wallpaper runtime `listeners` Set 从未 add；codec-qrcode 的 `chronos-qr:v1:` 与裸 JSON 回退分支从未随任何版本发布；`parseCqutScheduleData` 的 `courses[]` 形状仅测试可达；宿主持有 source-cqut 私有键名做遗留凭据清理且与插件内清理重复。
3. **协议双轨**：主题资产注册在 `ScopedContext.registerSlot` 与 `OfficialPluginService` 各写一份 slots↔registry 配对；宿主以 `'theme-'` 前缀剥离猜测 theme id；`component?: unknown` 使 mountable / 裸 Svelte 组件两种隐式协议并存于导入屏与插件屏判定树。

## 用户决策

- **D1 — `queryCourses` 端口保留**：作为预留能力保留五层贯穿实现；补齐测试 fake 后由类型门禁看护。禁止在无消费方时继续扩展该端口。
- **D2 — 零兼容负担**：当前无存量用户，一切兼容性/迁移代码直接删除，不做版本门控过渡。据此删除 QR v1/裸 JSON 回退与全部遗留凭据清理代码。

## 架构决策

### 1. 门禁类型化（P0）

- 根 `vite.config.ts` 开启 `lint.options.typeAware + typeCheck`，`vp check` 成为 fmt+lint+typecheck 单命令门禁（tsgo）。
- vitest exclude 显式锚定 `../../packages/**/node_modules/**`；测试回归 92 文件 / 413 用例自有规模。
- 为 codec-kit 补建 tsconfig（node types）、codec-share 开启 node types、各插件包加 `*.svelte` 模块 shim、ui-kit 子路径导出补 `types` 条件、`apps/web/tsconfig.json` 开启 `allowImportingTsExtensions`。

### 2. 内核契约死面清剿

- 删除四个死事件与 `ExportTransformContext/Hook`；修复 ConfigSchema import 与幽灵再导出（改为 `CourseBadgeSlotContribution`）。
- `PluginManifest` 补齐 `cssUrl/cssSha256/themeId` 字段（ADR 0015 就该有而未落）。
- `IHttpService.proxy` 与 `clearPluginData` 补入 `ChronosEnv` 缝隙并经 engine 门面转发——测试 fake 不再需要超集字面量。

### 3. 休眠面到期策略

- `EventPipeline.registerWaterfall/registerSerial` 加 FROZEN BASELINE 条款（同 native-protocol 先例）：两个发布周期无真实消费方则连同引擎动作包装整体移除。此为对 CONTEXT.md 原保留决策的**条款化修订**——从「无限期保留」改为「有期保留」。
- 按 D2 删除：QR v1/裸 JSON 回退、cqut `courses[]` 死形状（含 `CqutRawScheduleItem`）、statusMessage、listeners Set、4 个空目录（`lib/wallpaper`、`services/marketplace`、`components/marketplace`、`client/webauthn`）。

### 4. 遗留凭据清理整体退役（D2）

- 删除 `vault-legacy-cleanup.ts` 及其测试与 platform-bootstrap 调用；删除 source-cqut `apply()` 内的 `credential-record` 清理行。宿主恢复「零插件私有键名」不变量。

### 5. 主题资产注册缝隙单源化

- `OfficialPluginService` 的 JSON-only 主题经 headless `ScopedContext.registerSlot` 注册，slots↔themes 配对逻辑收敛回 ScopedContext 一处；service 只持生命周期 composite disposable。
- `PluginManifest.themeId` 由构建期从 colors JSON 的 `id` 显式写入；`PluginsScreen` 删除前缀剥离猜测。

### 6. 组件挂载协议单轨

- ui-kit 新增 `mountableSvelteComponent()`；三个内置导入 Tab 默认组件与两个 bundle entry 全部经它包装。
- `slots.ts` 的 `component` 收紧为 `ChronosMountable`；`TransferImportScreen` 与 `PluginScreenContainer` 判定树收敛为 MountableSlotOutlet + SchemaForm 兜底两条，删除裸 Svelte 直渲分支。

### 7. 明确不做

- **构建脚本元数据双源**（name/description 在插件源码与 `build-official-plugins.ts` 各一份）：分发元数据本属 catalog 层职责，插件源无法被 node 构建脚本安全 import（Svelte 依赖），维持现状。**Round 6（ADR 0027）已将 `version` 与 Tailwind 源目录映射收敛至 `official-plugins.config.ts` 单源；name/description 仍内嵌构建脚本。**
- **codec-qrcode 包名/id 一致性**：纯命名问题，改动波及 catalog 与产物哈希，低价值高风险。

## 影响与收益

- **Locality**：类型真相由 tsgo 单点裁决；注册配对、挂载策略各自单点；死代码不再靠测试输血伪装活性。
- **Depth**：`ScopedContext` 成为主题资产的唯一注册面；`ChronosMountable` 成为唯一组件协议，接口收紧的同时行为不减。
- **Leverage**：新插件作者只需学一种协议、一套契约面（每个成员都有真实 emit/consume）。

## 验证

- `vp check`：397→395 文件 0 错误 0 警告（typeAware 开启）
- `vp test -- --run`：92 文件 / 413 用例全绿（第三方 zod 泄漏清除）
- `npm run build:official-plugins && npm run verify:official-plugins`：manifest 含 `themeId`，双哈希自洽
- `npm run build`（SvelteKit + Vercel adapter）：通过

## 后续

- 手动回归：壁纸安装/取色/卸载回退、知行理工在线导入、分享链接与二维码导入导出、官方插件安装卸载
- 两个发布周期后复审 serial/waterfall 与 queryCourses 的 FROZEN/RESERVED 状态
