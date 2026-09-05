# ADR 0034: 设计 Token 分层与命名

- **状态**: Accepted
- **日期**: 2026-08-29
- **关联提交**: `baf0d67`
- **关联**: 延续 [ADR 0019](./0019-workbench-color-and-icon-theme-platform.md) workbench 注册表
- **范围**: `packages/ui-kit/src/theme`, `apps/web/src/lib/theme`, `packages/core/src/theme/workbench-colors.ts`

---

## 背景与问题

样式 token 散落在 `generated-theme.css`、`layout.css` `@layer tokens`、`m3.css` 与运行时 `workbenchColors` 四处；宿主颜色覆盖与 M3 产物重复；`m3-*` 类名暗示 MD3 合规，实际 UI 已定制。

## 架构决策

1. **宿主颜色单源**——`CHRONOS_HOST_COLORS` 并入 `buildGeneratedThemeCss()`；删除 `layout.css` 内重复 hex。
2. **目录**——`apps/web/src/lib/m3/` 改为 `apps/web/src/lib/theme/`（`generated-colors`、`typography`、`radius`、`layout-tokens`、`ui-patterns`）。
3. **命名**——排版 `text-*`；组件模式 `ui-*`；壳顶栏 `ui-shell-top-bar`。遗留 `m3-*` 别名暂时保留。
4. **Workbench 注册表**——扩展宿主语义键（`color.canvas`、`color.ink` 等）。

## 后果

- `m3-default` 主题仍跳过内联 CSS 应用；生成 CSS 须与 `workbenchColors` 对齐。
- 插件主题可省略新增 workbench 键；CSS 默认值兜底。
- 维护指南见 `docs/design-tokens.md`。

## 修订记录

- 2026-08-29：初版 Accepted。
- 2026-09-05：原编号 `0029-design-token-layering` 与壳内 Tab 导航 ADR 重号，改编号为 `0034`（决策日期不变）。
