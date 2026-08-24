# 插件作者指南

Chronos 的每一部分能力都通过插件贡献：数据源、导出编解码、主题、屏幕、徽章。本指南描述如何编写一个插件，以及插件可以访问哪些能力、不可以访问哪些能力。

## 最小插件

```ts
import { defineChronosPlugin } from '@chronos/core';

export default defineChronosPlugin({
	id: 'my-plugin',
	messages: {
		'zh-cn': { name: '我的插件', greeting: '你好，{name}' },
		en: { name: 'My Plugin', greeting: 'Hello, {name}' }
	},
	nameKey: 'name',
	category: 'tool',
	apply(ctx, t) {
		ctx.registerSlot('export.action', {
			id: 'copy-markdown',
			title: () => t('export.md'),
			disposition: 'clipboard',
			async export(timetable) {
				return { mimeType: 'text/markdown', content: renderMarkdown(timetable) };
			}
		});
	}
});
```

`defineChronosPlugin` 是唯一的工厂入口（[ADR 0027](/adr/0027-round6-architecture-subtraction)）：它自动注册 `messages` 消息目录、惰性解析本地化的 `name` / `description`，并把翻译函数 `t` 作为第二个参数交给 `apply`。`version` 缺省为 `'1.0.0'`。

## 插件可访问的能力：`ctx`

| 成员                          | 说明                                                     |
| ----------------------------- | -------------------------------------------------------- |
| `ctx.service(id)`             | 按服务标识取端口能力；未注册时抛错。可选端口先探测再使用 |
| `ctx.config` / `updateConfig` | 插件私有配置，由 `configSchema` 声明式渲染并持久化       |
| `ctx.storage`                 | 按 pluginId 自动隔离的 KV 存储                           |
| `ctx.i18n`                    | `t(key, params)` 与 `registerMessages(catalog)`          |
| `ctx.state`                   | 只读快照：当前课表、活动周、节次、激活主题等             |
| `ctx.actions`                 | 引擎动作分发：导入/切换课表、课程增改、偏好更新等        |
| `ctx.registerSlot`            | 声明式插槽贡献，卸载时自动撤销                           |
| `ctx.on` / `ctx.emit`         | 引擎事件总线监听与广播                                   |
| `ctx.addDisposable`           | 手动登记卸载时清理的资源                                 |

**访问不到的**：宿主路由、其他插件的存储、DOM 之外的宿主内部对象。跨插件通信只有两条途径——插槽贡献与引擎事件。

## 消息目录与多语言

`messages` 的形状是 `Record<locale, Record<key, string>>`，至少提供 `zh-cn`。槽位的 `title` / `supportingText` 等字段接受 `LocalizedText`（字符串或 `() => string`），需要跟随语言切换时传函数并在内部调用 `t()`。语言切换经 `engine.setLocale` 广播 `i18n:localeChanged`，插槽 UI 自动重解析。详见 [ADR 0024](/adr/0024-plugin-message-catalog-i18n)。

## 富 UI：单一 mountable 协议

任何允许富 UI 的槽位字段都是 `component?: ChronosMountable`：

- 进程内 Svelte 组件用 ui-kit 的 `mountableSvelteComponent()` 包装；
- 在线 ESM bundle 自带 mountable 包装器；
- 宿主只通过 `MountableSlotOutlet` 渲染（SchemaForm 作为回退），从不区分组件形态。

不要引入第二种组件协议；`schema` 字段是声明式回退而非独立轨道。

## 配置 Schema

`configSchema` 使用内核的声明式 Schema（`ConfigSchema`），支持文本、数字、开关、日期、文件（含二进制）等字段类型，宿主以 `SchemaForm` 渲染并与 `defaultConfig` 合并持久化。参考 `theme-yumemita` 与 `wallpaper` 插件的用法。

## 网络请求

- 浏览器直连受 CORS 约束；`IHttpRequestOptions.bypassCors` 由原生宿主兑现。
- 需要服务端中转时实现插件服务端 handler，暴露为 `/api/plugins/{pluginId}/{action}`；浏览器侧用 `IHttpService.proxy(pluginId, action, payload)` 调用。wire 信封是 core 单源的 `PluginServerResponse<T>`（见 [ADR 0025](/adr/0025-official-plugin-modules-and-proxy-contract)）。
- `allowedDomains` 声明网络白名单。

## 分发形态

| 形态              | 适合                                   | 要求                                                                     |
| ----------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| Profile 内置      | 随应用发行的核心能力（如 source-cqut） | 进入 profile 清单，进程内加载                                            |
| 官方在线 ESM 插件 | 含逻辑/富 UI 的扩展（如 wallpaper）    | 构建为自包含 ESM bundle，manifest 带 SHA-256 与 `minEngineVersion`       |
| JSON-only 主题    | 纯配色/图标资源（如 theme-yumemita）   | `ThemeManifest` 显式声明 `colorsUrl` / `iconThemeUrl` / `themeId`，无 JS |

发布流程见[新增一个官方插件](./cookbook/new-plugin.md)。

## 生命周期与清理

`apply` 中通过 `registerSlot` / `on` 登记的资源在插件卸载时自动撤销；自建的定时器、订阅等用 `addDisposable` 登记，或在 `dispose` 中清理。主题类插件还要处理「卸载时激活主题回退」——宿主会调用 `revertToDefaultThemes()`，插件只需保证资产可被释放。
