# ADR 0026: 图标主题由配色方案派生与独立偏好废弃

- **状态**: Accepted
- **日期**: 2026-08-24
- **关联提交**: `d06f326`, `f6159bc`
- **关联**: 部分取代 [ADR 0019](./0019-workbench-color-and-icon-theme-platform.md)（废弃图标主题独立偏好设置，改为由配色方案派生）
- **范围**: `packages/core/src/runtime/engine.ts`, `packages/core/src/domain/preferences.ts`, `apps/web/src/lib/app/app-shell.svelte.ts`, `apps/web/src/lib/appearance`, `apps/web/src/lib/components`

---

## 背景与问题

ADR 0019 曾将配色方案与图标主题完全独立为两套用户偏好（`colorSchemeId` 与 `visualIconThemeId`）。但在实际设计与用户反馈中发现：

1. **视觉风格容易割裂**：用户自由混搭配色与图标（如梦见多二次元配色搭配严肃线框图标）容易产生不协调的视觉冲突；
2. **设置界面复杂度增加**：在设置页中单独提供图标主题选择器增加了普通用户的配置门槛；
3. **维护状态冗余**：图标主题几乎总是与特定配色方案配套设计并一同发布的。

---

## 架构决策

```mermaid
flowchart LR
    User[用户选择配色方案] --> ThemeDef[ThemeContribution]
    ThemeDef --> Derive["recommendedIconTheme (推荐图标主题)"]
    Derive --> ActiveIcon["activeIconThemeId (纯派生状态 / 不落盘)"]
    ActiveIcon --> Render[ShellSvgIcon 渲染对应图标]
```

### 1. 废弃 `visualIconThemeId` 独立偏好

- 从 `UserPreferences` 中彻底移除 `visualIconThemeId` 字段；
- 从设置界面中移除独立的图标主题切换选项，精简界面交互。

### 2. 图标主题完全由当前激活配色方案派生

- 运行时计算属性 `activeIconThemeId` 统一由当前激活配色主题的 `recommendedIconTheme` 字段动态派生；
- 若当前配色方案未声明推荐图标，则自动平滑回退至默认宿主图标主题 `host-default`。

### 3. 保留图标主题标准交付管线

- `IconThemeContribution` 与基于 `icons.json` 的静态资产加载和渲染机制保持不变，确保视觉资产的模块化隔离。

---

## 影响与收益

- **设计视觉统一**：保证了配色方案与图标风格的高度和谐与官方设计一致性；
- **配置体验精简**：减少了冗余的设置选项，用户只需选择心仪的配色方案即可自动获得整套视觉体验；
- **状态更轻量**：减少了一处持久化状态，消除了潜在的状态不一致与迁移负担。

---

## 验证

- `vp check` / `vp test` 全量通过；
- 切换梦见多等具有专属图标的主题时，底栏与功能图标自动无缝切换；切换至默认主题时图标正确恢复默认线框。
