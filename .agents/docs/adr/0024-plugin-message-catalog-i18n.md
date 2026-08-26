# ADR 0024: 插件 Message Catalog 多语言架构

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `450d2c5`, `943b5f5`, `481a3b6`, `d5622ef`, `318db1a`, `8886125`, `689c87f`, `7d3ed9d`, `2d967a5`, `50dc61d`
- **关联**: 落实 Round 5 C3 演进（保留 engine i18n 链）；扩展 ADR 0021 `LocalizedText` 消费模型；**§D4 宿主桥接由 [ADR 0027](./0027-round6-architecture-subtraction.md) 修订**（移除 `i18nHandler` / `engine.t()`，宿主 Shell 改 `hostT`）
- **范围**: `packages/core`, `packages/ui-kit`, `apps/web`, `packages/plugins/*`

---

## 背景与问题

宿主 Shell 已使用 Paraglide 管理文案（`apps/web/messages/`），但插件插槽的文案大多还是硬编码中文的 `() => '...'`。引擎层保留了 `setLocale` / `ctx.i18n` / `i18n:localeChanged` 这条链路，但生产环境没有流量经过它。Round 5 审计建议删除该链路；而产品目标恰是通过插件实现多语言，因此需要的是一份正式契约（message catalog，按键值组织的多语言文案表），而不是一个休眠 API。

## 架构决策

### D1 — Message catalog 模型

插件在 `apply(ctx)` 内调用 `ctx.i18n.registerMessages(catalog)` 注册自己的 message catalog：

- `catalog` 的类型为 `Record<locale, Record<key, string>>`
- 引擎自动给每个 key 加上 `pluginId:` 命名空间前缀
- 插槽与 schema 经 `() => ctx.i18n.t('import.title')` 取文案
- `registerMessages` 返回 `Disposable`；执行 `unloadPlugin` 时会一并移除该插件的条目

### D2 — LocalizedText

保留 `string | (() => string)` 类型。推荐在函数体内调用 `ctx.i18n.t` 取文案。`resolveLocalizedText` 接受可选的 `locale` 参数；locale 切换后经 `i18n:localeChanged` → `slotVersion++` 触发文案重算。

### D3 — Locale 规范

规范 id：`zh-cn` | `en`（与 Paraglide 对齐）。构建元数据 `zh-CN` 在 ingest 时 normalize 为 `zh-cn`。

### D4 — 宿主桥接

语言切换 UI 同时更新 Paraglide runtime 与 `engine.setLocale`。~~`i18nHandler` 仅服务宿主 Paraglide key 回退~~（**ADR 0027 已删除**）；宿主 Shell 文案经 `host-i18n.svelte.ts` 的 `hostT()` 走 `host-ui` catalog；插件文案走各自 catalog + `pluginText`。

### D5 — C3 处置

**不删除** engine i18n 链。将其定义为 RESERVED（预留状态），并接通最小闭环（catalog + setLocale + localeChanged）。

### D6 — Plugin activation

移除第二套 DI（依赖注入）机制 `plugin.inject` / `ctx.inject`（Round 5 C1）。插件激活收敛为单轨：`loadPlugin` → `apply(ScopedContext)`。

## 插件作者指南

1. 在 `apply` 首行调用 `registerMessages({ 'zh-cn': {...}, en: {...} })`
2. 模块级 `defineSchema` 改为 `createXxxSchema(t)` 工厂函数，在 `apply` 内实例化
3. 卸载插件时 catalog 自动清理，无需手动处理

## 验证

- `vp check` / `vp test` 全绿
- 切换 en/zh-cn 后，插槽标题随 `slotVersion` 更新
- `grep 'plugin\.inject\|pendingPlugins'` 零残留（除 ADR 历史引用）

---

## 修订记录

- 2026-08-24 · [ADR 0027](./0027-round6-architecture-subtraction.md)：部分修订本文 §D4 宿主桥接（宿主翻译收口为 `hostT` 响应式模块）。
