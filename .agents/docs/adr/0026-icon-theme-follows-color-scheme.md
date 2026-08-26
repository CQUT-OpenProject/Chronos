# ADR 0026: 图标主题撤轨并入配色方案

- **状态**: Accepted
- **日期**: 2026-08-24
- **关联提交**: `d06f326`, `f6159bc`
- **关联**: 部分取代 ADR 0019（图标主题独立偏好轨道）；延续 ADR 0018 的 Shell 图标契约
- **范围**: `packages/core/src/runtime/engine.ts`, `packages/core/src/domain/preferences.ts`, `apps/web/src/lib/app/app-shell.svelte.ts`, `apps/web/src/lib/appearance`, `apps/web/src/lib/components`

---

## 背景与问题

ADR 0019 曾把主题平台拆成「配色主题 + 图标主题」双模型，并引入用户偏好 `visualIconThemeId`，允许独立切换图标主题。实践中该拆分被证伪：

1. **产品上无独立诉求**：图标主题始终只是配色方案的附属观感。不存在「保留配色、只换图标」的真实用例；独立的图标主题选择区只会给设置页增加噪音。
2. **状态冗余**：`visualIconThemeId` 与 `visualThemeId` + `recommendedIconTheme` 三方需手工保持一致（`setColorScheme` 条件写入、`revertToDefaultThemes` 自愈），这是一处本可避免的双写缺口。
3. **误拆**：`recommendedIconTheme` 配对机制本身正确，缺的是「推荐即生效」这一步，而不是一个可供用户自由覆盖的偏好项。

## 架构决策

### 派生而非持久化

- 删除 `UserPreferences.visualIconThemeId` 及其 localStorage 键（`chronos_preferences:visual_icon_theme_id`）。
- `ChronosEngine.state.activeIconThemeId` 改为派生值（每次按规则现算，不再持久化）：若当前 active 配色主题的 `recommendedIconTheme` 已在注册表中注册，就取它；否则回退 `HOST_DEFAULT_ICON_THEME_ID`（`host-default`）。
- 派生输入一变即广播事件：`setTheme`、`themes` 注册表变更、`iconThemes` 注册表变更均 emit `iconTheme:changed`（事件契约不变）。主题插件卸载时随 `revertToDefaultThemes` 重置配色，图标主题随之自然回退，不再需要自愈分支。

### 契约保持

- `IconThemeContribution` + `IconThemeRegistry` + `theme.icon.definition` 插槽轨**保留**；官方插件仍经 `icons.json` / `iconThemeUrl` 交付，JSON-only 主题管线不变。
- `ColorThemeJson.recommendedIconTheme` 的语义从「可选建议」升级为「声明式绑定」：应用某个配色方案时，同时应用其绑定的图标主题。
- 本次移除的内容：显示设置里的「图标主题」区块、shell 的 `setIconTheme` 方法、埋点 `settings_icon_theme_change`、i18n 键 `display.section.iconTheme` / `display.iconTheme.builtinDesc`。

## 影响与收益

- 单一真相：图标主题 = f(active color theme, registry)，即由 active 配色主题与注册表现算得出；三方一致性的手工维护随之消除；
- 设置面收敛为「配色方案」一个单选项；
- 破坏性变更：已存在于用户设备上的 `visual_icon_theme_id` localStorage 键成为死数据（随偏好清除逻辑一并清理）。

## 验证

- `vp check` + `vp test`
- core 引擎测试覆盖配对生效与注销回退两条路径
