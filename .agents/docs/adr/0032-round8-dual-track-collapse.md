# ADR 0032: Round 8 双轨塌缩与插件契约收口

- **状态**: Accepted
- **日期**: 2026-09-01
- **关联提交**: `c426f19`, `f835e02`, `f0171c7`
- **关联**: 延续 [ADR 0029](./0029-shell-internal-tab-navigation.md) 壳内 Tab（`hostPanel` 建于 `activeTabId` 之上）与 [ADR 0021](./0021-slot-consumption-seam.md) 消费缝隙；catalog 双源维持 [ADR 0027](./0027-round6-architecture-subtraction.md) 结论
- **范围**: `packages/core`, `apps/web`, `packages/plugins/*`, `packages/ui-kit`

---

## 背景与问题

Round 7 之后审查仍核对到几处真实双轨：宿主 `loadProfilePlugins` 与 `ProfileManager.applyProfile` 并行、`availablePlugins` 被当成全量 builtin、profile 插件列表在 `profile-registry` 与 `profile-definitions` 各写一份、导入插件未统一 `ImportSlotError`、壳消费点硬编码 `'timetable' | 'mine'` tab id。`core-shell` 仍手写 `ChronosPlugin` 与模块级 translate。

## 架构决策

### 1. ProfileManager 唯一装配面

- `ProfileManager.loadPlugins(profile, resolvePlugin, filter)` 与 `applyProfile(profile, resolvePlugin)` 拥有加载、分层 `disabledSlots` config、handle 与 `activeProfile`。
- 宿主只提供异步 adapter `resolveBuiltinPlugin`；删除 `loadProfilePlugins` 与名为全量的 `availablePlugins`。
- 插件中心 builtin 列表优先读 phase 1 展示缓存（`resolveProfileBuiltinPlugins` 动态 import 元数据，不 `loadPlugin`），否则 `listLoadedPlugins()`。
- 恢复出厂只走 `applyProfile`。

### 2. ChronosProfile 字面量单源

- 完整 `ChronosProfile` 表只在 `profile-definitions.ts`。
- `PluginProfileConfig.server?: boolean` 派生 codegen 的 builtin / server id；删除 `PROFILE_BUILTIN_PLUGINS` / `PROFILE_SERVER_PLUGINS`。
- `profile-registry.ts` 仅封装 `registeredProfiles` + `resolveActiveProfile()`。

### 3. 壳槽位 `hostPanel`

- `BottomTabSlotContribution.hostPanel?: 'timetable' | 'mine'`。宿主只认该字段渲染课表/我的屏，不认 tab id 字符串。
- 无 `hostPanel` 的 tab 走 `resolveSlotOwner` + `PluginScreenContainer`。
- 冷启动 fallback：`resolveHostPanelTab(tabs, 'timetable')`，否则 registry 第一项。
- `mine.item` 缺省分区：`DEFAULT_MINE_SECTION_ID = 'app-support'`。

### 4. 导入契约

- 导入轨 `executeImport` 抛 `ImportSlotError`（`source-cqut` / `codec-qrcode` / `codec-share`）。
- 导入 Tab 失败通知走 `controller.notify`，禁止 `alert`。
- 消费端 badge 经 `resolveLocalizedText`。

### 5. 插件规范

- `core-shell` 迁 `defineChronosPlugin`；`keywords` 进 host catalog，`t('item.*.keywords').split(',')`。
- QR `qrCodecLabels(locale)` 在 `executeImport` / deserialize 调用点解析；`decodeQrFromBlob` 必传 `labelFor`。
- `pluginText` 可选 `params`，转 `translatePlugin` / `interpolateMessage`。

## 非目标

- 不删 FROZEN serial/waterfall，不碰 BadgeManager / `queryCourses` 形状。
- 不把课表/我的屏改成 `ChronosMountable`。
- 不合并 official catalog 的 name/description 双源（ADR 0027）。
- 不改 `DYNAMIC_COLOR_SCHEME_ID = 'wallpaper'`。

## 后果

Profile 装配、字面量与壳消费各剩一条缝；导入失败与插件 i18n 与既有内核契约对齐。

## 修订记录

- 2026-09-01：初版 Accepted。
