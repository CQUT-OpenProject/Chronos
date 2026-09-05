# ADR 0029: 壳内 Tab 导航与底栏槽位去 URL 化

- **状态**: Accepted
- **日期**: 2026-08-30
- **关联提交**: `ffbd2c7`, `f028e0d`
- **关联**: 取代 [ADR 0028](./0028-today-plugin-default-launch-and-day-clock.md) §3–§4 的路由约定；延续 [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md) 底栏插槽；延续 [ADR 0021](./0021-slot-consumption-seam.md) `resolveSlotOwner` 消费缝隙
- **范围**: `packages/core`, `packages/plugins/today`, `apps/web`

---

## 背景与问题

ADR 0028 为底栏 Tab 引入 `defaultLaunch` 与 `HOST_SHELL_TAB_ROUTES`，要求插件 `href`、宿主 `(tabs)/<route>/+page.svelte` 与 core 白名单三处人工对齐。底栏本质是壳的主视图切换，不是可分享的外链目的地；与二级页 `/plugins/[pluginId]/...` 混用 URL 导航造成重复胶水。

## 架构决策

### 1 — 底栏槽位删除 `href`

`BottomTabSlotContribution` 仅保留 `id`、`label`、`order`、图标与 `defaultLaunch`。宿主以 `activeTabId` 状态切换视图，不再为每个 Tab 维护 SvelteKit 子路由。

### 2 — 壳内 Tab 控制器

[`apps/web/src/lib/shell/shell-tab.svelte.ts`](../../apps/web/src/lib/shell/shell-tab.svelte.ts)：

- `init()`：`resolveDefaultLaunchTab` → 初始 `activeTabId`
- `setActiveTab(id)`：底栏切换
- `slotVersion` 监听：当前 Tab 卸载时回退到 `order` 最小可用 Tab

在根 layout 注入 `shellTab` context。

### 3 — 单一路由壳与 `ShellTabPanels`

唯一壳路由 `/`（[`(tabs)/+page.svelte`](<../../apps/web/src/routes/(tabs)/+page.svelte>)）标识壳表面；面板由根 layout [`ShellRouteHost`](../../apps/web/src/lib/components/shell/ShellRouteHost.svelte) 常驻渲染 [`ShellTabPanels`](../../apps/web/src/lib/components/shell/ShellTabPanels.svelte)（见 [ADR 0033](./0033-persistent-shell-freeze-and-secondary-view-transition.md)）：

| `activeTabId` | 渲染                                         |
| ------------- | -------------------------------------------- |
| `timetable`   | 宿主课表屏                                   |
| `mine`        | 宿主我的屏                                   |
| 插件 Tab id   | `resolveSlotOwner` → `PluginScreenContainer` |

删除 `(tabs)/today`、`(tabs)/mine` 专页；删除 `tryDefaultLaunchRedirect` 与 `HOST_SHELL_TAB_ROUTES`。

### 4 — `BottomTabBar` 按钮切换

底栏由 `<a href>` 改为 `<button role="tab">`，通过 `shellTab.setActiveTab` 切换。课表 Tab 在已激活时二次点击仍 `jumpToCurrentWeek`。

### 5 — 二级页返回壳 Tab

`SecondaryPageShell` 新增 `backShellTab`：返回 `/` 并 `setActiveTab`，替代 `backHref="/mine"`。

### 6 — 路由判定简化

`isShellRoute` 仅 `/`；`isSecondaryRoute` 为其补集。`/today`、`/mine` 不再存在（无重定向）。

## 非目标

- 不删除 `defaultLaunch`（仍决定冷启动初始 Tab）
- 不改变 `/plugins/[pluginId]/...` 二级工具页
- 不引入 `?tab=` 深链或历史栈 Tab 切换

## 验证

- `vp check` / `vp test` 全绿
- 安装今日插件后冷启动默认显示今日 Tab（URL 仍为 `/`）
- 二级页返回恢复「我的」Tab；直接访问 `/today`、`/mine` 为 404

## 修订记录

- 2026-08-30：初版 Accepted。
- 2026-09-03：`ShellTabPanels` 改由根 layout `ShellRouteHost` 常驻，见 ADR 0033。
