# 槽位目录

全部标准插槽的契约参考。定义位于 `packages/core/src/types/slots.ts`；扩展新槽位的步骤见[操作手册](../develop/cookbook/new-slot-type.md)。

## 总览

| 槽位路径                     | 用途                                       | 多贡献者策略                                       |
| ---------------------------- | ------------------------------------------ | -------------------------------------------------- |
| `import.source.tab`          | 导入数据源标签页（在线/文件/链接）         | 共存，按 `order` 排序                              |
| `export.action`              | 课表导出动作（复制/下载/自定义）           | 共存，`isPrimary` 选主                             |
| `mine.section` / `mine.item` | 「我的」页分区与条目                       | 共存，按 `order` 排序                              |
| `shell.route.screen`         | 插件全屏页面（`/plugins/[pluginId]/[id]`） | 每 id 一屏                                         |
| `shell.bottom-bar.tab`       | 底栏导航标签                               | 共存，按 `order` 排序                              |
| `timetable.cell.badge`       | 课程卡徽章                                 | 聚合所有贡献者（RESERVED，零生产者时早退）         |
| `course.detail.action`       | 课程详情操作项                             | 共存，按 `order` 排序                              |
| `theme.definition`           | 配色主题                                   | 注册多个，用户选择其一                             |
| `theme.icon.definition`      | 图标主题                                   | 由激活主题 `recommendedIconTheme` 派生，无独立偏好 |

## 通用约定

- **LocalizedText**：所有用户可见文案为 `string | (() => string)`；消费端经内核单源 `resolveLocalizedText()` 解析。
- **排序**：可选 `order` 升序；主条目用 `pickPrimary()`（显式 `isPrimary` 优先，否则首个）。
- **富 UI**：组件字段一律 `component?: ChronosMountable`（单一挂载协议），宿主只经 `MountableSlotOutlet` 渲染。
- **同 id 覆盖**：同一槽位下相同 `contribution.id` 后注册者胜出，开发期告警。

## import.source.tab

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

## export.action

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

## shell.route.screen

```ts
interface PluginScreenSlotContribution {
	id: string; // 映射到 /plugins/[pluginId]/[id]
	title: LocalizedText;
	component?: ChronosMountable; // 缺省回退 schema 声明式渲染
	schema?: ConfigSchema;
}
```

## mine.item

`sectionId` 关联到某个 `mine.section` 贡献；`href` 指向内置路由或插件动态路由；`keywords` 支撑搜索；`iconTone` 取 `primary | secondary | tertiary | neutral`。

## theme.definition

即 [`ThemeContribution`](./themes.md)：封闭 workbench 颜色键、设计令牌、课程画笔、可选动态取色适配器与推荐图标主题。

## 自定义槽位

`StandardSlotMap` 之外的键允许存在，但需要宿主消费点才有意义。第三方可用 `declare module '@chronos/core'` 经 `CustomSlotMap` 扩展类型；新增标准槽位请走[操作手册](../develop/cookbook/new-slot-type.md)流程并补充本目录。
