# ADR 0026: 图标主题撤轨并入配色方案

- **状态**: Accepted
- **日期**: 2026-08-24
- **关联提交**: `d06f326`, `f6159bc`
- **关联**: 部分取代 ADR 0019（图标主题独立偏好轨道）；延续 ADR 0018 的 Shell 图标契约
- **范围**: `packages/core/src/runtime/engine.ts`, `packages/core/src/domain/preferences.ts`, `apps/web/src/lib/app/app-shell.svelte.ts`, `apps/web/src/lib/appearance`, `apps/web/src/lib/components`

---

## 背景与问题

ADR 0019 将主题平台拆为「配色主题 + 图标主题」双模型，并引入用户偏好 `visualIconThemeId` 允许独立切换图标主题。实践中该拆分被证伪：

1. **产品上无独立诉求**：图标主题始终是配色方案的附属观感，不存在「保留配色、只换图标」的真实用例；独立选择区只增加设置噪音。
2. **状态冗余**：`visualIconThemeId` 与 `visualThemeId` + `recommendedIconTheme` 三方需手工保持一致（`setColorScheme` 条件写入、`revertToDefaultThemes` 自愈），是一处可避免的双写缝隙。
3. **误拆**：`recommendedIconTheme` 配对机制本身正确，缺的是「推荐即生效」，而非一个可自由覆盖的用户偏好。

## 架构决策

### 派生而非持久化

- 删除 `UserPreferences.visualIconThemeId` 及其 localStorage 键（`chronos_preferences:visual_icon_theme_id`）。
- `ChronosEngine.state.activeIconThemeId` 改为派生值：active 配色主题的 `recommendedIconTheme` 已注册时取之，否则回退 `HOST_DEFAULT_ICON_THEME_ID`（`host-default`）。
- 派生输入变化即广播：`setTheme`、`themes` 注册表变更、`iconThemes` 注册表变更均 emit `iconTheme:changed`（事件契约不变）。主题插件卸载时随 `revertToDefaultThemes` 重置配色后自然回退，无需自愈分支。

### 契约保持

- `IconThemeContribution` + `IconThemeRegistry` + `theme.icon.definition` 插槽轨**保留**；官方插件仍经 `icons.json` / `iconThemeUrl` 交付，JSON-only 主题管线不变。
- `ColorThemeJson.recommendedIconTheme` 语义从「可选建议」升级为「声明式绑定」：应用配色方案即应用其图标主题。
- 移除面：显示设置「图标主题」区块、shell `setIconTheme`、埋点 `settings_icon_theme_change`、i18n `display.section.iconTheme` / `display.iconTheme.builtinDesc`。

## 影响与收益

- 单一真相：图标主题 = f(active color theme, registry)，消除三态一致性维护；
- 设置面收敛为「配色方案」单选；
- 破坏性：已存在的 `visual_icon_theme_id` localStorage 键成为死数据（随偏好清除逻辑一并清理）。

## 验证

- `vp check` + `vp test`
- core 引擎测试覆盖配对生效与注销回退两条路径
