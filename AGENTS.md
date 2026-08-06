# 仓库指南

## 项目概览

Chronos 是一款课程表 PWA 应用。

| 项            | 内容                                                                     |
| ------------- | ------------------------------------------------------------------------ |
| 语言 / 框架   | TypeScript、Svelte 5、SvelteKit                                          |
| 样式 / 部署   | Tailwind CSS 4、Vercel adapter                                           |
| 数据 / 国际化 | Dexie（客户端）、Paraglide（en / zh-cn）                                 |
| 包管理器      | **pnpm**（通过 `vp` 操作，勿直接调用 pnpm / npm / yarn）                 |
| 插件          | eslint、prettier、vitest、paraglide、tailwindcss、sveltekit-adapter、PWA |

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Svelte 开发

编写或修改 `.svelte`、`.svelte.ts` 文件时，加载以下技能：

- [svelte-code-writer](.agents/skills/svelte-code-writer/SKILL.md)
- [svelte-core-bestpractices](.agents/skills/svelte-core-bestpractices/SKILL.md)

要求：

1. 涉及 Svelte / SvelteKit 话题时，先查阅文档
2. 写代码后使用 autofixer 检查，直至无问题或建议
3. 代码已写入项目文件时，不生成 playground link
4. 仅在用户确认后才提供 playground link

## 提交与 Pull Request 规范

提交信息使用 emoji 前缀、中文编写、保持简洁、根据变更类型选择：

| 变更类型          | Emoji |
| ----------------- | ----- |
| 新功能 (`feat`)   | ✨    |
| 修复 (`fix`)      | 🐛    |
| 文档 (`docs`)     | 📝    |
| 样式 (`style`)    | 💄    |
| 重构 (`refactor`) | ♻️    |
| 性能 (`perf`)     | ⚡️    |
| 测试 (`test`)     | ✅    |
| 杂务 (`chore`)    | 🔧    |
| 构建 (`build`)    | 📦    |
| CI (`ci`)         | 💚    |
| 回滚 (`revert`)   | ⏪    |
