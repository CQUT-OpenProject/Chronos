<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Quick Overview

Chronos is a PWA timetable app.

- Stack: TypeScript, Svelte 5, SvelteKit, Tailwind CSS 4
- Data & i18n: Dexie (Client-side), Paraglide (en / zh-cn), PostHog
- Package Manager: Use `vp` / `vpx` CLI only (do not invoke pnpm / npm / yarn / npx directly). `vpx` is the only allowed runner for one-off package binaries (e.g. `vpx @sveltejs/mcp ...`).
- Developer docs: See `CONTRIBUTING.md` at the repository root

## Write Code

For behavior, framework, or architecture changes, use `.agents/skills/tobelazy/SKILL.md` to select relevant guidance. Simple edits need only the local context and a diff review.

Proceed through implementation and applicable validation without waiting for plan approval. Decide reversible implementation details independently and do not reconfirm actions already authorized. Ask only about ambiguities that materially affect acceptance or unauthorized decisions involving data loss, breaking external protocols, or adding dependencies. Continue independent work while awaiting an answer. Declare authorized breaking changes in the final response.

## Response Format

Be concise. Do not write unsolicited "WHY" explanations. Required declarations (breaking changes, root cause, validation results) always override this.

## Commit Convention

Use Gitmoji format: `<emoji> <concise Chinese>` (no `feat:`/`fix:` prefix). e.g., `✨ 新增课表导出功能`.
Do not commit / push unless explicitly requested; reporting completion ≠ committing.

## Validation

Canonical commands are `vp run check` and `vp run test` (see `CONTRIBUTING.md`; `vite.config.ts` tasks wrap `vp check` / `vp test` with `svelte-kit sync` / cwd). Run scoped single-file tests during iteration, full suite once at the end; docs-only changes may skip tests with a note. Run `vp install` only when deps / manifest changed or install is stale. On env issues run `vp env doctor`, attempt the obvious fix first, and only ask for help if still blocked.

Skills share these validation results for the same final code state. Rerun affected checks only after further changes, failures, or new evidence. Fix failures caused by the requested change; report unrelated failures without expanding scope. Work is complete when the requested behavior is implemented, applicable validation is complete, and any remaining limitations are reported.
