# ADR 0016: Round 3 架构收敛 — deprecated 清零、dynamicColor 内核契约与运行时真隔离

- **状态**: Accepted
- **日期**: 2026-08-22
- **关联提交**: `25d7dd9`, `cddb950`, `b52f53a`, `9de056d`, `6a1a639`, `88d56a1`, `5fa79ad`, `0f2f02e`, `b14afc1`
- **关联**: 闭环 [ADR 0015](./0015-deepening-round2-build-credential-glue-convergence.md) 后续项；**部分修订** [ADR 0013](./0013-import-pipeline-slot-closure-and-deep-convergence.md) §2 壁纸事件策略
- **范围**: `packages/core`, `packages/plugins/wallpaper`, `packages/ui-kit`, `apps/web`, `scripts/resolve-chronos-aliases.ts`

---

## 背景与问题

ADR 0015 完成构建隔离、凭据泛化、宿主胶水收敛后，架构审计（`architecture-deep-dive-2026-08-22`）仍指出：

1. **兼容层堆积**：`app-shell` / `credential-vault` / `color-scheme` / `engine-controller` / `wallpaper runtime` 仍保留 `@deprecated` 别名，调用方与文档双轨并存。
2. **ADR 0015 后续未落地**：`minEngineVersion` semver 校验、壁纸运行时真工厂隔离、`codec-share` brotli 动态 chunk、Vite 别名单源。
3. **事件模型张力**：ADR 0013 将 `wallpaper:*` 移出 `ChronosEvents` 至插件 `CustomChronosEvents`；Round 3 为支持「任意动态取色主题」需在宿主与主题贡献层建立稳定契约，仅靠插件私有事件无法被 `ThemeContribution.dynamicColorAdapter` 与 `app-shell` 泛化消费。

---

## 架构决策

### 1. 清零所有 `@deprecated` 并全量迁移调用方

| 移除项                                            | 替代 API                                                  | 迁移位置                                        |
| ------------------------------------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| `app-shell.state.hasWallpaper` / `wallpaperUri`   | `hasDynamicColorBackground` / `dynamicColorUri`           | `TimetableScreen.svelte`                        |
| `app-shell.setWallpaper`                          | `setDynamicColorAsset`                                    | （无外部调用，直接删除）                        |
| `CredentialRecord` / `createCredentialVault`      | `PluginCredentialRecord` / `createGenericCredentialVault` | 已在 ADR 0015 迁移，删除别名                    |
| `BUILTIN_COLOR_SCHEME_WALLPAPER`                  | `DYNAMIC_COLOR_SCHEME_ID`                                 | `DisplaySettingsScreen`, `color-scheme.test.ts` |
| `setWallpaperChangeHandler`                       | `WallpaperRuntime.setChangeHandler`                       | 删除导出                                        |
| `EngineController.rawEngine`                      | 类型化 controller 方法                                    | 无外部调用，直接删除                            |
| `previewFromClipboard/Online/FromHtmlFile`        | `previewWithSlot`                                         | Phase 1 已删除                                  |
| `ChronosEngine.pipeline` / `registerPipelineHook` | `events` / `registerEventHook`                            | Phase 1 已删除                                  |

**原则**：兼容层只允许存在一个大版本周期；Round 3 结束时代码库内零 `@deprecated` 注解（ADR 正文中的历史描述除外）。

### 2. 修订 ADR 0013：内核承载泛化 `dynamicColor:*` 事件

ADR 0013 的动机是剥离**壁纸业务语义**对微内核的污染，而非禁止「动态取色」这一跨主题能力。

Round 3 决策：

- 在 `ChronosEvents` 定义**与具体插件无关**的三元组：
  - `dynamicColor:set` — 宿主/插件请求设置取色源（`Blob | null`）
  - `dynamicColor:changed` — 取色 URI 变更广播
  - `dynamicColor:hydrate` — 晚订阅方请求重放当前状态
- `@chronos/plugin-wallpaper` 监听/发射上述事件，不再使用 `wallpaper:*` 或 `CustomChronosEvents` 扩展。
- `app-shell` 仅订阅 `dynamicColor:changed`，不 import 壁纸包、不持有 `WALLPAPER_PLUGIN_ID`。

这是对 ADR 0013 §2 的**有意识的修订**：问题域从「壁纸」升维为「动态取色主题能力」，内核事件命名与 payload 均不含 wallpaper 字面量。

