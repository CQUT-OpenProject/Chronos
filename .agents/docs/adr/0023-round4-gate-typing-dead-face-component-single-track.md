# ADR 0023: Round 4 架构深化 — 门禁类型化、内核死面清剿与组件协议单轨

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `10a2dce`, `3b48c31`, `fd161e3`, `a95f6a0`, `b8e2ea4`, `bf46ba3`, `7b4ad50`, `bea097c`, `dadd7aa`, `51d5fa7`, `e4e3c99`, `5ccc819`, `09d43c3`
- **关联**: 执行 2026-08-23 架构评审候选 1–8；闭环 ADR 0009 §4「全仓严格 TypeScript 编译」的历史欠账；部分修订 CONTEXT.md EventPipeline 段的保留决策
- **范围**: `vite.config.ts`, `packages/core`, `packages/ui-kit`, `packages/plugins/*`, `apps/web`, `scripts/*`

---

## 背景与问题

三轮收敛后，主链路已经整理到位；但架构审计仍发现三类残余问题：

1. **验证缝隙（其余问题的系统性根因）**：类型检查实际没有运行——`vp check` 仅 fmt+lint（`lint.options.typeCheck` 未开启），Vite build 只转译代码、不校验类型。于是两处断裂的类型引用长期存活：`core/src/index.ts:29` 幽灵再导出已删除的 `CourseBadgeContribution`；`context.ts` 使用未 import 的 `ConfigSchema`。此外，vitest 的 include 把 `packages/plugins/*/node_modules/zod/**` 自带的 192 个第三方测试文件扫进了测试套件，产生 520 个假红用例（套件报错，但过错不在本项目代码）。
2. **接口死面**（dead face：从未被调用的公开方法或注册面）：`ChronosEvents` 的 `import:before/after`、`export:before/after` 四个事件零 emit 零订阅；`ExportTransformContext/Hook` 无消费方；`IStorageService.queryCourses` 实现贯穿五层，却没有生产消费方；`transfer-state.statusMessage` 恒为 null；wallpaper runtime 的 `listeners` Set 从未 add 过；codec-qrcode 的 `chronos-qr:v1:` 分支与裸 JSON 回退分支从未随任何版本发布过；`parseCqutScheduleData` 的 `courses[]` 形状仅测试可达；宿主还持有 source-cqut 的私有键名做遗留凭据清理，并与插件内的清理逻辑重复。
3. **协议双轨**（同一个功能同时存在两套实现）：主题资产注册的 slots↔registry 配对在 `ScopedContext.registerSlot` 与 `OfficialPluginService` 各写了一份；宿主靠剥离 `'theme-'` 前缀来猜 theme id；`component?: unknown` 的宽松类型让 mountable 与裸 Svelte 组件两种隐式协议并存于导入屏和插件屏的判定树。

## 用户决策

- **D1 — `queryCourses` 端口保留**：`queryCourses` 是一个端口（port，平台能力的服务接口），实现贯穿五层。本次把它作为预留能力整体保留，补齐测试 fake 后交由类型门禁看护。在该端口有真实消费方之前，禁止继续扩展它。
- **D2 — 零兼容负担**：当前没有存量用户，因此一切兼容性/迁移代码直接删除，不做版本门控过渡。据此删除 QR v1/裸 JSON 回退与全部遗留凭据清理代码。

## 架构决策

### 1. 门禁类型化（P0）

- 根 `vite.config.ts` 开启 `lint.options.typeAware + typeCheck`。此后 `vp check` 一条命令即完成 fmt+lint+typecheck（typecheck 由 tsgo 执行），成为统一的质量门禁。
- vitest 的 exclude 显式锚定 `../../packages/**/node_modules/**`；测试套件回到自有规模：92 文件 / 413 用例。
- 为 codec-kit 补建 tsconfig（含 node types）；为 codec-share 开启 node types；给各插件包加 `*.svelte` 模块 shim；给 ui-kit 子路径导出补 `types` 条件；`apps/web/tsconfig.json` 开启 `allowImportingTsExtensions`。

### 2. 内核契约死面清剿

