# ADR 0028: 今日插件、defaultLaunch 冷启动与 day-clock 收敛

- **状态**: Accepted（§3–§4 路由约定 Superseded by ADR 0029）
- **日期**: 2026-08-28
- **关联提交**: `c8fc9e7`, `f8b71f4`, `29ad4c1`, `1dd631a`
- **关联**: 落实代码审查修复；**延续** [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md) 底栏插槽；**延续** [ADR 0023](./0023-round4-gate-typing-dead-face-component-single-track.md) `queryCourses` RESERVED 决策（首消费者落地）
- **范围**: `packages/core`, `packages/plugins/today`, `apps/web`

---

## 背景与问题

「今日」官方插件与宿主 `defaultLaunch` 能力合并后，审查发现：

1. **时钟逻辑重复且易错**：`TodayScreen` 与 `timetable-screen` 各自维护午夜/节次 `setTimeout`；`TodayScreen` 在空 `periodTimes` 时提前 `return`，切换课表后节次定时器永不启动。
2. **Svelte 反模式**：`TodayScreen` 用 `$effect` 触发异步 `refreshCourses()`，将数据加载与 UI 耦合。
3. **日历工具重复**：`dayOfWeekFromIso` 在 Today 插件与 `TimetableScreen` 各有一份实现。
4. **BottomSheet 返回键**：课程详情改为弹层后无 history 适配，PWA 系统返回绕过弹层。
5. **Tab 路由双维护**：`defaultLaunch` 重定向与 `tabRoutes` 各维护合法路径白名单。
6. **`queryCourses` 零消费**：CONTEXT 仍标注无生产消费者，与今日插件实际调用不符。

## 架构决策

### 1 — period-clock 扩展与 `createDayClock`

在 [`packages/core/src/engine/period-clock.ts`](../packages/core/src/engine/period-clock.ts) 新增：

- `computeDelayUntilNextMidnightMillis`
- `createDayClock({ getPeriodTimes, onMidnight, onPeriodBoundary })` → `{ reschedule, dispose }`

行为：`reschedule()` 清除并重建午夜/节次 timer；`periodTimes` 为空时跳过节次 timer（不永久放弃）；课表或节次变更时由调用方 `reschedule()`。

`dayOfWeekFromIso` 迁入 [`packages/core/src/engine/date.ts`](../packages/core/src/engine/date.ts)（ISO 本地日历星期 1–7）。

`timetable-screen.svelte.ts` 与 `today-screen.svelte.ts` 均委托 `createDayClock`。

### 2 — Today 插件 controller 化

新建 `packages/plugins/today/src/today-screen.svelte.ts`：

- 持有 `today` / `now` / `scope` / `courseEntries` 状态
- 显式 `init` / `dispose` / `refreshCourses` / `persistScope`
- `TodayScreen.svelte` 仅负责渲染

`packages/plugins/today/src/index.ts` 删除 `export * from './today-courses'`，收窄 public 面。

### 3 — `defaultLaunch` 冷启动

- `BottomTabSlotContribution.defaultLaunch?: boolean`
- `resolveDefaultLaunchTab(tabs)` — 多个声明时 **最低 `order` 胜出**
- 宿主 `tryDefaultLaunchRedirect`：仅在冷启动路径 `/`、once-per-session、`isHostShellTabRoute(href)` 时 `replaceState` 重定向

### 4 — `HOST_SHELL_TAB_ROUTES` 单源

[`packages/core/src/shell/host-tab-routes.ts`](../packages/core/src/shell/host-tab-routes.ts)：

```typescript
export const HOST_SHELL_TAB_ROUTES = ['/', '/today', '/mine'] as const;
export function isHostShellTabRoute(href: string): boolean;
```

`apps/web/src/routes/(tabs)/navigation.ts` re-export 为 `tabRoutes`。

**约定**：新增底栏 Tab 须同时更新 `HOST_SHELL_TAB_ROUTES`、`(tabs)/<route>/+page.svelte`、插件 `shell.bottom-bar.tab` 注册。

### 5 — BottomSheet history overlay

[`apps/web/src/lib/navigation/history-overlay.ts`](../../apps/web/src/lib/navigation/history-overlay.ts) 提供 `createHistoryOverlaySync`：

- 打开时 `pushState`
- `popstate` 关闭弹层
- 程序化关闭时 `history.back()`（防循环标志）

`BottomSheet` 新增 `manageHistory`（默认 `true`）。

### 6 — `queryCourses` 首消费者

`tool-today` 的 `queryTodayCourses` 成为 `IStorageService.queryCourses` 的首个生产消费者；`scope: 'all'` 时对每张课表分别计算 academic week 后查询。端口保持 RESERVED 标注，不扩展查询参数。

## 非目标

- 不删除 ADR 0023 FROZEN serial/waterfall 机制
- 不将 `SegmentedControl` 下沉到 ui-kit（插件包无法依赖 `apps/web` 组件）
- 不动 `CourseDetailScreen` 路由形态

## 验证

- `vp check` / `vp test` 全绿
- 手动：冷启动安装今日插件后默认打开 `/today`；课程详情弹层系统返回先关弹层；切换课表后节次状态刷新

## 修订记录

- 2026-08-28：初版 Accepted。
- 2026-08-30 · [ADR 0029](./0029-shell-internal-tab-navigation.md)：本文 §3–§4 路由约定（`href` / `HOST_SHELL_TAB_ROUTES` 三处对齐）被取代，底栏去 URL 化。