### 3. 壁纸运行时真工厂隔离（闭环 ADR 0015 §后续）

- `getWallpaperRuntime(pluginId)` 使用 `Map<string, WallpaperRuntime>` 按 `pluginId` 隔离实例。
- `createWallpaperRuntime(storage, pluginId)` 闭包持有独立 `wallpaperUri` 状态，跨 `load/unload` 不再串扰。
- `PluginScreenContainer` 仅识别 `Symbol.for('chronos.mountable')`，移除 duck-typing。

### 4. 偏好与主题泛化

- `PaletteMode` 由联合字面量改为 `string`；保留 `PALETTE_MODE_VIBRANT` / `LEGACY_PALETTE_MODE_DYNAMIC` 常量。
- `resolveCoursePalette` 不再硬编码 `'wallpaper'` 字符串。
- `DYNAMIC_COLOR_SCHEME_ID = 'wallpaper'` 作为 scheme id（与历史偏好数据兼容），废弃 `BUILTIN_COLOR_SCHEME_WALLPAPER` 别名。

### 5. 工程收敛

- `scripts/resolve-chronos-aliases.ts` 作为 monorepo 别名单一真相（root / apps/web vite + `build-official-plugins`）。
- `plugin-bundle.ts`：`CHRONOS_ENGINE_VERSION = '0.4.0'` + `minEngineVersion` semver 校验。
- `codec-share`：`@chronos/plugin-source-cqut` peerDep；`brotli-wasm` 迁至 optionalDependencies + Vite `manualChunks`。

---

## 架构演进回顾：是否在「来回拉扯」？

| 维度         | 早期决策                   | Round 3                                | 判定                                                       |
| ------------ | -------------------------- | -------------------------------------- | ---------------------------------------------------------- |
| 壁纸事件归属 | ADR 0013：移出 core        | `dynamicColor:*` 回到 core（泛化命名） | **有修订，非回退** — 剥离的是 wallpaper 语义，不是取色能力 |
| 宿主壁纸胶水 | ADR 0012/0014：保留 bridge | `app-shell` 零 `WALLPAPER_PLUGIN_ID`   | **正向**                                                   |
| 凭据双轨     | ADR 0015：泛化 vault       | 删除 `createCredentialVault` 别名      | **正向**                                                   |
| 运行时单例   | ADR 0015：工厂委托单例     | `Map` 真隔离                           | **正向（闭环）**                                           |
| 导入管道     | ADR 0013：插槽闭环         | 删除 deprecated preview 包装           | **正向**                                                   |
| ESM 单轨     | ADR 0013：纯 ESM           | 删除 pipeline 别名                     | **正向**                                                   |

**结论**：三轮收敛的主线是「宿主零特判 → 插件自包含 → 内核小接口承载横切能力」。唯一看似「反复」的是事件总线：从 core 移除 `wallpaper:*` 到 core 新增 `dynamicColor:*`——这是**命名与边界重划**，不是恢复壁纸耦合。若未来出现第二种动态取色源（非壁纸插件），无需再改 `ChronosEvents`。

---

## 影响与收益

- 代码库零 `@deprecated`，降低认知双轨与「该用哪个 API」的决策成本。
- 内核事件契约可支撑任意 `ThemeContribution.dynamicColorAdapter`，不限于壁纸插件。
- 壁纸插件多实例/重载场景状态隔离，消除 ADR 0015 已知技术债。
- `minEngineVersion` 与别名单源使构建/分发链路可审计、可演进。

---

## 验证

- `vp check` 全绿
- `vp test -- --run` 全绿（含 `theme-contribution.contract.test.ts`、`plugin-bundle.test.ts`、`wallpaper.test.ts`）
- 手动：课表屏动态背景、壁纸插件设置/清除、偏好 `wallpaper` scheme 迁移、凭据 WebAuthn 往返

---

## 后续

- 重跑 `vp run build:official-plugins` 使静态 bundle 同步 `dynamicColor:*` 事件（当前 `tool-wallpaper.bundle.js` 可能仍含旧 `wallpaper:*` 直至重建）
- 评估是否将 `apply-appearance.ts` 的 `wallpaperUri` 参数重命名为 `dynamicColorUri`（纯命名，非阻塞）
- ui-kit 预览组件 `hasWallpaper` prop 可择机泛化为 `hasDynamicBackground`（展示层语义，与宿主 state 解耦）
