# ADR 0018: 主题 Shell 外观扩展契约

- **状态**: Accepted
- **日期**: 2026-08-22
- **范围**: `packages/core/src/types/contributions.ts`, `apps/web/src/lib/appearance`, `apps/web/src/lib/shell`, `apps/web/src/lib/components/BottomTabBar.svelte`

---

## 背景与问题

1. 底栏 Tab 虽由 `shell.bottom-bar.tab` 插槽注册，但图标依赖宿主 `BOTTOM_TAB_ICON_MAP` 硬编码回退，与插槽声明脱节；
2. `ThemeContribution` 仅覆盖配色 token，无法按 active theme 定制底栏 active 态、leading-icon 背景、顶/底栏容器样式；
3. YUMEMITA 等主题写入的 `--leading-icon-*` CSS 变量未被宿主 UI 消费。

---

## 架构决策

在 `ThemeContribution` 上增加可选 `shell` 字段（`ThemeShellContribution`），不新增插槽：

| 字段                   | 作用                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| `shell.customCssVars`  | Shell 专用 CSS 变量，与根级 `customCssVars` 合并后由 `applyActiveTheme` 写入 `documentElement` |
| `shell.bottomTabIcons` | active theme 下按 `tab.id` 覆盖底栏图标（`ShellIconRef`：宿主注册表 key 或 Svelte 组件）       |

标准 Shell CSS 变量（宿主组件以 fallback 保持默认 M3）：

- `--shell-bottom-tab-active-bg` / `--shell-bottom-tab-active-fg`
- `--shell-bottom-bar-bg` / `--shell-top-bar-bg`
- `--leading-icon-bg(-{tone})` / `--leading-icon-color(-{tone})`

底栏图标解析优先级：

```text
theme.shell.bottomTabIcons[tabId] → tab.icon / tab.iconFill → undefined
```

`core-shell` 在 `shell.bottom-bar.tab` 贡献上声明默认图标 key；宿主 `SHELL_ICON_MAP` + `resolveShellIcon` 统一解析。

---

## 影响与收益

- 主题插件可在不注册额外插槽的情况下定制 Shell 外观，切换主题或壁纸取色时自动清理；
- 底栏图标与插槽契约对齐，消除 `BottomTabBar` 对 tab id 硬编码映射的依赖；
- leading-icon 与底栏 active 态通过 CSS 变量接通，插件与宿主契约清晰。
