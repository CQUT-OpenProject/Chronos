# 部署指南

面对不同的部署需求，Chronos 通过两个环境变量导出不同形态：`CHRONOS_PROFILE` 选产品变体，`CHRONOS_DEPLOY_TARGET` 选适配器。两者可独立设置；**未设** `CHRONOS_PROFILE` 时，pages 缺省 `chronos-default`，否则 `chronos-cqut`（codegen 与运行装配共用 `resolveProfileId`）。

| 环境变量                | 控制什么                                 |
| ----------------------- | ---------------------------------------- |
| `CHRONOS_PROFILE`       | **产品变体**：默认装配的插件             |
| `CHRONOS_DEPLOY_TARGET` | **部署目标**：SvelteKit 适配器与产物形态 |

### 内置 Profile（CHRONOS_PROFILE）

Chronos 内置以下三种配置文件，可按需选择或自行创造新的 profile：

| Profile                | 定位               | 知行理工导入 | 教务 HTML 导入 | 分享口令导入 |  服务端插件   |
| ---------------------- | ------------------ | :----------: | :------------: | :----------: | :-----------: |
| `chronos-default`      | Chronos 标准开源版 |      ✗       |       ✗        |      ✓       |      无       |
| `chronos-cqut-offline` | 重庆理工大学离线版 |      ✗       |       ✓        |      ✓       |      无       |
| `chronos-cqut`         | 重庆理工大学在线版 |      ✓       |       ✓        |      ✓       | `source-cqut` |

本地按 profile 构建：

```sh
vp run build:cqut            # chronos-cqut
vp run build:cqut-offline    # chronos-cqut-offline
vp run build:default         # chronos-default
```

> [!IMPORTANT]
> Chronos 深度适配 Vercel，强烈推荐使用 Vercel 部署

### 部署目标（CHRONOS_DEPLOY_TARGET）

| Target  | 部署平台     | 适配器           | 产物                       | 服务端能力       |
| ------- | ------------ | ---------------- | -------------------------- | ---------------- |
| 不设置  | Vercel       | `adapter-vercel` | Serverless 函数 + 静态资源 | 支持插件代理 API |
| `pages` | Github Pages | `adapter-static` | 纯静态文件                 | 无               |

### 所有环境变量

默认配置下，Chronos 不需要配置任何环境变量即可正常部署，以下变量仅在本地开发或特定构建场景下使用：

| 变量                    | 作用域 | 说明                                                                                                             |
| ----------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `CHRONOS_PROFILE`       | 构建时 | 产品 profile，见上表；Vercel 默认 `chronos-cqut`，Pages 默认 `chronos-default`                                   |
| `CHRONOS_DEPLOY_TARGET` | 构建时 | 设为 `pages` 时构建 GitHub Pages 静态版，默认不设置则构建 Vercel 版                                              |
| `ORIGIN`                | 运行时 | SvelteKit 标准变量，用于 CSRF 校验等场景。本地开发一般无需配置；若部署后出现 origin 相关报错，可设为站点完整 URL |
| `PUBLIC_POSTHOG_KEY`    | 构建时 | PostHog 项目密钥；留空则构建期剔除埋点（GitHub Pages、自行部署默认不启用）                                       |
| `PUBLIC_POSTHOG_HOST`   | 运行时 | PostHog API 地址                                                                                                 |

# 参与贡献

Chronos 开发文档。架构决策见 [`.agents/docs/adr/`](.agents/docs/adr/README.md)。

## 目录

