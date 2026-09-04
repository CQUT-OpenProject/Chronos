# ADR 0033: 壳常驻冻结与二级页 View Transition 隔离

- **状态**: Accepted
- **日期**: 2026-09-03
- **关联**: 延续 [ADR 0029](./0029-shell-internal-tab-navigation.md) 壳内 Tab；不改变二级页 URL 与 `backShellTab`
- **范围**: `apps/web`, `packages/ui-kit`

---

## 背景与问题

ADR 0029 把底栏改成壳内 `activeTabId` 切换。0.4.3 用 `mountedTabIds` + idle `warmup` 保住课表 Tab，避免切换时重建 Swiper 与课表网格。保活集合活在根 layout，面板 DOM 却挂在 `(tabs)/+page`：进入二级页会拆掉面板，返回时按集合一次性重建所有已访问 Tab。该重建发生在 `document.startViewTransition` 的 update callback 内，且 `view-transition-name` 打在整页 `.page-root` 上。进入「设置课表壁纸」时还会再挂一棵 `TimetablePreviewGrid`，过渡卡顿。

## 架构决策

### 1 — 壳与二级页兄弟层

根 layout 常驻 [`ShellRouteHost`](../../../apps/web/src/lib/components/shell/ShellRouteHost.svelte)（`ShellTabPanels` + `BottomTabBar`）。SvelteKit `children` 只承载 `/` 的空路由或二级页。禁止把壳和二级页放进同一个带 `view-transition-name` 的祖先。

### 2 — 离屏冻结

[`secondary-transition-gate`](../../../apps/web/src/lib/navigation/secondary-transition-gate.svelte.ts)：

- 壳路由：解冻、取消 recede、`previewPaintReady = true`，并启用壳宿主
- 二级页（无自定义过渡）：若宿主已启用则立刻冻结
- View Transition 正向：旧快照保持壳可绘制；根快照做 25% 退让位图动画并隐藏 `new(root)`；`finished` 后冻结
- View Transition 返回：面板保持冻结（不铺邻周），仅揭开当前 Tab 供新快照；`::view-transition-new(root)` 做退让还原；`finished` 后解冻
- 深链直达二级页：不立刻挂壳；idle 或回到 `/` 后再启用宿主

冻结样式：`.shell-root.is-frozen { content-visibility: hidden }` + `inert`。隐藏 Tab 继续 `display: none`。`mountedTabIds` / idle warmup 仍只服务壳内 Tab 切换。

### 3 — 过渡只拍二级层

`view-transition-name: page-root` 挂在 `SecondaryPageShell` 根节点。`.shell-root { view-transition-name: none }` 仍会进入根快照，因此壳↔二级页时关掉根组默认 `plus-lighter` 交叉淡入：正向用 `::view-transition-old(root)` 做 25% 退让位图动画并隐藏 `new(root)`，返回则相反。二级页↔二级页隐藏根组，只动画 `page-root`。禁止在活的 `.shell-root` 上做 `transform`/`opacity` CSS transition——View Transition 覆盖层会挡住活 DOM，那段过渡只会拖累保活课表树。

### 4 — 预览网格延迟绘制

过渡期间 `previewPaintReady = false`。`TimetablePreviewGrid` 经可选 context 读取该标志，未就绪时不挂胶囊树。无 View Transition 时立即就绪。峰值活渲染只有一棵课表树。

## 非目标

- 不退回每次点课表 Tab 都重新 mount
- 不做课表虚拟化
- 不把二级页做成多页保活
- 不改变 `isShellRoute` / `isSecondaryRoute` 与二级页 URL

## 验证

- `vp check` / `vp test` 全绿
- 今日 Tab → 课表：即时出现
- 课表 → 壁纸设置：推入跟手；过渡结束后壳为 `content-visibility: hidden`
- 返回壳：仍在课表 Tab，周次不丢
- 深链 `/about`：首屏不挂课表 DOM

## 修订记录

- 2026-09-03：初版 Accepted。
- 2026-09-03：壳退让改由根快照位图承担；活壳去掉 CSS transition，避免与 `::view-transition-old(root)` 的 plus-lighter 交叉淡入叠跑。
- 2026-09-03：过渡期间不再解冻壳（避免邻周网格在 callback 里铺开）；根快照改为静止背景，只动画二级层。
- 2026-09-03：恢复一级页退让：根快照位图动画 `vt-forward-old` / `vt-back-new`；返回时 `skipPaint` 揭开当前 Tab，仍不铺邻周。
