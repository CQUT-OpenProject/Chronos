# ADR 0030: 官方插件随宿主发版与启动时静默同步

- **状态**: Accepted
- **日期**: 2026-08-31
- **关联提交**: `db2128f`, `642e38b`
- **关联**: **部分修订** [ADR 0016](./0016-round3-convergence-and-deprecated-removal.md)（撤销 `minEngineVersion` 运行时校验）；延续 [ADR 0011](./0011-single-track-official-plugin-install.md) 单轨在线安装；延续 [ADR 0014](./0014-wallpaper-official-marketplace-only.md) 官方 catalog 分发
- **范围**: `packages/core`, `apps/web`, `scripts/build-official-plugins.ts`, `apps/web/static/official-plugins`

---

## 背景与问题

ADR 0016 引入 `CHRONOS_ENGINE_VERSION` 与 manifest `minEngineVersion` semver 校验，并保留单插件「检查更新 / 重装」流程。实践中出现三套版本号并行维护：

| 版本号                    | 示例    | 职责                      |
| ------------------------- | ------- | ------------------------- |
| `apps/web` 发布版本       | `0.4.1` | 产品发版                  |
| `CHRONOS_ENGINE_VERSION`  | `0.4.1` | 插件宿主 API 契约         |
| `OFFICIAL_PLUGIN_VERSION` | `1.0.0` | 官方插件 manifest.version |

官方 ESM 插件已随 `apps/web` 静态资源同发（`static/official-plugins/`），不独立热更。单插件更新 UI 与引擎版本闸门增加心智负担，且与 PWA 整包更新路径重复。

另一缺口：已安装插件的 bundle 缓存在 `installed_plugins` 中，PWA 更新宿主后 `init()` 仍直接 `activate` 本地缓存，不会自动拉新 catalog bundle。

## 架构决策

### 1 — 版本单源：`apps/web` 发布版本

- 删除 `CHRONOS_ENGINE_VERSION`、`OFFICIAL_PLUGIN_VERSION`、`PluginManifest.minEngineVersion`。
- 删除 `comparePluginVersions` / `isPluginVersionNewer` / 引擎 semver 校验。
- `scripts/build-official-plugins.ts` 从 `apps/web/package.json` 读取 `version` 写入各 manifest。
- 保留 `catalog.version`（JSON 格式号，与发版无关）。

### 2 — 移除单插件更新流程

- 删除 `checkForUpdates`、`updateInstalled`、`PluginUpdateOffer`。
- 插件页移除「更新」按钮与版本对比 UI。
- 不兼容场景统一走 PWA 整包更新（「关于 → 软件更新」）。

### 3 — 启动时静默同步已安装官方插件

[`sync-installed-plugins.ts`](../../apps/web/src/lib/services/official-plugins/sync-installed-plugins.ts) + `OfficialPluginService.syncInstalledWithHost()`：

在 `init()` 的 `dedupeBuiltinOverlap()` 之后、`activate` 之前执行：

```
load → dedupeBuiltinOverlap → syncInstalledWithHost → activate enabled
```

同步规则：

| 条件                                                                                      | 行为                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------- |
| `manifest.version === APP_VERSION`                                                        | 跳过                                        |
| `manifestUrl` 为外部 `http(s)` 链接                                                       | 跳过（第三方插件自有版本）                  |
| 官方 catalog 插件（`/official-plugins/manifests/…` 或无 manifestUrl 但 id 在 catalog 中） | 从 catalog 静默 `install({ silent: true })` |
| catalog 拉取失败                                                                          | 整体跳过，继续用缓存（离线友好）            |
| 单个插件重装失败                                                                          | `console.error`，该插件继续用缓存           |
| 插件已从 catalog 移除                                                                     | 保留本地缓存，不自动卸载                    |

### 4 — 用户数据与安装缓存分离

同步仅替换 `installed_plugins` 中的 manifest 与 bundle（`code` / `cssCode` / `colorsJson` 等）。

**不触碰**插件命名空间下的业务数据，例如：

- `tool-wallpaper` → `wallpaper_image`
- 各插件 → `PLUGIN_CONFIG_STORAGE_KEY` 配置

仅 `uninstall()` 调用 `clearPluginData(pluginId)` 时才会清除。

## 非目标

- 不恢复单插件更新 UI
- 不同步外部链接安装的插件
- 不自动卸载 catalog 已移除的插件
- 不为第三方插件重新引入引擎版本契约

## 验证

- `vp check` / `vp test` 全绿
- 官方插件 manifest `version` 与 `apps/web` 一致，无 `minEngineVersion`
- `init()` 在版本落后时静默重装官方插件，不触发 `engine.notify`
- 同步后 `wallpaper_image` 与插件配置保留

## 修订记录

- 2026-08-31：初版 Accepted；撤销 ADR 0016 `minEngineVersion` 闭环策略，改为宿主发版 + 启动同步。
