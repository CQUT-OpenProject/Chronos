# ADR 0024: 插件 Message Catalog 多语言架构

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联**: 落实 Round 5 C3 演进（保留 engine i18n 链）；扩展 ADR 0021 `LocalizedText` 消费模型
- **范围**: `packages/core`, `packages/ui-kit`, `apps/web`, `packages/plugins/*`

---

## 背景与问题

宿主 Shell 已用 Paraglide（`apps/web/messages/`），插件插槽文案仍多为硬编码中文 `() => '...'`。引擎层保留了 `setLocale` / `ctx.i18n` / `i18n:localeChanged` 链，但生产零流量。Round 5 审计建议删除；产品目标是通过插件实现多语言，需正式契约而非休眠 API。

## 架构决策

### D1 — Message catalog 模型

插件在 `apply(ctx)` 内调用 `ctx.i18n.registerMessages(catalog)`：

- `catalog`: `Record<locale, Record<key, string>>`
- key 在引擎内自动加 `pluginId:` 命名空间
- 插槽 / schema 使用 `() => ctx.i18n.t('import.title')`
- `registerMessages` 返回 `Disposable`；`unloadPlugin` 时移除该插件条目

### D2 — LocalizedText

保留 `string | (() => string)`。推荐函数体内调用 `ctx.i18n.t`。`resolveLocalizedText` 可选 `locale` 参数；locale 切换经 `i18n:localeChanged` → `slotVersion++` 触发重算。

### D3 — Locale 规范

规范 id：`zh-cn` | `en`（与 Paraglide 对齐）。构建元数据 `zh-CN` 在 ingest 时 normalize 为 `zh-cn`。

### D4 — 宿主桥接

语言切换 UI 同时更新 Paraglide runtime 与 `engine.setLocale`。`i18nHandler` 仅服务宿主 Paraglide key 回退；插件文案走 catalog。

### D5 — C3 处置

**不删除** engine i18n 链；定义为 RESERVED 并接通最小闭环（catalog + setLocale + localeChanged）。

### D6 — Plugin activation

移除 `plugin.inject` / `ctx.inject` 第二套 DI（Round 5 C1）；激活单轨 `loadPlugin` → `apply(ScopedContext)`。

## 插件作者指南

1. 在 `apply` 首行 `registerMessages({ 'zh-cn': {...}, en: {...} })`
2. 模块级 `defineSchema` 改为 `createXxxSchema(t)` factory，在 `apply` 内实例化
3. 卸载插件时 catalog 自动清理，无需手动处理

## 验证

- `vp check` / `vp test` 全绿
- 切换 en/zh-cn 后插槽标题随 `slotVersion` 更新
- `grep 'plugin\.inject\|pendingPlugins'` 零残留（除 ADR 历史引用）
