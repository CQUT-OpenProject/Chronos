# 部署指南

Chronos 支持通过环境变量构建并导出不同的产品形态：使用 `CHRONOS_PROFILE` 指定产品变体（预设的插件组合与配置），使用 `CHRONOS_DEPLOY_TARGET` 指定部署目标平台（适配器与产物形态）。两者可独立配置：若未显式指定 `CHRONOS_PROFILE`，在 `CHRONOS_DEPLOY_TARGET=pages` 时默认使用 `chronos-default`，其余情况默认使用 `chronos-cqut`（构建期代码生成与运行期装配流程统一由 `resolveProfileId` 解析）。

| 环境变量                | 控制内容                                 |
| ----------------------- | ---------------------------------------- |
| `CHRONOS_PROFILE`       | **产品变体**：默认装配的插件集与预设配置 |
| `CHRONOS_DEPLOY_TARGET` | **部署目标**：SvelteKit 适配器与产物形态 |

### 内置 Profile（CHRONOS_PROFILE）

Chronos 内置以下三种 Profile（产品配置文件），可按需选择或自行扩展新的 Profile：

| Profile                | 定位               | 知行理工导入 | 教务 HTML 导入 | 分享口令导入 |  服务端插件   |
| ---------------------- | ------------------ | :----------: | :------------: | :----------: | :-----------: |
| `chronos-default`      | Chronos 标准开源版 |      ✗       |       ✗        |      ✓       |      无       |
| `chronos-cqut-offline` | 重庆理工大学离线版 |      ✗       |       ✓        |      ✓       |      无       |
| `chronos-cqut`         | 重庆理工大学在线版 |      ✓       |       ✓        |      ✓       | `source-cqut` |

本地按 Profile 构建：

```sh
vp run build:cqut            # chronos-cqut
vp run build:cqut-offline    # chronos-cqut-offline
vp run build:default         # chronos-default
```

> [!IMPORTANT]
> Chronos 深度适配 Vercel，强烈推荐使用 Vercel 进行部署。

### 部署目标（CHRONOS_DEPLOY_TARGET）

| Target  | 部署平台     | 适配器           | 产物                       | 服务端能力       |
| ------- | ------------ | ---------------- | -------------------------- | ---------------- |
| 不设置  | Vercel       | `adapter-vercel` | Serverless 函数 + 静态资源 | 支持插件代理 API |
| `pages` | GitHub Pages | `adapter-static` | 纯静态文件                 | 无               |

### 所有环境变量

默认配置下，Chronos 不需要配置任何环境变量即可正常部署，以下变量仅在本地开发或特定构建场景下使用：

| 变量                    | 作用域 | 说明                                                                                                             |
| ----------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| `CHRONOS_PROFILE`       | 构建时 | 产品 Profile，详见上表；Vercel 默认 `chronos-cqut`，GitHub Pages 默认 `chronos-default`                          |
| `CHRONOS_DEPLOY_TARGET` | 构建时 | 设为 `pages` 时构建 GitHub Pages 静态版，默认不设置则构建 Vercel 版                                              |
| `ORIGIN`                | 运行时 | SvelteKit 标准变量，用于 CSRF 校验等场景。本地开发一般无需配置；若部署后出现 origin 相关报错，可设为站点完整 URL |
| `PUBLIC_POSTHOG_KEY`    | 构建时 | PostHog 项目密钥；留空则构建期剔除埋点（GitHub Pages、自行部署默认不启用）                                       |
| `PUBLIC_POSTHOG_HOST`   | 运行时 | PostHog API 地址                                                                                                 |

# 参与贡献

欢迎参与 Chronos 开发！项目架构决策记录请参阅 [`.agents/docs/adr/`](.agents/docs/adr/README.md)。

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

