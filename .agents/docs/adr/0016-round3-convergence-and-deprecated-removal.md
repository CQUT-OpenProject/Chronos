# ADR 0016: Round 3 架构收敛 — 废弃接口清零、泛化动态色彩契约与运行时实例隔离

- **状态**: Accepted
- **日期**: 2026-08-22
- **关联提交**: `8ad8f88`, `ffba381`, `488a034`, `74ea6d5`, `ec843f5`, `46d1bb0`, `e49fa3e`
- **范围**: `packages/core`, `packages/plugins/wallpaper`, `packages/ui-kit`, `apps/web`, `scripts/resolve-chronos-aliases.ts`

---

## 背景与问题

ADR 0015 完成构建隔离与凭据解耦后，架构审计进一步指出：

1. **废弃（deprecated）兼容层堆积**：代码库中保留了大量旧命名别名，导致同一功能存在新旧两套调用方式，容易引起混淆；
2. **壁纸运行时单例隔离不彻底**：单例实现未能完全隔离不同上下文，重复加载时可能产生内部状态串扰；
3. **动态色彩事件机制待完善**：ADR 0013 移出壁纸事件后，通用动态取色能力缺少跨主题的统一广播契约。

---

## 架构决策

### 1. 彻底清理所有 `@deprecated` 废弃接口

| 移除项                                          | 替代标准接口                                              | 说明                         |
| :---------------------------------------------- | :-------------------------------------------------------- | :--------------------------- |
| `app-shell.state.hasWallpaper` / `wallpaperUri` | `hasDynamicColorBackground` / `dynamicColorUri`           | 泛化为通用动态色彩属性       |
| `app-shell.setWallpaper`                        | `setDynamicColorAsset`                                    | 移除宿主专有别名             |
| `CredentialRecord` / `createCredentialVault`    | `PluginCredentialRecord` / `createGenericCredentialVault` | 全面迁移至通用凭据类型       |
| `BUILTIN_COLOR_SCHEME_WALLPAPER`                | `DYNAMIC_COLOR_SCHEME_ID`                                 | 消除硬编码方案别名           |
| `setWallpaperChangeHandler`                     | `WallpaperRuntime.setChangeHandler`                       | 规范运行时实例调用           |
| `EngineController.rawEngine`                    | 统一使用类型化 controller 方法                            | 消除绕过 controller 的裸调用 |

代码库实现零 `@deprecated` 遗留，所有调用方全部迁移至最新标准 API。

### 2. 内核承载泛化 `dynamicColor:*` 事件契约

在 `ChronosEvents` 中定义与具体插件无关的通用动态色彩三元组：

- `dynamicColor:set` — 请求设置动态色彩取色源（`Blob | null`）；
- `dynamicColor:changed` — 动态取色 URI 变更全局广播；
- `dynamicColor:hydrate` — 新订阅方请求同步当前色彩状态。

`@chronos/plugin-wallpaper` 与其他视觉主题均接入此统一契约，宿主仅需订阅通用色彩事件，无需感知任何具体插件实现。

### 3. 基于 Map 的运行时实例级完全隔离

- `getWallpaperRuntime(pluginId)` 采用 `Map<string, WallpaperRuntime>` 按 `pluginId` 隔离运行时实例；
- `createWallpaperRuntime(storage, pluginId)` 通过独立闭包持有自身状态，跨生命周期加载与重置互不影响；
- `PluginScreenContainer` 严格校验 `Symbol.for('chronos.mountable')`，杜绝不安全的鸭子类型检测。

---

## 影响与收益

- **代码库完全零技术债**：消除全部兼容别名，API 入口单一明确；
- **动态取色能力通用化**：内核事件契约可支撑任意自定义主题与取色插件，不再受限于特定壁纸实现；
- **运行时实例绝对安全**：Map 级实例隔离彻底杜绝了多插件或热重载时的状态污染问题。

---

## 验证

- `vp check` 与 `vp test` 全量通过；
- 动态背景取色、壁纸切换及凭据处理全链路手工与自动化测试均表现正常。
