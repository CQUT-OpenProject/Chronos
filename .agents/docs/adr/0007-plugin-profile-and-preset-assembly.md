# ADR 0007: 基于 Profile 的高校预设包与插件装配体系 (ProfileManager)

- **状态**: Accepted
- **日期**: 2026-08-20
- **关联提交**: `80919e1`, `fb61543`, `aee351d`, `da2613c`, `6dd6a94`, `79b343a`, `c03d2dc`, `d401a93`, `ea55fac`
- **范围**: 发行与预设装配体系 (`packages/core/src/profile/profile.ts`, `apps/web/src/lib/boot/profile-registry.ts`)

---

## 背景与问题

Chronos 最初为重庆理工大学（CQUT）定制，随着向多高校通用课表引擎演进：

1. **分支维护成本高**：若为每所高校单独维护独立分支或仓库，维护成本巨大且排课核心算法难以同步更新；
2. **全量打包产物体积膨胀**：若把所有高校的插件和解析器打包至同一产物中，最终 PWA 包含大量多余代码；
3. **缺乏标准化的高校定制机制**：需要一套灵活的按需装配与针对性发行的构建体系。

---

## 架构决策

引入 **Profile 配置与 `ProfileManager` 装配体系**：

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

- **`id` / `name` / `targetAudience`**：Profile 标识与目标群体描述；
- **`defaultPreferences`**：默认偏好设置预设；
- **`builtinPlugins`**：预装并内置激活的插件列表（按依赖顺序排列）；
- **`customMetadata`**：Profile 级别的全局元数据（如学校教务系统基址、校历起始推算模板等）。

### 2. 构建与运行时集成

- 构建期通过环境变量 `PROFILE_NAME` 自动选择目标 Profile，仅打包所需插件，产出体积最小的静态发布包；
- 运行期 `ProfileManager` 在引擎启动时严格按照 Profile 定义顺序加载内置插件；`core-shell` 作为首个加载的基础插件，确保底栏与「我的」设置等核心视图正常就绪。

---

## 影响与收益

- **产物体积零冗余**：特定高校产物仅包含该高校所需插件，极大减小首屏包体积；
- **多校共享统一内核**：所有定制版本共享同一 `@chronos/core`，核心排课与渲染能力升级时全量受益。