- 删除四个死事件与 `ExportTransformContext/Hook` 类型；修复 ConfigSchema 的缺失 import，幽灵再导出改为 `CourseBadgeSlotContribution`。
- 给 `PluginManifest` 补齐 `cssUrl/cssSha256/themeId` 三个字段（ADR 0015 本应包含而未落地）。
- 把 `IHttpService.proxy` 与 `clearPluginData` 补入 `ChronosEnv` 的空缺，并经 engine 门面转发。此后测试 fake 不再需要在对象字面量里填入多余的超集字段。

### 3. 休眠面到期策略

- 给 `EventPipeline.registerWaterfall/registerSerial` 加 FROZEN BASELINE 条款（先例同 native-protocol）：FROZEN BASELINE 指机制暂不删除、也不再扩展；若连续两个发布周期没有真实消费方，就连同引擎动作包装一起整体移除。这也是对 CONTEXT.md 原保留决策的**条款化修订**——从「无限期保留」改为「有期保留」。
- 按 D2 执行删除：QR v1/裸 JSON 回退分支、cqut 的 `courses[]` 死形状（仅测试可达的形状，含 `CqutRawScheduleItem`）、statusMessage 字段、listeners Set、4 个空目录（`lib/wallpaper`、`services/marketplace`、`components/marketplace`、`client/webauthn`）。

### 4. 遗留凭据清理整体退役（D2）

- 删除 `vault-legacy-cleanup.ts` 文件、它的测试以及 platform-bootstrap 中对它的调用；删除 source-cqut `apply()` 内清理 `credential-record` 的代码行。宿主由此恢复「零插件私有键名」这一不变量。

### 5. 主题资产注册缝隙单源化

- `OfficialPluginService` 的 JSON-only 主题改经 headless 的 `ScopedContext.registerSlot` 注册。slots↔themes 配对逻辑由此收敛回 `ScopedContext` 一处；service 只保留生命周期相关的 composite disposable。
- `PluginManifest.themeId` 改为构建期从 colors JSON 的 `id` 显式写入；`PluginsScreen` 删除靠剥离前缀猜 id 的逻辑。

### 6. 组件挂载协议单轨

- ui-kit 新增 `mountableSvelteComponent()`，负责把 Svelte 组件包装成 mountable 对象（mountable 是本项目统一的组件挂载协议）。三个内置导入 Tab 的默认组件与两个 bundle entry 全部经它包装。
- `slots.ts` 的 `component` 字段类型收紧为 `ChronosMountable`。`TransferImportScreen` 与 `PluginScreenContainer` 的判定树收敛为两条路径：MountableSlotOutlet，以及 SchemaForm 兜底；删除裸 Svelte 组件直接渲染的分支。

### 7. 明确不做

- **构建脚本元数据双源**（name/description 在插件源码与 `build-official-plugins.ts` 各存一份）：分发元数据本属 catalog 层职责；插件源码含 Svelte 依赖，无法被 node 构建脚本安全 import，故维持现状。**Round 6（ADR 0027）已将 `version` 与 Tailwind 源目录映射收敛至 `official-plugins.config.ts` 单源；name/description 仍内嵌构建脚本。**
- **codec-qrcode 包名/id 一致性**：纯命名问题；改动会波及 catalog 与产物哈希，价值低、风险高，不改。

## 影响与收益

- **Locality**：类型是否正确由 tsgo 一处裁决；注册配对与挂载策略各自只剩一个实现点；死代码无法再靠测试伪装成还在使用。
- **Depth**：`ScopedContext` 成为主题资产的唯一注册面；`ChronosMountable` 成为唯一的组件挂载协议。接口收紧，行为不减。
- **Leverage**：新插件作者只需学习一种协议、一套契约面；契约面的每个成员都有真实的 emit/consume。

## 验证

- `vp check`：397→395 个文件，0 错误 0 警告（typeAware 已开启）
- `vp test -- --run`：92 文件 / 413 用例全绿（第三方 zod 泄漏已清除）
- `npm run build:official-plugins && npm run verify:official-plugins`：manifest 含 `themeId`，双哈希自洽
- `npm run build`（SvelteKit + Vercel adapter）：通过

## 后续

- 手动回归：壁纸安装/取色/卸载回退、知行理工在线导入、分享链接与二维码导入导出、官方插件安装卸载
- 两个发布周期后复审 serial/waterfall 与 queryCourses 的 FROZEN/RESERVED 状态

---

## 修订记录

- 2026-08-24 · [ADR 0027](./0027-round6-architecture-subtraction.md)：闭环本文 §7 构建元数据双源（version 改单源）。
