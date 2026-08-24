# 主题契约

Chronos 的主题体系由「配色主题 + 派生图标主题」组成。类型定义位于 `packages/core/src/types/contributions.ts` 与 `packages/core/src/theme/`。

## ThemeContribution（配色主题）

`theme.definition` 插槽的贡献，决定整套外观：

| 字段                                             | 说明                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `id` / `name` / `description`                    | 标识与本地化文案                                                                                              |
| `workbenchColors`                                | **封闭键集**的界面颜色，分 `light` / `dark` 两组；键名使用连字符命名（Round 6 统一，如 `--color-on-surface`） |
| `getTokens(mode, seedColor?)`                    | 返回核心设计令牌（`surface` / `primary` / `outline` 等 + 自定义扩展）                                         |
| `resolveCoursePaint?`                            | 课程卡配色；缺省走内核调色盘                                                                                  |
| `paletteEntries?`                                | 静态或按模式给出的课程调色盘条目                                                                              |
| `recommendedIconTheme?`                          | 推荐配对的图标主题 id                                                                                         |
| `supportsDynamicColor?` / `dynamicColorAdapter?` | 壁纸动态取色：`extractWallpaperSeed` → `paintWallpaperTheme` → `clearWallpaperTheme`                          |
| `className?` / `disabled?`                       | 挂载类名与条件禁用                                                                                            |

## 图标主题：派生而非持久化

用户**不单独选择**图标主题。激活配色主题的 `recommendedIconTheme` 决定当前图标主题（回退 `host-default`）；该派生值不写入用户偏好。切换配色时图标随之切换——这是 [ADR 0026](/adr/0026-icon-theme-follows-color-scheme) 对 [ADR 0019](/adr/0019-workbench-color-and-icon-theme-platform) 双模型拆分的证伪修正。

`IconThemeContribution` 交付管线不变：JSON 资源声明图标集，宿主底栏等消费 `ShellIconRef`（注册表键或结构化描述符）。

## JSON-only 主题分发

无逻辑的纯资源主题以 `ThemeManifest` 形式在线分发：manifest 显式声明 `themeId`、`colorsUrl`、`iconThemeUrl`，安装后经 `OfficialPluginService` 持有的无头 `ScopedContext` 注册资产——全程没有 JS bundle。宿主从不猜测 id 前缀。

含动态取色等逻辑的主题则走 ESM 插件形态（参考 `tool-wallpaper`）。

## 动态配色事件

内核层定义的通用事件：`dynamicColor:set`（携带 Blob）、`dynamicColor:changed`（携带 URI）、`dynamicColor:hydrate`（请求重放当前状态）。宿主 `app-shell` 只保存一个 `dynamicColorUri`（后发出的覆盖先前的），并把 URI 交给当前主题的适配器上色。偏好中的 scheme id `wallpaper` 是历史兼容命名。

## 用户偏好相关项

- `visualThemeId`：用户选择的配色主题。
- palette `vibrant | wallpaper`：`wallpaper` 表示动态取色轨。
- 无 `iconThemeId` 偏好字段——不要新增。
