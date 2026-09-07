# ADR 0019: Workbench 配色与图标主题平台

- **状态**: Accepted（图标主题独立偏好设置已由 [ADR 0026](./0026-icon-theme-follows-color-scheme.md) 撤销）
- **日期**: 2026-08-22
- **关联提交**: `5846ecb`, `ff1ddcc`, `10e85c2`, `9170c20`, `8cc140d`, `bb0a961`, `d94af98`
- **范围**: `packages/core/src/theme`, `packages/core/src/runtime/icon-theme-registry.ts`, `apps/web/src/lib/appearance`, `apps/web/src/lib/shell`, `apps/web/src/lib/services/official-plugins`

> **注意**：本文中「用户在设置中独立切换图标主题偏好 (`visualIconThemeId`)」的设计已被 ADR 0026 取代。图标主题现统一由激活配色方案的 `recommendedIconTheme` 属性派生，不再单独保存用户偏好；`IconThemeContribution` 与基于 JSON 的交付管线继续保持。

---

## 背景与问题

早期版本在主题配置上直接挂载了 `customCssVars` 与 `bottomTabIcons`，导致配色方案与 Shell 图标强耦合，且 CSS 变量名缺少封闭严谨的注册表（任意字符串均可注入）。项目需要一套类似现代 IDE 的「配色主题 (Color Theme) + 图标主题 (Icon Theme)」清晰解耦的主题契约体系。

---

## 架构决策

### 1. 配色主题契约 (Color Theme)

- `ThemeContribution` **必须**提供 `workbenchColors: { light, dark }`，且键必须属于 `WORKBENCH_COLOR_REGISTRY` 中预定义的封闭语义标识（如 `color.primary`、`shell.bottomTab.activeBackground`）；
- 官方插件通过静态 `colors.json` 声明配色，由 `createThemeFromColorJson` 进行严格解析与类型校验；
- 激活主题时统一调用 `applyWorkbenchColors` 将色彩变量写入 `documentElement` CSS 变量中；
- 彻底移除 `customCssVars` 等无约束的兼容层。

### 2. 图标主题契约 (Icon Theme)

- 引入 `IconThemeContribution` 与 `IconThemeRegistry`；
- 底栏图标由激活图标主题的 `bottomTabIcons[tabId]` 提供，与配色主题解耦；
- `ShellIconDescriptor` 支持 `registry` / `svg` / `url` 三种形式，宿主使用 `ShellSvgIcon` 组件统一渲染；
- 官方图标插件通过 `icons.json` 声明分发，无需携带任何 JavaScript 执行代码。

### 3. 主题推荐配对机制

- 配色主题可通过 `recommendedIconTheme` 声明推荐搭配的图标主题；
- 切换配色方案时，系统自动切换至对应推荐的图标主题，保证视觉设计风格的一致性。

---

## 影响与收益

- **设计体系规范解耦**：配色方案与图标资产各自独立分发与管理，契约清晰标准；
- **避免样式变量任意污染**：封闭的 Workbench 颜色键集合确保主题无法随意篡改宿主全局 CSS 变量；
- **轻量静态分发**：纯 JSON 格式的主题无需打包 JS 脚本，体积更小且无跨版本运行时兼容风险。

---

## 修订记录

- 2026-08-24 · [ADR 0026](./0026-icon-theme-follows-color-scheme.md)：撤销本文「图标主题独立偏好设置（`visualIconThemeId`）」；图标主题改为完全由激活配色主题的 `recommendedIconTheme` 派生。