- [开发工作流](#开发工作流)
- [架构地图](#架构地图)
- [插件作者指南](#插件作者指南)
- [新增官方插件](#新增官方插件)
- [新增插槽类型](#新增插槽类型)
- [参考：端口契约](#参考端口契约)
- [参考：槽位目录](#参考槽位目录)
- [参考：主题契约](#参考主题契约)

## 开发工作流

### 环境准备

- Node.js（建议 LTS 最新）与全局 [Vite+ CLI](https://viteplus.dev)（`vp`）。本仓库**只用 `vp`**，不要直接调用 pnpm/npm/yarn。
- 克隆后先执行：

```sh
vp install
```

### 常用命令

| 命令                                                                          | 作用                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------ |
| `vp run dev`                                                                  | 启动 Web 宿主开发服务器                    |
| `vp run build` / `vp run build:cqut` / `build:cqut-offline` / `build:default` | 按 profile 构建产品                        |
| `vp run build:pages`                                                          | 构建 GitHub Pages 静态版                   |
| `vp run check`                                                                | 格式化检查 + lint + 类型检查（提交前必跑） |
| `vp run test`                                                                 | 运行全部单元测试                           |
| `vp run build:official-plugins`                                               | 构建官方插件 bundle 与 catalog             |
| `vp run verify:official-plugins`                                              | 官方插件产物自校验检查                     |
| `vp run theme:generate`                                                       | 重新生成主题令牌                           |

### 仓库布局

```
apps/web                  SvelteKit 宿主（页面、适配器、transfer-state、i18n）
packages/core             @chronos/core 微内核（引擎/容器/插槽树/领域/Schema）
packages/ui-kit           组件库与响应式控制器
packages/plugins/*        内置与官方插件
packages/codec-kit        共享字节编解码原语（非插件）
scripts                   官方插件构建/校验、主题令牌、别名解析
.agents/docs/adr          架构决策记录
```

### 提交约定

Gitmoji 格式：`<emoji> <简洁中文描述>`，例如 `✨ 新增课表导出功能`。不使用 `feat:` / `fix:` 前缀。

### 质量门禁

1. `vp run check` 与 `vp run test` 全绿；
2. 改动内核契约时同步更新[参考：端口契约](#参考端口契约)与相关 ADR 的修订记录；
3. 官方插件产物变更必须伴随 `verify:official-plugins` 通过；
4. 不引入新的双轨实现——遇到「同一功能新旧两种做法并存」时，先合并或移除旧做法，再扩展新功能。

## 架构地图

改动 `packages/` 下的任何内容之前，请先阅读本文。本文是一张有序地图：描述系统由什么组成、各部分负责什么、如何协作；类型定义与字段细节见[参考：端口契约](#参考端口契约)，决策缘由见对应的 [ADR 索引](.agents/docs/adr/README.md)。

### 分层拓扑

| 包                                    | 角色                                                                                                       | 可依赖                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/web`                            | Web 宿主：SvelteKit 外壳、页面路由、Dexie/HTTP 适配器、transfer-state 导入流                               | core、ui-kit、plugins（经 Profile 装配） |
| `packages/core` (`@chronos/core`)     | 微内核：引擎、服务容器、插槽树、领域模型、Schema 校验                                                      | 无运行时依赖                             |
| `packages/ui-kit` (`@chronos/ui-kit`) | 与内核配套的 Svelte 组件库：响应式控制器、SchemaForm、插槽出口                                             | core                                     |
| `packages/plugins/*`                  | 内置/官方插件（source-cqut、codec-share、codec-qrcode、tool-calendar-holidays、wallpaper、theme-yumemita） | core、ui-kit；彼此不依赖                 |
| `packages/codec-kit`                  | 构建期共享字节编解码原语（deflate/base64/CRC/varint/bitmask），普通 npm 依赖，非插件                       | —                                        |

依赖规则只有一条方向：**宿主装配插件，插件不感知宿主**。插件之间禁止互相 import——共享原语走 `codec-kit` 这类公共库。

### 核心概念

#### ChronosEngine

`@chronos/core` 的中枢对象，持有领域状态、动作分发（`createTimetable` / `importTimetable` / `saveCourse` …）、`EventPipeline` 事件总线与插槽注册表。所有写操作都是引擎动作，视图层通过 `ReactiveChronosController` 订阅状态快照。

#### 服务容器与端口

`ServiceContainer` 注册五个标准端口：`IHttpService`、`IStorageService`、`IVaultService`（可选）、`IRuntimeService`、`IAnalyticsService`（可选）。宿主在启动时把平台适配器（Dexie、fetch、WebAuthn 等）注册进去，此后运行时代码一律经容器或 `ctx.service(...)` 取能力，不直接触碰平台 API。契约详见[参考：端口契约](#参考端口契约)。

#### 分层插槽树

`HierarchicalSlotRegistry` 以分层路径（如 `import.source.tab`、`shell.bottom-bar.tab`）组织扩展点。插件在 `apply(ctx)` 中调用 `ctx.registerSlot(slotName, contribution)` 声明贡献，卸载时自动撤销。多贡献者默认共存并按 `order` 排序；同 id 后注册覆盖前者并在开发期告警。标准槽位全集见[参考：槽位目录](#参考槽位目录)。

#### ScopedContext

每个插件激活时会拿到一个 `ScopedContext`（实现 `ChronosContext` 接口），其中包含：按插件隔离的配置、以 pluginId 自动命名空间的私有存储、i18n 运行时、只读状态快照和动作分发器。插件能访问的一切都通过它。

### 插件的两条激活轨

1. **Profile 内置轨**：`ProfileManager` 按 profile 清单在启动时以进程内方式 `apply` 内置插件。Profile 决定装配哪些插件与四层合并后的默认配置。
2. **官方在线轨**：`OfficialPluginService` 是对外门面，内部由四个模块分工完成——catalog 客户端、资产管线（下载 manifest 与 bundle 并做 SHA-256 双哈希校验）、已安装记录存储、运行时激活器——最终同样调用 `engine.loadPlugin`。JSON-only 主题（不含 JS）经一个不涉及 UI 的 `ScopedContext` 直接注册资产。

两条轨共享同一引擎生命周期与插槽 owner 追踪；没有 `plugin.inject` 依赖拓扑，可选能力用 `ctx.service(...)` 探测。

### 导入管道

```
import.source.tab 插槽（每数据源一个贡献）
        │ executeImport(inputs)
        ▼
宿主 transfer-state（唯一流程属主）
   预览持久化 → 确认页（confirmSchema / confirmComponent）
   → finalizePreview 合并确认输入 → engine.importTimetable
```

- 数据源插件只实现 `executeImport` 与可选的确认阶段钩子，不触碰 UI 路由。
- `/s` 分享链接落地页由 `deepLink.fromLocation` 元数据统一分发：宿主不需要知道任何具体的链接格式。
- 失败用结构化的 `ImportSlotError`（kind：`no-data` / `invalid-data` / `network` / `unsupported` / `unknown`）传递。

### 事件与动态配色

引擎事件经统一 `EventPipeline` 分发（`emit` / `on`）。主题相关的 `dynamicColor:set/changed/hydrate` 是内核泛化契约：壁纸等插件发事件，宿主 `app-shell` 桥接到 `dynamicColorUri` 并调用当前主题的 `dynamicColorAdapter` 上色。引擎内部的 serial/waterfall 钩子机制处于 FROZEN BASELINE（两个发布周期无真实注册者则整体移除），不要新增消费。

### 主题系统

主题是 `theme.definition` 插槽的贡献：封闭的 workbench 颜色键 + 设计令牌 + 课程画笔；图标主题不再独立选择，由激活配色方案的 `recommendedIconTheme` 派生。详见[参考：主题契约](#参考主题契约)。

### 深读路径

按时间线完整记录设计取舍的是 [ADR 索引](.agents/docs/adr/README.md)。建议顺序：

1. [ADR 0001](.agents/docs/adr/0001-microkernel-and-monorepo-modularization.md) 微内核与 Monorepo 分层
2. [ADR 0003](.agents/docs/adr/0003-hierarchical-slot-registry-and-extensibility.md) 分层插槽树与声明式扩展
3. [ADR 0011](.agents/docs/adr/0011-single-track-official-plugin-install.md) 单轨官方插件安装
4. [ADR 0023](.agents/docs/adr/0023-round4-gate-typing-dead-face-component-single-track.md) Round 4 门禁与单轨化
5. [ADR 0027](.agents/docs/adr/0027-round6-architecture-subtraction.md) Round 6 架构减法（最新基线）

## 插件作者指南

Chronos 的每一部分能力都通过插件贡献：数据源、导出编解码、主题、屏幕、徽章。本指南描述如何编写一个插件，以及插件可以访问哪些能力、不可以访问哪些能力。

### 最小插件

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

`defineChronosPlugin` 是唯一的工厂入口（[ADR 0027](.agents/docs/adr/0027-round6-architecture-subtraction.md)）：它自动注册 `messages` 消息目录、惰性解析本地化的 `name` / `description`，并把翻译函数 `t` 作为第二个参数交给 `apply`。`version` 缺省为 `'1.0.0'`。

### 插件可访问的能力：`ctx`

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

### 消息目录与多语言

`messages` 的形状是 `Record<locale, Record<key, string>>`，至少提供 `zh-cn`。槽位的 `title` / `supportingText` 等字段接受 `LocalizedText`（字符串或 `() => string`），需要跟随语言切换时传函数并在内部调用 `t()`。语言切换经 `engine.setLocale` 广播 `i18n:localeChanged`，插槽 UI 自动重解析。详见 [ADR 0024](.agents/docs/adr/0024-plugin-message-catalog-i18n.md)。

### 富 UI：单一 mountable 协议

任何允许富 UI 的槽位字段都是 `component?: ChronosMountable`：

- 进程内 Svelte 组件用 ui-kit 的 `mountableSvelteComponent()` 包装；
- 在线 ESM bundle 自带 mountable 包装器；
- 宿主只通过 `MountableSlotOutlet` 渲染（SchemaForm 作为回退），从不区分组件形态。

不要引入第二种组件协议；`schema` 字段是声明式回退而非独立轨道。

### 配置 Schema

`configSchema` 使用内核的声明式 Schema（`ConfigSchema`），支持文本、数字、开关、日期、文件（含二进制）等字段类型，宿主以 `SchemaForm` 渲染并与 `defaultConfig` 合并持久化。参考 `theme-yumemita` 与 `wallpaper` 插件的用法。

### 网络请求

- 浏览器直连受 CORS 约束；`IHttpRequestOptions.bypassCors` 由原生宿主兑现。
- 需要服务端中转时实现插件服务端 handler，暴露为 `/api/plugins/{pluginId}/{action}`；浏览器侧用 `IHttpService.proxy(pluginId, action, payload)` 调用。wire 信封是 core 单源的 `PluginServerResponse<T>`（见 [ADR 0025](.agents/docs/adr/0025-official-plugin-modules-and-proxy-contract.md)）。
- `allowedDomains` 声明网络白名单。
- 需要打开宿主自有页面（如课程编辑器）时，使用 `ctx.tryService(IHostNavigation)?.openCourseEditor(courseId)`，**禁止**在插件内硬编码 `/timetable/...` 等宿主路径（见 [ADR 0031](.agents/docs/adr/0031-round7-clock-profile-codegen-navigation-i18n.md)）。

### Profile 内置插件打包

`apps/web` 的 builtin 列表由 `chronos-profile-plugin` 按 `CHRONOS_PROFILE` 生成 `available-plugins.generated.ts`；`chronos-default` 构建不会静态 import `@chronos/plugin-source-cqut`。修改 profile 启用插件时只改 `profile-definitions.ts`，并运行 `node --experimental-strip-types apps/web/scripts/emit-profile-artifacts.ts`（`prepare` 也会执行）。

### 官方插件 Tailwind

官方插件 bundle 的 Svelte `<style>` 由构建产出 `bundle.css`；**Tailwind utility class** 仍依赖宿主 `apps/web/src/routes/layout.css` 的 `@source` 扫描插件 `src` 目录——不要在插件构建中重复跑 Tailwind，除非另开专门 ADR。

### 分发形态

| 形态              | 适合                                   | 要求                                                                               |
| ----------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| Profile 内置      | 随应用发行的核心能力（如 source-cqut） | 进入 profile 清单，进程内加载                                                      |
| 官方在线 ESM 插件 | 含逻辑/富 UI 的扩展（如 wallpaper）    | 构建为自包含 ESM bundle，manifest 带 SHA-256，`version` 与 `apps/web` 发布版本一致 |
| JSON-only 主题    | 纯配色/图标资源（如 theme-yumemita）   | `ThemeManifest` 显式声明 `colorsUrl` / `iconThemeUrl` / `themeId`，无 JS           |

发布流程见[新增官方插件](#新增官方插件)。

### 生命周期与清理

`apply` 中通过 `registerSlot` / `on` 登记的资源在插件卸载时自动撤销；自建的定时器、订阅等用 `addDisposable` 登记，或在 `dispose` 中清理。主题类插件还要处理「卸载时激活主题回退」——宿主会调用 `revertToDefaultThemes()`，插件只需保证资产可被释放。

## 新增官方插件

从零到出现在官方插件市场（catalog）的完整步骤。示例以 JSON-only 主题插件为最短路径，ESM 插件的差异在第 5 步说明。

### 1. 建包

在 `packages/plugins/` 下新建目录（命名 `theme-<name>` / `codec-<name>` / `source-<name>` / `tool-<name>`），`package.json` 参照 `packages/plugins/theme-yumemita`。依赖只允许 `@chronos/core`、`@chronos/ui-kit` 与纯工具库；**不得依赖其他插件**。

### 2. 实现插件

- **主题插件（无 JS）**：准备两份 JSON——配色（对应 `ThemeContribution` 的 workbench 颜色键与令牌）与图标主题，无需写任何代码。
- **逻辑/富 UI 插件**：用 `defineChronosPlugin` 编写入口并在 `apply` 中注册槽位，参考[插件作者指南](#插件作者指南)。富 UI 必须走单一 `ChronosMountable` 协议。

### 3. 注册进构建配置

编辑 `scripts/official-plugins.config.ts`：把新插件加入构建映射（源码目录 → bundle 输出 + manifest 元数据）。version 以配置文件为单源，不要在插件代码里另写一份。

### 4. 构建并校验

```sh
vp run build:official-plugins   # 产出 bundle / manifest / catalog.json 并更新哈希
vp run verify:official-plugins  # 自校验检查：哈希、manifest 字段、catalog 一致性
```

产物写入 `apps/web/static/official-plugins/`，包括 `catalog.json`。两个脚本任一失败都不得提交。

### 5. ESM 插件附加要求

若插件含 JS：

1. bundle 必须自包含（Svelte 编译进产物），通过 Blob ESM 导入加载；
2. manifest 声明 `cssUrl`、`cssSha256`、`jsSha256`，`version` 取自 `apps/web/package.json`；
3. 富 UI 暴露 mountable 包装器而非裸组件；
4. 本地验证可在「我的 → 插件」中经 catalog 在线安装路径走一遍（双轨行为必须一致，见 [ADR 0011](.agents/docs/adr/0011-single-track-official-plugin-install.md)）。

### 6. 收尾

- 更新 `CONTEXT.md` 若引入了新的词汇或冲突策略行。
- 若新增了可复用契约（如新的插槽字段），先读[新增插槽类型](#新增插槽类型)。
- 提交信息遵循仓库 Gitmoji 约定。

### 验证清单

- [ ] `verify-official-plugins` 通过
- [ ] 安装 → 启用 → 禁用 → 卸载 全链路正常，卸载后主题回退默认
- [ ] 语言切换后插件文案跟随（有 i18n 时）
- [ ] 未注册任何宿主特判：`grep` 宿主源码中不应出现你的插件 id（catalog 配置除外）

## 新增插槽类型

当现有标准槽位无法表达新的扩展面时，按本步骤扩展内核契约。原则：**插槽是声明式贡献点，不是回调钩子**——先确认不能用现有槽位 + 新字段的组合解决。

### 1. 定义贡献契约

在 `packages/core/src/types/slots.ts` 中新增接口与 `StandardSlotMap` 键名：

```ts
export interface MyThingSlotContribution {
	id: string;
	title: LocalizedText; // 文案一律 LocalizedText
	order?: number; // 多贡献者共存时排序
	// …领域字段；组件一律 component?: ChronosMountable
}

export interface StandardSlotMap {
	// …既有槽位
	'my-domain.thing': MyThingSlotContribution;
}
```

命名规则：`<域>.<对象>.<角色>` 分层路径（如 `timetable.cell.badge`）。文本类型用 `LocalizedText`，排序契约用可选 `order`，富 UI 用 `component?` + 可选声明式回退字段。

### 2. 实现宿主消费点

消费端只允许一套通用机制：

- 排序：`order` 升序，缺省排前；主操作用 `pickPrimary()`（显式 `isPrimary` 优先）。
- 文本：`resolveLocalizedText()` 单一实现（含 badge）。
- 富 UI：`MountableSlotOutlet` 渲染，缺失组件时回退 `SchemaForm`。
- 底栏宿主屏：只认 `BottomTabSlotContribution.hostPanel`（`'timetable' | 'mine'`），不认 tab id 字面量；无 `hostPanel` 则 `resolveSlotOwner` + `PluginScreenContainer`。

禁止在消费点写 `typeof x === 'function' ? x() : x` 之类的本地实现——这些工具已收敛为内核单源（[ADR 0021](.agents/docs/adr/0021-slot-consumption-seam.md)、[ADR 0032](.agents/docs/adr/0032-round8-dual-track-collapse.md)）。

### 3. 补充冲突策略

在 `CONTEXT.md` 的冲突策略表加一行，明确该槽位多贡献者时的行为（共存排序 / 聚合 / 单一所有者等）。没有策略的插槽不允许合入。

### 4. 测试与门禁

- registry 行为测试：注册、撤销、owner 追踪、同 id 覆盖告警。
- 消费端渲染测试：零贡献者早退、多贡献者排序。
- 运行 `vp check` 与 `vp test` 全绿。

### 5. 文档同步

- [参考：槽位目录](#参考槽位目录)追加条目；
- 若属于架构级决策（而非既有模式的应用），补一篇 ADR 并更新索引。

## 参考：端口契约

宿主平台能力经 `ServiceContainer` 以五个标准端口注入。运行时代码（引擎、插件）一律通过容器或 `ctx.service(...)` 访问，不允许直接触碰平台 API。类型定义见 `packages/core/src/types/services.ts`。

| 端口                | 必需 | 职责                                                      |
| ------------------- | ---- | --------------------------------------------------------- |
| `IHttpService`      | 是   | 网络请求与可选会话；`proxy` 供插件服务端调用              |
| `IStorageService`   | 是   | 课表、偏好、壁纸、插件 KV 的结构化持久化                  |
| `IVaultService`     | 否   | 加密凭据保险箱（原生 Keychain/Keystore）；**不是通用 KV** |
| `IRuntimeService`   | 是   | 平台标识 + SHA-256（Round 6 后仅此两项）                  |
| `IAnalyticsService` | 否   | 匿名产品统计，未注册时静默                                |

### IHttpService

```ts
request(url, options?: HttpRequestOptions): Promise<HttpResponse>
proxy?(pluginId, action, payload, options?): Promise<HttpResponse>
```

- `HttpRequestOptions` 支持 `method` / `headers` / `body`（string 或 Uint8Array）/ `timeoutMs` 与 `bypassCors`（由原生宿主兑现）。
- `proxy` 把载荷 POST 到 `/api/plugins/{pluginId}/{action}`；响应信封必须是 core 单源的 `PluginServerResponse<T>`（`pluginServerSuccess` / `pluginServerError` / `parsePluginServerResponse`）。签名保持非泛型——契约作用于 HTTP body（[ADR 0025](.agents/docs/adr/0025-official-plugin-modules-and-proxy-contract.md)）。

### IStorageService

课表 CRUD + 活动课表指针 + 偏好读写 + 按 pluginId 自动命名空间的 KV（`getPluginData` 等）+ 可选的 `clearAllData` / `estimateStorageBytes` / `onChanged`。

**RESERVED**：`queryCourses(filter)` 提供跨课表课程查询，当前零生产消费者。它是 Round 4 的保留决策：不要"清理"它，也不要在出现真实消费者前扩展（复核时间见冻结基线说明）。

### IVaultService

硬件安全凭据存取：`isSupported` / `storeSecret` / `getSecret` / `removeSecret`，可要求生物识别。语义约束：

- 只存放高敏感小秘密（如教务凭据），不是通用键值库；
- Web 端实现已随 [ADR 0017](.agents/docs/adr/0017-webauthn-credential-retirement.md) 退役，端口本身保留给原生宿主；engine 仅在 `env.vault` 存在时注册。

### IRuntimeService

`platform: 'web' | 'ios' | 'android' | 'node'` 与 `sha256(data)`。计时器与 UTF-8 辅助成员已在 Round 6 修剪（零消费即删）。

### IAnalyticsService

单一 `track(event, properties?)`。经 `ChronosEnv.analytics → container` 注册；未配置密钥的构建不启用埋点，运行时调用应容忍端口缺失。

### 宿主装配规则

`ChronosEnv` 只是宿主引导适配器（web + native）。构造后由 `registerEnvProviders` 把各端口复制进容器；所有宿主必须在构造时传入 `env`——不存在只有容器的门面。

## 参考：槽位目录

全部标准插槽的契约参考。定义位于 `packages/core/src/types/slots.ts`；扩展新槽位的步骤见[新增插槽类型](#新增插槽类型)。

### 总览

| 槽位路径                     | 用途                                                                   | 多贡献者策略                                       |
| ---------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `import.source.tab`          | 导入数据源标签页（在线/文件/链接）                                     | 共存，按 `order` 排序                              |
| `export.action`              | 课表导出动作（复制/下载/自定义）                                       | 共存，`isPrimary` 选主                             |
| `mine.section` / `mine.item` | 「我的」页分区与条目                                                   | 共存，按 `order` 排序                              |
| `shell.route.screen`         | 插件全屏页面（`/plugins/[pluginId]/[id]`）                             | 每 id 一屏                                         |
| `shell.bottom-bar.tab`       | 底栏导航标签（仅 `id`；宿主屏用 `hostPanel`，壳内 `activeTabId` 切换） | 共存，按 `order` 排序                              |
| `timetable.cell.badge`       | 课程卡徽章                                                             | 聚合所有贡献者（RESERVED，零生产者时早退）         |
| `course.detail.action`       | 课程详情操作项                                                         | 共存，按 `order` 排序                              |
| `theme.definition`           | 配色主题                                                               | 注册多个，用户选择其一                             |
| `theme.icon.definition`      | 图标主题                                                               | 由激活主题 `recommendedIconTheme` 派生，无独立偏好 |

### 通用约定

- **LocalizedText**：所有用户可见文案为 `string | (() => string)`；消费端经内核单源 `resolveLocalizedText()` 解析。
- **排序**：可选 `order` 升序；主条目用 `pickPrimary()`（显式 `isPrimary` 优先，否则首个）。
- **富 UI**：组件字段一律 `component?: ChronosMountable`（单一挂载协议），宿主只经 `MountableSlotOutlet` 渲染。
- **同 id 覆盖**：同一槽位下相同 `contribution.id` 后注册者胜出，开发期告警。

### import.source.tab

```ts
interface ImportTabSlotContribution<FormState> {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: ShellIconRef;
	supportingText?: LocalizedText;
	importKind?: 'online' | 'file' | 'link' | 'custom'; // 宿主导入文案分组
	badge?: LocalizedText;
	inputSchema?: ConfigSchema<FormState>; // 输入表单声明
	defaultInput?: FormState;
	component?: ChronosMountable; // 可选富输入 UI
	confirmComponent?: ChronosMountable; // 确认阶段富 UI
	confirmSchema?: ConfigSchema<FormState>; // 确认阶段声明式回退
	confirmDefaultInput?: FormState;
	validateConfirmInputs?(inputs): string | null; // null = 可以导入
	finalizePreview?(preview, confirmInputs, ctx?): Timetable | Promise<Timetable>;
	deepLink?: { fromLocation(location): Record<string, unknown> | null }; // 供 /s 分享页通用识别
	executeImport(inputs, ctx?): Promise<Timetable>;
}
```

流程属主是宿主 `transfer-state`：预览 → 确认 → `finalizePreview` 合并 → `engine.importTimetable`。失败抛 `ImportSlotError`（kind：`no-data` / `invalid-data` / `network` / `unsupported` / `unknown`）。

### export.action

```ts
interface ExportActionSlotContribution {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: ShellIconRef;
	description?: LocalizedText;
	disposition?: 'clipboard' | 'download' | 'custom';
	isPrimary?: boolean;
	export(timetable, ctx?): Promise<ExportResult>;
	estimateLength?(timetable, ctx?): Promise<number>; // 大课表警告阈值判断
	checkWarning?(timetable, ctx?): Promise<string | null>;
}
```

`ExportResult.content` 为 string 或 Uint8Array；剪贴板/下载助手由宿主平台层提供。

### shell.route.screen

```ts
interface PluginScreenSlotContribution {
	id: string; // 映射到 /plugins/[pluginId]/[id]
	title: LocalizedText;
	component?: ChronosMountable; // 缺省回退 schema 声明式渲染
	schema?: ConfigSchema;
}
```

### shell.bottom-bar.tab

```ts
interface BottomTabSlotContribution {
	id: string;
	label: LocalizedText;
	order?: number;
	icon?: ShellIconRef;
	iconFill?: ShellIconRef;
	hostPanel?: 'timetable' | 'mine'; // 宿主屏；插件 tab 省略
	defaultLaunch?: boolean;
}
```

宿主只认 `hostPanel` 渲染课表/我的屏。冷启动 fallback 用 `resolveHostPanelTab(tabs, 'timetable')`，否则 registry 第一项。插件 tab 不声明 `hostPanel`，消费端走 `resolveSlotOwner` + `PluginScreenContainer`。

### mine.item

`sectionId` 关联到某个 `mine.section` 贡献；省略时宿主使用 `DEFAULT_MINE_SECTION_ID`（`app-support`）。`href` 指向内置路由或插件动态路由；`keywords` 支撑搜索；`iconTone` 取 `primary | secondary | tertiary | neutral`。

### theme.definition

即 [ThemeContribution](#参考主题契约)：封闭 workbench 颜色键、设计令牌、课程画笔、可选动态取色适配器与推荐图标主题。

### 自定义槽位

`StandardSlotMap` 之外的键允许存在，但需要宿主消费点才有意义。第三方可用 `declare module '@chronos/core'` 经 `CustomSlotMap` 扩展类型；新增标准槽位请走[新增插槽类型](#新增插槽类型)流程并补充本目录。

## 参考：主题契约

Chronos 的主题体系由「配色主题 + 派生图标主题」组成。类型定义位于 `packages/core/src/types/contributions.ts` 与 `packages/core/src/theme/`。

### ThemeContribution（配色主题）

`theme.definition` 插槽的贡献，决定整套外观：

| 字段                                             | 说明                                                                                                          |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `id` / `name` / `description`                    | 标识与本地化文案                                                                                              |
| `workbenchColors`                                | **封闭键集**的界面颜色，分 `light` / `dark` 两组；键名使用连字符命名（Round 6 统一，如 `--color-on-surface`） |
| `getTokens(mode, seedColor?)`                    | 返回核心设计令牌（`surface` / `primary` / `outline` 等 + 自定义扩展）                                         |
| `resolveCoursePaint?`                            | 课程卡配色；缺省走内核调色盘                                                                                  |
| `paletteEntries?`                                | 静态或按模式给出的课程调色盘条目                                                                              |
| `recommendedIconTheme?`                          | 推荐配对的图标主题 id                                                                                         |
| `supportsDynamicColor?` / `dynamicColorAdapter?` | 壁纸动态取色：`extractWallpaperSeed` → `paintWallpaperTheme` → `clearWallpaperTheme`                          |
| `className?` / `disabled?`                       | 挂载类名与条件禁用                                                                                            |

### 图标主题：派生而非持久化

用户**不单独选择**图标主题。激活配色主题的 `recommendedIconTheme` 决定当前图标主题（回退 `host-default`）；该派生值不写入用户偏好。切换配色时图标随之切换——这是 [ADR 0026](.agents/docs/adr/0026-icon-theme-follows-color-scheme.md) 对 [ADR 0019](.agents/docs/adr/0019-workbench-color-and-icon-theme-platform.md) 双模型拆分的证伪修正。

`IconThemeContribution` 交付管线不变：JSON 资源声明图标集，宿主底栏等消费 `ShellIconRef`（注册表键或结构化描述符）。

### JSON-only 主题分发

无逻辑的纯资源主题以 `ThemeManifest` 形式在线分发：manifest 显式声明 `themeId`、`colorsUrl`、`iconThemeUrl`，安装后经 `OfficialPluginService` 持有的无头 `ScopedContext` 注册资产——全程没有 JS bundle。宿主从不猜测 id 前缀。

含动态取色等逻辑的主题则走 ESM 插件形态（参考 `tool-wallpaper`）。

### 动态配色事件

内核层定义的通用事件：`dynamicColor:set`（携带 Blob）、`dynamicColor:changed`（携带 URI）、`dynamicColor:hydrate`（请求重放当前状态）。宿主 `app-shell` 只保存一个 `dynamicColorUri`（后发出的覆盖先前的），并把 URI 交给当前主题的适配器上色。偏好中的 scheme id `wallpaper` 是历史兼容命名。

### 用户偏好相关项

- `visualThemeId`：用户选择的配色主题。
- palette `vibrant | wallpaper`：`wallpaper` 表示动态取色轨。
- 无 `iconThemeId` 偏好字段——不要新增。
