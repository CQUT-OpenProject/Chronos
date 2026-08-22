# ADR 0019: Workbench 配色与图标主题平台

- **状态**: Accepted
- **日期**: 2026-08-22
- **范围**: `packages/core/src/theme`, `packages/core/src/runtime/icon-theme-registry.ts`, `apps/web/src/lib/appearance`, `apps/web/src/lib/shell`, `apps/web/src/lib/services/official-plugins`

---

## 背景与问题

ADR 0018 在 `ThemeContribution.shell` 上叠加 `customCssVars` 与 `bottomTabIcons`，配色与 Shell 图标耦合在同一贡献上，且 CSS 变量键名无封闭注册表。应用尚无用户，可一次性切换到 VS Code 式「配色主题 + 图标主题」分离模型。

---

## 架构决策

### 配色主题（Color Theme）

- `ThemeContribution` **必须**提供 `workbenchColors: { light, dark }`，键为 `WORKBENCH_COLOR_REGISTRY` 中的封闭语义 id（如 `color.primary`、`shell.bottomTab.activeBackground`）。
- 官方插件通过 `colors.json` 交付；`createThemeFromColorJson` 解析并校验。
- `applyActiveTheme` 经 `resolveThemeWorkbenchColors` + `applyWorkbenchColors` 写入 `documentElement` CSS 变量。
- 移除 `customCssVars`、`shell` 子对象及 `enrichThemeContribution` 兼容层。

### 图标主题（Icon Theme）

- 新增 `IconThemeContribution` + `IconThemeRegistry`；用户偏好 `visualIconThemeId`（默认 `host-default`）。
- 底栏图标由 **active icon theme** 的 `bottomTabIcons[tabId]` 提供，而非 color theme。
- `ShellIconDescriptor` 支持 `registry` / `svg` / `url`；宿主 `resolveShellIcon` + `ShellSvgIcon` 渲染。
- 官方插件通过 `icons.json` 交付；manifest 使用 `colorsUrl` / `iconThemeUrl`（JSON-only 主题可无 JS bundle）。

### 推荐配对

- Color theme 可选 `recommendedIconTheme`；用户选择配色方案时，若目标图标主题已注册则自动切换（`setColorScheme`）。

---

## 影响与收益

- 配色与图标解耦，契约与 VS Code 主题平台对齐；
- 封闭 workbench key 防止随意 CSS 变量污染；
- JSON-only 官方主题减少 bundle 体积与跨 bundle Svelte 运行时风险。

---

## 取代

- **ADR 0018** 中 `shell.customCssVars`、`shell.bottomTabIcons` 及「图标由 active color theme 提供」的描述已被本 ADR 取代；Shell CSS 变量仍通过 workbench color key 写入。
