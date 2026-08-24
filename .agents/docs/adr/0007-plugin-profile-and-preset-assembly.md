# ADR 0007: 基于 Profile 的高校预设包与插件装配体系 (ProfileManager)

- **状态**: Accepted
- **日期**: 2026-08-20
- **关联提交**: `80919e1`, `fb61543`, `aee351d`, `da2613c`, `6dd6a94`, `79b343a`, `c03d2dc`, `d401a93`, `ea55fac`
- **范围**: 发行与预设装配体系 (`packages/core/src/profile/profile.ts`, `apps/web/src/lib/boot/profile-registry.ts`)

---

## 背景与问题

Chronos 最初为重庆理工大学（CQUT）定制，随着向通用多高校课表引擎演进：

1. 若为每所高校单独维护一个 Git 分支或独立仓库，维护成本巨大且排课内核更新无法同步；
2. 若在单一产物中无脑打包所有高校的插件和解析器，会导致最终 PWA 体积膨胀，包含大量冗余逻辑；
3. 需要一套灵活的按需定制装配与发行构建体系。

---

## 架构决策

引入 **Profile 概念与 `ProfileManager` 装配体系**：

```mermaid
flowchart TD
    ProfileDef[Profile 定义: cqut-full / generic] --> Assembly[ProfileManager]
    Assembly --> CoreShell[core-shell 基础外壳]
    Assembly --> SourcePlugin[高校数据源: source-cqut]
    Assembly --> CodecPlugin[编解码器: codec-share]
    Assembly --> ToolPlugin[工具与主题: wallpaper, theme-yumemita]
    Assembly --> FinalApp[构建交付对应高校专属产物]
```

### 1. Profile 契约定义

每个 Profile 定义包含：

- **`id` / `name` / `targetAudience`**：Profile 标识与目标群体；
- **`defaultPreferences`**：默认偏好预设；
- **`builtinPlugins`**：预装并内置激活的插件列表（按依赖顺序排列）；
- **`customMetadata`**：Profile 级别的全局元数据（如学校教务系统基址、校历起始推算模板等）。

### 2. 构建与运行时集成

- 构建期通过环境变量 `PROFILE_NAME` 自动选择要打包的 Profile，打包最精简的静态发布包；
- 运行期 `ProfileManager` 在引擎启动时严格按照 Profile 定义顺序挂载内置插件，`core-shell` 升格为首个内置插件确保基础底栏和我的页面常驻。

---

## 影响与收益

- **Zero Bloat（零冗余体积）**：特定高校构建产物仅包含该高校必需插件，体积保持极致轻量；
- **Multi-tenant Core（单内核多租户）**：一套 `@chronos/core` 驱动无限所高校定制版。
