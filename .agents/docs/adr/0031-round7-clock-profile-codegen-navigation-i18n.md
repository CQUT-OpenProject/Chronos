# ADR 0031: Round 7 时钟单轨、Profile 客户端 codegen、导航端口与插件规范收口

- **状态**: Accepted
- **日期**: 2026-09-01
- **关联提交**: `c25424e`, `e400d11`, `31e607e`
- **关联**: 对齐 [ADR 0024](./0024-plugin-message-catalog-i18n.md) 插件 i18n 与 [ADR 0021](./0021-slot-consumption-seam.md) 消费缝隙；C7 缓议延续 [ADR 0027](./0027-round6-architecture-subtraction.md)
- **范围**: `packages/core`, `apps/web`, `packages/plugins/*`, `packages/ui-kit`

---

## 背景与问题

Round 6 之后仍存在三处 `createDayClock` 并行、`profile-registry` 静态 import `source-cqut`、今日插件硬编码宿主路径、以及若干插件 i18n / 图标 / 排序双轨残留。

## 架构决策

### 1. 引擎独占 DayClock

- `ChronosEngine.init()` 启动唯一 `createDayClock`；`dispose()` 停钟。
- `updateTime()` 仍用 `'none'` 语义；`time:tick` 载荷扩展为 `{ currentWeek, currentPeriod, now, todayIso }`。
- 宿主课表屏与 `tool-today` 删除自建 clock，经 `ReactiveChronosController.clockNow/clockTodayIso` 订阅。
- 删除 `ReactiveChronosController.updateTime` 死面。

### 2. 可选宿主导航端口

- 新增 `IHostNavigation.openCourseEditor(courseId)`，经 `ChronosEnv.navigation` → `ServiceContainer` 注册。
- `ChronosContext.tryService` 对齐 `ServiceContainer.tryGet`。
- Web 适配器内部 `goto('/timetable/course-editor?...')`；插件禁止硬编码宿主路径。

### 3. Profile 客户端按需打包

- 扩展 `chronos-profile-plugin` 生成 `available-plugins.generated.ts`，按 `CHRONOS_PROFILE` 仅静态 import 该 profile 启用的 builtin。
- `profile-definitions.ts` 以字面量维护 server proxy 契约，default profile 构建不再 import `@chronos/plugin-source-cqut`。
- `@chronos/plugin-source-cqut` 移至 `apps/web` `optionalDependencies`。

### 4. 减法与规范

- 删除 `source-cqut` 零引用 campus share 映射导出。
- `MineItemSlotContribution.icon` 统一为 `ShellIconRef`；宿主仅保留 `SHELL_ICON_MAP`。
- `resolveDefaultLaunchTab` / `pickFallbackTabId` 假定 registry 已排序，不再二次 `order ?? 50` 比较。
- 插件 message catalog 覆盖 parser / screen 文案；官方 bundle Vite `define` 注入 `__CHRONOS_PLUGIN_VERSION__`；内置列表隐藏默认 `1.0.0` 版本徽章。

## 非目标

- 不删宿主对 catalog 插件目录的 Tailwind `@source`（utility 仍靠宿主扫描）。
- 不改 `DYNAMIC_COLOR_SCHEME_ID = 'wallpaper'`。
- 不执行 C7 `bootstrapChronos`、不碰 FROZEN serial/waterfall。

## 后果

- 时钟边界与 profile 打包在构建期可验证；插件跳转经端口解耦；i18n 与图标单轨与 ADR 0024/0021 对齐。

## 修订记录

- 2026-09-01：初版 Accepted。
