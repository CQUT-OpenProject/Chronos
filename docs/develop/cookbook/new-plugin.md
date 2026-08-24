# 新增一个官方插件

从零到出现在官方插件市场（catalog）的完整步骤。示例以 JSON-only 主题插件为最短路径，ESM 插件的差异在第 5 步说明。

## 1. 建包

在 `packages/plugins/` 下新建目录（命名 `theme-<name>` / `codec-<name>` / `source-<name>` / `tool-<name>`），`package.json` 参照 `packages/plugins/theme-yumemita`。依赖只允许 `@chronos/core`、`@chronos/ui-kit` 与纯工具库；**不得依赖其他插件**。

## 2. 实现插件

- **主题插件（无 JS）**：准备两份 JSON——配色（对应 `ThemeContribution` 的 workbench 颜色键与令牌）与图标主题，无需写任何代码。
- **逻辑/富 UI 插件**：用 `defineChronosPlugin` 编写入口并在 `apply` 中注册槽位，参考[插件作者指南](../plugin-authoring.md)。富 UI 必须走单一 `ChronosMountable` 协议。

## 3. 注册进构建配置

编辑 `scripts/official-plugins.config.ts`：把新插件加入构建映射（源码目录 → bundle 输出 + manifest 元数据）。version 以配置文件为单源，不要在插件代码里另写一份。

## 4. 构建并校验

```sh
vp run build:official-plugins   # 产出 bundle / manifest / catalog.json 并更新哈希
vp run verify:official-plugins  # 自校验检查：哈希、manifest 字段、catalog 一致性
```

产物写入 `apps/web/static/official-plugins/`，包括 `catalog.json`。两个脚本任一失败都不得提交。

## 5. ESM 插件附加要求

若插件含 JS：

1. bundle 必须自包含（Svelte 编译进产物），通过 Blob ESM 导入加载；
2. manifest 声明 `cssUrl`、`cssSha256`、`jsSha256` 与 `minEngineVersion`；
3. 富 UI 暴露 mountable 包装器而非裸组件；
4. 本地验证可在「我的 → 插件」中经 catalog 在线安装路径走一遍（双轨行为必须一致，见 [ADR 0011](/adr/0011-single-track-official-plugin-install)）。

## 6. 收尾

- 更新 `CONTEXT.md` 若引入了新的词汇或冲突策略行。
- 若新增了可复用契约（如新的插槽字段），先读[新增一种插槽类型](./new-slot-type.md)。
- 提交信息遵循仓库 Gitmoji 约定。

## 验证清单

- [ ] `verify-official-plugins` 通过
- [ ] 安装 → 启用 → 禁用 → 卸载 全链路正常，卸载后主题回退默认
- [ ] 语言切换后插件文案跟随（有 i18n 时）
- [ ] 未注册任何宿主特判：`grep` 宿主源码中不应出现你的插件 id（catalog 配置除外）