- Node.js（建议 LTS 最新版）与全局 [Vite+ CLI](https://viteplus.dev)（`vp`）。本仓库**统一使用 `vp`**，请勿直接调用 pnpm / npm / yarn。
- 克隆仓库后先安装依赖：

```sh
vp install
```

### 常用命令

| 命令                                                                          | 作用                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------ |
| `vp run dev`                                                                  | 启动 Web 宿主开发服务器                    |
| `vp run build` / `vp run build:cqut` / `build:cqut-offline` / `build:default` | 按 Profile 构建目标产品                    |
| `vp run build:pages`                                                          | 构建 GitHub Pages 静态版                   |
| `vp run check`                                                                | 格式化检查 + Lint + 类型检查（提交前必跑） |
| `vp run test`                                                                 | 运行全部单元测试                           |
| `vp run build:official-plugins`                                               | 构建官方插件 Bundle 与 Catalog 目录        |
| `vp run verify:official-plugins`                                              | 官方插件产物自校验检查                     |
| `vp run theme:generate`                                                       | 重新生成主题令牌                           |
| `vp run bundle:analyze`                                                       | 构建并分析前端包体积构成                   |
| `vp run icons:png`                                                            | 从 SVG 源资产重新生成各尺寸 PWA 图标       |

### 仓库布局

```
apps/web                  SvelteKit 宿主（页面路由、适配器、transfer-state 导入流、i18n）
packages/core             @chronos/core 微内核（引擎、服务容器、插槽树、领域模型、Schema 校验）
packages/ui-kit           @chronos/ui-kit 共享组件库与响应式控制器
packages/plugins/*        内置与官方插件（数据源、编解码、工具、主题等）
packages/codec-kit        共享字节编解码原语（非插件公共库）
scripts                   官方插件构建与校验、主题令牌生成、别名解析脚本
.agents/docs/adr          架构决策记录（ADR）
```

### 提交约定

遵循 Gitmoji 格式：`<emoji> <简洁中文描述>`，例如 `✨ 新增课表导出功能`。不使用 `feat:` / `fix:` 前缀。

### 质量门禁

1. 提交前确保 `vp run check` 与 `vp run test` 全部通过；
2. 修改内核契约时，同步更新[参考：端口契约](#参考端口契约)与对应 ADR 的修订记录；
3. 涉及官方插件产物变更时，必须通过 `vp run verify:official-plugins` 校验；
4. 避免引入双轨实现：当同一功能存在新旧两种实现方式时，应先收敛或废弃旧实现，再进行扩展，保持单一事实来源。

## 架构地图

在修改 `packages/` 下的代码之前，请先阅读本节。本节从整体视角梳理系统的模块构成、职责边界与协作机制；类型定义与字段细节见[参考：端口契约](#参考端口契约)，架构演进与决策背景请参阅 [ADR 索引](.agents/docs/adr/README.md)。

### 分层拓扑

| 包                                    | 角色                                                                                                       | 可依赖                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `apps/web`                            | Web 宿主：SvelteKit 外壳、页面路由、Dexie/HTTP 适配器、transfer-state 导入流                               | core、ui-kit、plugins（经 Profile 装配） |
| `packages/core` (`@chronos/core`)     | 微内核：引擎、服务容器、插槽树、领域模型、Schema 校验                                                      | 无运行时依赖                             |
| `packages/ui-kit` (`@chronos/ui-kit`) | 与内核配套的 Svelte 组件库：响应式控制器、SchemaForm、插槽出口                                             | core                                     |
| `packages/plugins/*`                  | 内置/官方插件（source-cqut、codec-share、codec-qrcode、tool-calendar-holidays、wallpaper、theme-yumemita） | core、ui-kit；彼此不依赖                 |
| `packages/codec-kit`                  | 共享字节编解码原语（deflate/base64/CRC/varint/bitmask），普通 npm 依赖，非插件                             | —                                        |

依赖规则遵循单一方向原则：**宿主负责装配插件，插件不感知宿主实现**。插件之间禁止直接互相引用，共享的基础能力与编解码原语统一通过 `packages/codec-kit` 等通用库提供。

### 核心概念

#### ChronosEngine

`@chronos/core` 的核心中枢对象，负责管理领域状态、分发业务动作（如 `createTimetable` / `importTimetable` / `saveCourse` 等）、维护 `EventPipeline` 事件总线与插槽注册表。所有状态变更均通过引擎动作触发，视图层通过 `ReactiveChronosController` 订阅状态快照。

#### 服务容器与端口

`ServiceContainer` 注册五个标准端口：`IHttpService`、`IStorageService`、`IVaultService`（可选）、`IRuntimeService`、`IAnalyticsService`（可选）。宿主在启动阶段将底层平台适配器（如 Dexie、Fetch、WebAuthn 等）注入容器中，运行期代码一律通过容器或 `ctx.service(...)` 消费平台能力，禁止直接调用平台专属全局 API。详细契约见[参考：端口契约](#参考端口契约)。

#### 分层插槽树

`HierarchicalSlotRegistry` 以分层路径（如 `import.source.tab`、`shell.bottom-bar.tab`）组织扩展点。插件在 `apply(ctx)` 阶段通过 `ctx.registerSlot(slotName, contribution)` 声明扩展贡献，插件卸载时会自动撤销其注册的所有插槽。同一插槽支持多个贡献者共存，默认按 `order` 升序排列；若贡献者包含相同 id，后注册者将覆盖前者并在开发环境下输出警告。标准插槽列表见[参考：槽位目录](#参考槽位目录)。

#### ScopedContext

每个插件在激活时均会获得一个 `ScopedContext` 实例（实现 `ChronosContext` 接口），提供插件专属的隔离配置、以 pluginId 为命名空间的私有存储、i18n 翻译运行时、只读状态快照以及引擎动作分发器。插件对系统能力的所有访问均收敛在此上下文中。

### 插件的两条激活轨

1. **Profile 内置轨**：`ProfileManager` 在应用启动时根据 Profile 配置清单，以进程内导入方式调用内置插件的 `apply` 方法。Profile 决定了默认装配的插件集以及经过「内核默认 → Profile 预设 → 用户偏好 → 运行时配置」四层合并后的最终生效配置。
2. **官方在线轨**：`OfficialPluginService` 为官方插件的管理门面，由 Catalog 客户端、资产管线（负责下载 Manifest 与 Bundle 并执行 SHA-256 双哈希校验）、已安装记录存储以及运行时激活器共同协作，最终同样通过 `engine.loadPlugin` 完成加载。纯 JSON 资源的主题插件（不含 JS 代码）则通过轻量级无头 `ScopedContext` 直接注册资产。

两条加载路径共享相同的引擎生命周期管理与插槽所有者（Owner）追踪机制；插件之间不存在隐式依赖拓扑，可选能力统一通过 `ctx.service(...)` 显式探测与消费。

### 导入管道

```
import.source.tab 插槽（每个数据源提供一个扩展贡献）
        │ executeImport(inputs)
        ▼
宿主 transfer-state（唯一流程属主）
   预览持久化 → 确认页（confirmSchema / confirmComponent）
   → finalizePreview 合并确认输入 → engine.importTimetable
```

- 数据源插件仅需实现 `executeImport` 及可选的确认阶段交互钩子，无需关心 UI 路由与页面跳转。
- `/s` 分享链接等落地页由 `deepLink.fromLocation` 元数据统一匹配分发，宿主无需硬编码特定的链接格式规则。
- 导入失败时统一抛出结构化的 `ImportSlotError`（包含 kind 类型：`no-data` / `invalid-data` / `network` / `unsupported` / `unknown`），便于宿主呈现统一的友好提示。

### 事件与动态配色

引擎内部事件通过统一的 `EventPipeline` 分发（`emit` / `on`）。主题相关的 `dynamicColor:set / changed / hydrate` 是内核的通用取色契约：由壁纸等插件触发事件，宿主 `AppShell` 桥接并更新 `dynamicColorUri`，最终调用当前主题的 `dynamicColorAdapter` 进行取色与界面渲染。注意：引擎底层的串行与瀑布流拦截钩子（serial / waterfall）已处于冻结基线（Frozen Baseline），暂无生产消费方，请勿新增对此类机制的依赖。

### 主题系统与设计 Token

主题通过 `theme.definition` 插槽提供扩展贡献，包含封闭的 Workbench 界面颜色键集合、设计令牌与课程调色方案。图标主题不再提供独立选择项，而是根据当前激活配色方案中的 `recommendedIconTheme` 自动派生（[ADR 0026](.agents/docs/adr/0026-icon-theme-follows-color-scheme.md)）。

设计 Token 统一定义于 `apps/web/src/lib/theme/` 目录下（[ADR 0034](.agents/docs/adr/0034-design-token-layering.md)），自底向上划分为生成色彩、排版标尺（`text-*`）、圆角规范、布局间距与组件层级（`ui-*`）五个层次。宿主全局界面色彩统一从 `CHRONOS_HOST_COLORS` 单一数据源派生。详细规则见[参考：主题契约](#参考主题契约)。

### 外壳常驻保活与视图过渡

Chronos 采用「一级外壳常驻保活 + 二级页面按需加载」的路由与视图架构（[ADR 0033](.agents/docs/adr/0033-persistent-shell-freeze-and-secondary-view-transition.md)）：

- **常驻外壳 (`ShellRouteHost`)**：根 Layout 中常驻保活一级外壳（包含底部导航栏与 `ShellTabPanels`），底栏 Tab 切换由 `AppShellController.activeTabId` 内部响应式状态驱动，实现无白屏的瞬时切换（[ADR 0029](.agents/docs/adr/0029-shell-internal-tab-navigation.md)）；
- **离屏冻结 (`secondary-transition-gate`)**：当用户进入二级独立页面时，主外壳通过 `content-visibility: hidden` 与 `inert` 属性在后台完全冻结，避免无关的后台视图计算与重绘损耗；
- **视图过渡隔离 (View Transition)**：`view-transition-name: page-root` 仅挂载在二级页面的根容器（`SecondaryPageShell`）上。禁止将主外壳与二级页面置于同一个带有过渡名称的父容器中，以确保动画流畅稳定。

### 深读路径

按时间线完整记录设计取舍的是 [ADR 索引](.agents/docs/adr/README.md)。建议阅读顺序：

1. [ADR 0001](.agents/docs/adr/0001-microkernel-and-monorepo-modularization.md) 微内核与 Monorepo 模块化分层架构
2. [ADR 0003](.agents/docs/adr/0003-hierarchical-slot-registry-and-extensibility.md) 分层插槽树与声明式扩展机制
3. [ADR 0011](.agents/docs/adr/0011-single-track-official-plugin-install.md) 官方插件在线分发与统一加载机制
4. [ADR 0029](.agents/docs/adr/0029-shell-internal-tab-navigation.md) 壳内 Tab 内部状态导航与底栏路由解耦
5. [ADR 0030](.agents/docs/adr/0030-official-plugin-version-co-shipping-and-host-sync.md) 官方插件随宿主发版与启动时静默同步
6. [ADR 0032](.agents/docs/adr/0032-round8-dual-track-collapse.md) Round 8 架构收敛（消除双轨装配、单源 Profile 与统一异常规范）
7. [ADR 0033](.agents/docs/adr/0033-persistent-shell-freeze-and-secondary-view-transition.md) 外壳常驻保活与二级页面视图过渡隔离
8. [ADR 0034](.agents/docs/adr/0034-design-token-layering.md) 设计 Token 分层与命名规范

### 插件作者指南

Chronos 的每一项业务功能均通过插件贡献：数据源、导出编解码、主题外观、独立屏幕及视图徽章。本指南介绍如何编写插件，以及插件能力的访问边界与最佳实践。

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

`defineChronosPlugin` 是定义插件的唯一标准工厂函数（[ADR 0027](.agents/docs/adr/0027-round6-architecture-subtraction.md)）：它会自动注册 `messages` 多语言消息目录、按需解析本地化的 `name` / `description`，并将翻译函数 `t` 作为第二个参数传递给 `apply` 方法。`version` 字段未指定时默认为 `'1.0.0'`。

### 插件可访问的能力：`ctx`

| 成员                          | 说明                                                                       |
| ----------------------------- | -------------------------------------------------------------------------- |
| `ctx.service(id)`             | 按服务标识获取端口实例；若服务未注册则抛出异常。使用可选端口前应先探测     |
| `ctx.config` / `updateConfig` | 插件私有配置，由 `configSchema` 声明式描述并由宿主持久化存储               |
| `ctx.storage`                 | 按 pluginId 自动隔离的键值（KV）存储                                       |
| `ctx.i18n`                    | 多语言翻译函数 `t(key, params)` 与动态消息注册 `registerMessages(catalog)` |
| `ctx.state`                   | 全局只读快照：包含当前课表、活动周次、节次排布、激活主题等                 |
| `ctx.actions`                 | 业务动作分发器：支持切换/导入课表、增删改查课程、更新偏好设置等            |
| `ctx.registerSlot`            | 向分层插槽树声明扩展贡献，插件卸载时由系统自动清理                         |
| `ctx.on` / `ctx.emit`         | 引擎全局事件总线的监听与广播                                               |
| `ctx.addDisposable`           | 登记自定义的清理回调或资源句柄（卸载时自动调用）                           |

**访问限制**：插件无法直接访问宿主内部路由、其他插件的私有存储或 DOM 以外的宿主私有对象。跨插件通信应严格通过插槽贡献或引擎事件完成。

### 消息目录与多语言

`messages` 的结构为 `Record<locale, Record<key, string>>`，至少需要提供 `zh-cn`。插槽中的 `title` / `supportingText` 等字段类型为 `LocalizedText`（即 `string | (() => string)`）；若需要跟随应用语言实时切换，请传入函数形式并在函数内调用 `t()`。宿主在语言切换时会通过 `engine.setLocale` 广播 `i18n:localeChanged` 事件，所有插槽 UI 将自动重新解析渲染（详见 [ADR 0024](.agents/docs/adr/0024-plugin-message-catalog-i18n.md)）。

### 富 UI：单一 mountable 协议

任何需要渲染自定义 UI 的插槽字段均声明为 `component?: ChronosMountable`：

- 进程内内置的 Svelte 组件使用 `@chronos/ui-kit` 提供的 `mountableSvelteComponent()` 包装；
- 在线分发的 ESM 插件 Bundle 内置 Mountable 包装逻辑；
- 宿主统一通过 `MountableSlotOutlet` 渲染插槽组件（在未提供组件时自动回退为 `SchemaForm` 表单），无需对不同来源的组件做特殊分支处理。

请勿设计第二套组件挂载协议；`schema` 字段作为声明式配置回退，而非平行的渲染轨道。

### 配置 Schema

`configSchema` 使用内核提供的声明式模式定义（`ConfigSchema`），支持文本、数字、布尔开关、日期选择、文件上传（含二进制读取）等丰富类型。宿主将使用 `SchemaForm` 自动渲染配置表单，并与 `defaultConfig` 合并持久化。可参考 `packages/plugins/theme-yumemita` 与 `packages/plugins/wallpaper` 的具体实现。

### 网络请求

- 浏览器端发起网络请求受同源策略（CORS）限制；`IHttpRequestOptions.bypassCors` 仅在支持的原生宿主环境中生效。
- 需要服务端代理转发的场景，可编写插件服务端 Handler，路由挂载于 `/api/plugins/{pluginId}/{action}`；前端通过 `IHttpService.proxy(pluginId, action, payload)` 发起调用。网络数据包统一采用 core 单源定义的 `PluginServerResponse<T>` 规范信封（见 [ADR 0025](.agents/docs/adr/0025-official-plugin-modules-and-proxy-contract.md)）。
- 插件可通过 `allowedDomains` 声明允许访问的域名白名单。
- 如需打开宿主内置页面（如课程编辑器），请通过 `ctx.tryService(IHostNavigation)?.openCourseEditor(courseId)` 调用，**严禁**在插件内部硬编码宿主路由路径（如 `/timetable/...`，见 [ADR 0031](.agents/docs/adr/0031-round7-clock-profile-codegen-navigation-i18n.md)）。

### Profile 内置插件打包

`apps/web` 中的内置插件列表由 `chronos-profile-plugin` 依据 `CHRONOS_PROFILE` 环境变量自动生成 `available-plugins.generated.ts`；在 `chronos-default` 配置下构建时不会静态引入 `@chronos/plugin-source-cqut`。调整 Profile 包含的插件时，只需修改 `apps/web/src/lib/profiles/profile-definitions.ts`，并执行 `node --experimental-strip-types apps/web/scripts/emit-profile-artifacts.ts`（执行 `vp run check` 时也会自动同步）。

### 官方插件 Tailwind

官方插件产物中的 Svelte `<style>` 会由 Rollup 独立打包生成 `bundle.css`；而 Tailwind 原子类（Utility Class）则统一由宿主 `apps/web/src/routes/layout.css` 中的 `@source` 规则扫描插件的 `src` 目录并提取生成——无需在各个插件的构建流程中重复运行 Tailwind 编译器。

### 分发形态

| 形态              | 适用场景                                   | 交付要求                                                                                                                                                                                        |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile 内置      | 随应用发行的核心能力（如 source-cqut）     | 声明在 Profile 清单中，随宿主在进程内启动加载                                                                                                                                                   |
| 官方在线 ESM 插件 | 包含业务逻辑与富 UI 的扩展（如 wallpaper） | 构建为自包含 ESM Bundle，Manifest 附带 SHA-256 哈希，版本与 `apps/web` 单源协同发版并在启动时静默同步（[ADR 0030](.agents/docs/adr/0030-official-plugin-version-co-shipping-and-host-sync.md)） |
| JSON-only 主题    | 纯静态配色与图标资源（如 theme-yumemita）  | `ThemeManifest` 显式声明 `colorsUrl` / `iconThemeUrl` / `themeId`，不含任何 JavaScript 脚本                                                                                                     |

发布流程见[新增官方插件](#新增官方插件)。

### 生命周期与清理

在 `apply` 中通过 `registerSlot` 或 `on` 注册的资源，会在插件被禁用或卸载时由 `ScopedContext` 自动注销清理；对于自建的定时器、事件监听器等外部资源，请通过 `ctx.addDisposable` 登记或在 `dispose` 钩子函数中显式清理。主题类插件卸载时，宿主会自动调用 `revertToDefaultThemes()` 恢复默认主题，插件只需确保自身加载的样式与内存资源被正确释放。

## 新增官方插件

以下是从零开始开发并上架至官方插件市场（Catalog）的完整步骤。示例以 JSON-only 主题插件为主路径，ESM 逻辑插件的差异在第 5 步说明。

### 1. 创建插件包

在 `packages/plugins/` 下新建目录（命名规范：`theme-<name>` / `codec-<name>` / `source-<name>` / `tool-<name>`），`package.json` 可参照 `packages/plugins/theme-yumemita`。插件依赖仅允许包含 `@chronos/core`、`@chronos/ui-kit` 与纯工具库，**禁止依赖其他业务插件**。

### 2. 实现插件逻辑

- **主题插件（纯资源）**：准备两份 JSON 文件——配色方案（对应 `ThemeContribution` 的 Workbench 界面颜色键与设计令牌）与图标主题映射，无需编写 JavaScript 代码。
- **逻辑/富 UI 插件**：使用 `defineChronosPlugin` 编写入口并在 `apply` 中注册插槽，参考[插件作者指南](#插件作者指南)。涉及自定义组件时必须遵循单一 `ChronosMountable` 挂载协议。

### 3. 注册构建配置

编辑 `scripts/official-plugins.config.ts`：将新插件加入构建映射列表（源码目录 → Bundle 输出路径 + Manifest 元数据）。版本号以配置文件作为单一来源，无需在插件源码中重复声明。

### 4. 构建与校验

```sh
vp run build:official-plugins   # 产出 Bundle / Manifest / catalog.json 并更新校验哈希
vp run verify:official-plugins  # 执行产物自校验：检查哈希、Manifest 字段与 Catalog 一致性
```

构建产物将输出至 `apps/web/static/official-plugins/` 目录（包含 `catalog.json`）。上述两项命令必须全部通过后方可提交。

### 5. ESM 插件附加要求

若插件包含 JavaScript 逻辑或 Svelte 组件：

1. Bundle 必须自包含（Svelte 运行时编译打包进产物中），通过 Blob ESM 方式加载；
2. Manifest 需完整声明 `cssUrl`、`cssSha256`、`jsSha256`，`version` 字段取自 `apps/web/package.json`；
3. 富 UI 必须提供 Mountable 包装器，不暴露裸 Svelte 组件；
4. 本地验证可在「我的 → 插件管理」中通过模拟 Catalog 在线安装流程进行全链路测试，确保运行表现与内置插件完全一致（见 [ADR 0011](.agents/docs/adr/0011-single-track-official-plugin-install.md)）。

### 6. 收尾工作

- 若引入了新的领域术语或插槽冲突策略，请同步更新相关设计文档。
- 若新增了跨插件或跨模块的可复用契约（如新的插槽字段），请先阅读[新增插槽类型](#新增插槽类型)。
- 提交信息严格遵循仓库 Gitmoji 规范。

### 验证清单

- [ ] `vp run verify:official-plugins` 校验通过
- [ ] 安装 → 启用 → 禁用 → 卸载 全生命周期流程正常，卸载后主题正确回退为默认项
- [ ] 切换应用语言后插件文案正常跟随切换（具备多语言支持时）
- [ ] 宿主代码无插件特判：在宿主源码中 `grep` 不应出现该插件的 ID（Catalog 配置文件除外）

### 新增插槽类型

当现有标准插槽无法满足新的扩展场景时，按照本节步骤扩展微内核契约。设计原则：**插槽是声明式的扩展贡献点，而非回调钩子**——在扩展前请确认无法通过「现有插槽 + 扩展字段」的组合方案解决。

### 1. 定义贡献契约

在 `packages/core/src/types/slots.ts` 中新增插槽贡献接口并在 `StandardSlotMap` 中声明键名：

```ts
export interface MyThingSlotContribution {
	id: string;
	title: LocalizedText; // 用户文案统一使用 LocalizedText
	order?: number; // 多个贡献者共存时的排序权重
	// …业务领域字段；自定义组件统一采用 component?: ChronosMountable
}

export interface StandardSlotMap {
	// …现有标准插槽
	'my-domain.thing': MyThingSlotContribution;
}
```

命名规则：采用 `<域>.<对象>.<角色>` 的分层路径命名（如 `timetable.cell.badge`）。文本类型使用 `LocalizedText`，排序契约使用可选的 `order` 字段，富 UI 统一使用 `component?` 并支持可选的声明式回退配置。

### 2. 实现宿主消费点

消费端应遵循统一的渲染与解析规范：

- **排序规则**：按 `order` 升序排列，缺省排在前面；选取主操作时使用 `pickPrimary()`（显式声明 `isPrimary` 的优先，否则取首项）。
- **本地化文本**：统一调用内核的 `resolveLocalizedText()` 单一实现解析文本与徽章内容。
- **富 UI 渲染**：统一由 `MountableSlotOutlet` 组件承接渲染；未提供组件时自动回退至 `SchemaForm` 表单。
- **底栏面板适配**：仅依据 `BottomTabSlotContribution.hostPanel`（`'timetable' | 'mine'`）识别内置面板，不应以 Tab ID 字符串字面量作硬编码分支；未声明 `hostPanel` 的外部插件 Tab 则通过 `resolveSlotOwner` 配合 `PluginScreenContainer` 容器挂载渲染。

严禁在各消费点自行编写 `typeof x === 'function' ? x() : x` 等重复逻辑——相关解析与选择逻辑均已收敛至内核单源工具库（[ADR 0021](.agents/docs/adr/0021-slot-consumption-seam.md)、[ADR 0032](.agents/docs/adr/0032-round8-dual-track-collapse.md)）。

### 3. 补充冲突策略

在插槽文档中明确该插槽在多贡献者并存时的处理策略（如共存排序、数据聚合或单一主控等）。缺少明确冲突策略的插槽设计不允许合并。

### 4. 测试与门禁

- 插槽注册表测试：验证注册、撤销、Owner 追踪及同 ID 覆盖警告机制；
- 消费端渲染测试：验证无贡献者时的快速早退逻辑与多贡献者排序表现；
- 执行 `vp run check` 与 `vp run test` 确保各项检查全部通过。

### 5. 文档同步

- 在[参考：槽位目录](#参考槽位目录)中追加新增插槽的规范说明；
- 若属于架构级演进决策，需新增对应 ADR 并更新索引文档。

## 参考：端口契约

宿主平台底层能力通过 `ServiceContainer` 以五个标准端口的形式注入。运行时代码（包括引擎与插件）一律通过容器或 `ctx.service(...)` 消费能力，禁止直接调用平台全局 API。类型定义见 `packages/core/src/types/services.ts`。

| 端口                | 必需 | 职责                                                                    |
| ------------------- | ---- | ----------------------------------------------------------------------- |
| `IHttpService`      | 是   | 网络请求与代理转发能力；提供 `proxy` 方法支持插件服务端通信             |
| `IStorageService`   | 是   | 课表数据、用户偏好、壁纸资产以及插件私有 KV 数据的持久化存储            |
| `IVaultService`     | 否   | 硬件级加密凭据保险箱（如 iOS Keychain、Android Keystore）；非通用键值库 |
| `IRuntimeService`   | 是   | 运行环境平台标识（platform）与基础 SHA-256 哈希计算能力                 |
| `IAnalyticsService` | 否   | 匿名产品指标统计；未注册时静默忽略                                      |

### IHttpService

```ts
request(url, options?: HttpRequestOptions): Promise<HttpResponse>
proxy?(pluginId, action, payload, options?): Promise<HttpResponse>
```

- `HttpRequestOptions` 支持 `method` / `headers` / `body`（string 或 Uint8Array）/ `timeoutMs` 与 `bypassCors`（由原生宿主环境兑现）。
- `proxy` 将请求数据以 POST 方式转发至 `/api/plugins/{pluginId}/{action}`；响应数据包严格遵循 core 单源定义的 `PluginServerResponse<T>` 规范（通过 `pluginServerSuccess`、`pluginServerError` 与 `parsePluginServerResponse` 处理）。方法签名保持非泛型设计，契约作用于 HTTP Body 传输层（[ADR 0025](.agents/docs/adr/0025-official-plugin-modules-and-proxy-contract.md)）。

### IStorageService

包含课表增删改查、当前活动课表指针维护、偏好设置读写以及按 pluginId 自动划分命名空间的插件键值存储（如 `getPluginData` / `setPluginData` 等）；可选支持 `clearAllData`（清除全部数据）、`estimateStorageBytes`（存储占用估算）与 `onChanged`（变更监听）。

**预留能力说明**：`queryCourses(filter)` 支持跨课表课程联合查询，当前暂无生产消费方。该接口属于架构预留能力，请勿擅自清理，亦无需在出现明确业务需求前继续扩充。

### IVaultService

硬件级安全凭据存取接口：提供 `isSupported`、`storeSecret`、`getSecret`、`removeSecret` 等方法，支持结合生物识别认证保护。使用约束：

- 仅用于存储高敏感度的小体积凭据（如教务系统登录凭证），不可作为通用键值数据库使用；
- Web 端实现已废弃（见 [ADR 0017](.agents/docs/adr/0017-webauthn-credential-retirement.md)），当前端口保留供未来的原生宿主使用；引擎仅在宿主环境提供 `env.vault` 时才注册该服务。

### IRuntimeService

提供 `platform: 'web' | 'ios' | 'android' | 'node'` 平台标识与 `sha256(data)` 哈希计算能力。早期版本中的计时器与 UTF-8 编解码辅助方法已全部精简，由标准全局 API 或通用编解码库替代。

### IAnalyticsService

包含单一 `track(event, properties?)` 方法。通过宿主 `ChronosEnv.analytics` 注入容器；未配置统计 Key 的构建版本不会启用埋点服务，运行时代码应容忍该服务未注入的情况。

### 宿主装配规则

`ChronosEnv` 作为宿主启动阶段的环境适配器（针对 Web 与未来原生平台）。应用初始化时由 `registerEnvProviders` 将各环境端口注入至 `ServiceContainer` 容器中；所有宿主在创建引擎时必须传入完整的 `env` 实例，保证端口来源单一明确。

## 参考：槽位目录

全部标准插槽的契约参考。类型定义位于 `packages/core/src/types/slots.ts`；扩展新插槽的步骤请参阅[新增插槽类型](#新增插槽类型)。

### 总览

| 槽位路径                     | 用途                                                                          | 多贡献者策略                                                   |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `import.source.tab`          | 导入数据源标签页（支持在线抓取、本地文件、链接分享等）                        | 允许多个共存，按 `order` 升序排列                              |
| `export.action`              | 课表导出操作（支持剪贴板复制、文件下载、自定义处理等）                        | 允许多个共存，通过 `isPrimary` 标识主操作                      |
| `mine.section` / `mine.item` | 「我的」页面中的功能分组与条目                                                | 允许多个共存，按 `order` 升序排列                              |
| `shell.route.screen`         | 插件独立全屏页面（路由映射至 `/plugins/[pluginId]/[id]`）                     | 每个 ID 对应独立屏幕                                           |
| `shell.bottom-bar.tab`       | 底部导航栏标签项（宿主面板指定 `hostPanel`，外壳内部通过 `activeTabId` 切换） | 允许多个共存，按 `order` 升序排列                              |
| `timetable.cell.badge`       | 课程格子徽章标识                                                              | 聚合所有贡献者（预留能力，无贡献者时快速返回）                 |
| `course.detail.action`       | 课程详情面板操作按钮                                                          | 允许多个共存，按 `order` 升序排列                              |
| `theme.definition`           | 配色主题定义                                                                  | 允许注册多个主题，由用户选择当前激活项                         |
| `theme.icon.definition`      | 图标主题定义                                                                  | 根据当前激活主题的 `recommendedIconTheme` 派生，无独立用户偏好 |

### 通用约定

- **LocalizedText**：所有面向用户的文案类型均为 `LocalizedText`（即 `string | (() => string)`）；消费端统一使用内核单源的 `resolveLocalizedText()` 函数进行解析。
- **排序规则**：可选的 `order` 字段按数值升序排列；选择主要操作项时使用 `pickPrimary()` 工具（显式声明 `isPrimary` 的项优先，否则默认取首项）。
- **富 UI 渲染**：自定义组件字段一律遵循 `component?: ChronosMountable` 单一挂载协议，宿主统一使用 `MountableSlotOutlet` 组件承接渲染。
- **同 ID 覆盖**：同一插槽内若注册了相同 `id` 的贡献项，后注册者将覆盖先前注册的项，并在开发环境下输出警告日志。

### import.source.tab

```ts
interface ImportTabSlotContribution<FormState> {
	id: string;
	title: LocalizedText;
	order?: number;
	icon?: ShellIconRef;
	supportingText?: LocalizedText;
	importKind?: 'online' | 'file' | 'link' | 'custom'; // 宿主导入分组文案
	badge?: LocalizedText;
	inputSchema?: ConfigSchema<FormState>; // 声明式输入表单
	defaultInput?: FormState;
	component?: ChronosMountable; // 可选的富输入 UI
	confirmComponent?: ChronosMountable; // 确认阶段富 UI
	confirmSchema?: ConfigSchema<FormState>; // 确认阶段声明式回退
	confirmDefaultInput?: FormState;
	validateConfirmInputs?(inputs): string | null; // 返回 null 表示验证通过
	finalizePreview?(preview, confirmInputs, ctx?): Timetable | Promise<Timetable>;
	deepLink?: { fromLocation(location): Record<string, unknown> | null }; // 供 /s 分享页通用识别
	executeImport(inputs, ctx?): Promise<Timetable>;
}
```

流程属主为宿主 `transfer-state`：依次经过「数据预览 → 用户确认 → `finalizePreview` 数据合并 → `engine.importTimetable` 写入引擎」四个阶段。若导入失败，统一抛出结构化的 `ImportSlotError`（包含 kind 类型：`no-data` / `invalid-data` / `network` / `unsupported` / `unknown`）。

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
	estimateLength?(timetable, ctx?): Promise<number>; // 大课表导出时的预估长度与阈值判断
	checkWarning?(timetable, ctx?): Promise<string | null>;
}
```

`ExportResult.content` 支持 `string` 或 `Uint8Array`；剪贴板写入与文件下载等具体落盘行为由宿主平台层提供支持。

### shell.route.screen

```ts
interface PluginScreenSlotContribution {
	id: string; // 路由映射至 /plugins/[pluginId]/[id]
	title: LocalizedText;
	component?: ChronosMountable; // 缺省时自动回退为 schema 声明式渲染
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
	hostPanel?: 'timetable' | 'mine'; // 宿主内置面板；插件 Tab 省略该字段
	defaultLaunch?: boolean;
}
```

宿主通过 `hostPanel` 识别并渲染课表与「我的」内置页面。应用冷启动时优先通过 `resolveHostPanelTab(tabs, 'timetable')` 寻找默认 Tab，未找到时取注册表第一项。插件扩展的自定义 Tab 无需声明 `hostPanel`，消费端将通过 `resolveSlotOwner` 结合 `PluginScreenContainer` 容器挂载渲染。

### mine.item

`sectionId` 用于关联至指定的 `mine.section` 分组；未指定时默认归入 `DEFAULT_MINE_SECTION_ID`（即 `'app-support'`）。`href` 可指向宿主内置路由或插件动态路由；`keywords` 用于支持页面内搜索；`iconTone` 支持 `primary | secondary | tertiary | neutral` 四种视觉色调。

### theme.definition

详见 [ThemeContribution](#参考主题契约)：包含封闭的 Workbench 颜色键集、设计令牌、课程卡调色方案、可选的动态取色适配器以及推荐配对的图标主题。

### 自定义槽位

除 `StandardSlotMap` 中定义的标准插槽外，系统允许扩展自定义插槽标识。第三方插件可通过 `declare module '@chronos/core'` 扩展 `CustomSlotMap` 类型定义；若需将插槽提升为通用标准能力，请遵循[新增插槽类型](#新增插槽类型)规范进行设计并更新本文档。

## 参考：主题契约

Chronos 的主题体系由「配色主题 + 派生图标主题」组成。类型定义位于 `packages/core/src/types/contributions.ts` 与 `packages/core/src/theme/`。

### ThemeContribution（配色主题）

`theme.definition` 插槽的扩展贡献，决定整套应用的视觉外观：

| 字段                                             | 说明                                                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `id` / `name` / `description`                    | 主题标识与多语言本地化文案                                                                                                                  |
| `workbenchColors`                                | **封闭键集**的界面基础色彩，包含 `light` 与 `dark` 两种模式；键名统一采用连字符命名规范（如 `--color-on-surface`）                          |
| `getTokens(mode, seedColor?)`                    | 返回核心设计令牌（`surface` / `primary` / `outline` 等基础 Token 及自定义扩展）                                                             |
| `resolveCoursePaint?`                            | 课程卡配色策略；未指定时使用内核默认调色盘                                                                                                  |
| `paletteEntries?`                                | 静态或按模式配置的课程调色盘条目                                                                                                            |
| `recommendedIconTheme?`                          | 推荐配对的图标主题 ID                                                                                                                       |
| `supportsDynamicColor?` / `dynamicColorAdapter?` | 壁纸动态取色适配器：依次执行 `extractWallpaperSeed`（提取种子色）→ `paintWallpaperTheme`（应用配色）→ `clearWallpaperTheme`（清理动态配色） |
| `className?` / `disabled?`                       | 自定义挂载样式类名与条件禁用标识                                                                                                            |

### 图标主题：派生而非持久化

用户无需单独选择图标主题。系统始终根据当前激活配色主题中声明的 `recommendedIconTheme` 决定生效的图标主题（默认回退至 `host-default`），且该派生设置不会作为独立偏好持久化。切换配色主题时，图标主题将自动随之切换——这符合 [ADR 0026](.agents/docs/adr/0026-icon-theme-follows-color-scheme.md) 对 [ADR 0019](.agents/docs/adr/0019-workbench-color-and-icon-theme-platform.md) 双模型拆分的修正。

`IconThemeContribution` 图标主题的交付方式保持一致：通过 JSON 资源声明图标映射集合，宿主底栏等组件统一消费 `ShellIconRef`（可为注册表键名或结构化图标描述符）。

### JSON-only 主题分发

纯资源的无代码主题以 `ThemeManifest` 形式在线分发：Manifest 文件中显式声明 `themeId`、`colorsUrl` 与 `iconThemeUrl`，在安装后由 `OfficialPluginService` 使用轻量级无头 `ScopedContext` 直接注册资产——整个流程不包含任何 JavaScript 脚本打包与执行。

包含动态取色、自定义特效等复杂逻辑的主题，则采用 ESM 插件形态开发与分发（参考 `packages/plugins/wallpaper`）。

### 动态配色事件

内核层定义了统一的动态取色事件规范：`dynamicColor:set`（携带图片 Blob 数据）、`dynamicColor:changed`（携带图片 URI 地址）、`dynamicColor:hydrate`（请求重放当前取色状态）。宿主 `AppShell` 仅维护最新的 `dynamicColorUri`（新事件覆盖旧值），并将 URI 传递给当前主题的取色适配器以完成界面渲染。偏好设置中的 `palette: 'wallpaper'` 用于指示启用动态取色通道。

### 用户偏好相关项

- `visualThemeId`：用户当前选择的配色主题 ID。
- `palette: 'vibrant' | 'wallpaper'`：调色板模式，其中 `wallpaper` 表示启用壁纸动态取色通道。
- **注意**：系统中不存在独立的 `iconThemeId` 偏好项，请勿新增该配置字段。
