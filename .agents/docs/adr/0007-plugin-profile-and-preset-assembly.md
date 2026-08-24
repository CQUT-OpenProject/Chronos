# ADR 0007: 基于 Profile 的高校预设包与插件装配体系 (ProfileManager)

- **状态**: Accepted
- **日期**: 2026-08-20
- **关联提交**: `80919e1`, `fb61543`, `aee351d`, `da2613c`, `6dd6a94`, `79b343a`, `c03d2dc`, `d401a93`, `ea55fac`
- **范围**: 发行与预设装配体系 (`packages/core/src/profile/profile.ts`, `apps/web/src/lib/boot/profile-registry.ts`)

---

## 背景与问题

Chronos 最初为重庆理工大学（CQUT）定制，随着向通用多高校课表引擎演进：

1. 若为每所高校单独维护一个 Git 分支或独立仓库，维护成本巨大且排课内核更新无法同步；
2. 若把所有高校的插件和解析器都打进同一个产物，最终 PWA 体积会膨胀，包含大量用不到的逻辑；
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

- 构建期通过环境变量 `PROFILE_NAME` 自动选择要打包的 Profile，只打包需要的插件，产出最小的静态发布包；
- 运行期 `ProfileManager` 在引擎启动时严格按照 Profile 定义顺序加载内置插件；`core-shell` 是第一个加载的内置插件，保证底栏和「我的」页面始终存在。

---

## 影响与收益

- **零冗余体积**：特定高校的构建产物只包含该高校需要的插件，体积小；
- **一套内核服务多所高校**：所有定制版共用同一个 `@chronos/core`，内核更新一次全部生效。
