# 新增一种插槽类型

当现有标准槽位无法表达新的扩展面时，按本步骤扩展内核契约。原则：**插槽是声明式贡献点，不是回调钩子**——先确认不能用现有槽位 + 新字段的组合解决。

## 1. 定义贡献契约

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

## 2. 实现宿主消费点

消费端只允许一套通用机制：

- 排序：`order` 升序，缺省排前；主操作用 `pickPrimary()`（显式 `isPrimary` 优先）。
- 文本：`resolveLocalizedText()` 单一实现。
- 富 UI：`MountableSlotOutlet` 渲染，缺失组件时回退 `SchemaForm`。

禁止在消费点写 `typeof x === 'function' ? x() : x` 之类的本地实现——这些工具已收敛为内核单源（[ADR 0021](/adr/0021-slot-consumption-seam)）。

## 3. 补充冲突策略

在 `CONTEXT.md` 的冲突策略表加一行，明确该槽位多贡献者时的行为（共存排序 / 聚合 / 单一所有者等）。没有策略的插槽不允许合入。

## 4. 测试与门禁

- registry 行为测试：注册、撤销、owner 追踪、同 id 覆盖告警。
- 消费端渲染测试：零贡献者早退、多贡献者排序。
- 运行 `vp check` 与 `vp test` 全绿。

## 5. 文档同步

- [槽位目录](../../reference/slots-catalog.md)追加条目；
- 若属于架构级决策（而非既有模式的应用），补一篇 ADR 并更新索引。
