# ADR 0021: 插槽消费缝隙收敛 — 排序契约下沉、文本解析与 mountable 单一实现

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联**: 落实 [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md) 的消费侧闭环；兑现 CONTEXT.md 冲突策略表「Coexist; sorted by order」的既有承诺
- **范围**: `packages/core/src/types/slots`, `packages/core/src/runtime/hierarchical-slot-registry`, `packages/ui-kit`, `apps/web`

---

## 背景与问题

插槽的排序契约早已写入 CONTEXT.md，但实现散落在消费端：

1. `HierarchicalSlotRegistry.get()` 本就按 `(order ?? 50)` 稳定排序返回，而 BottomTabBar、MineScreen（×2）、TransferExportScreen、transfer-state 仍各自再做一次冗余排序——魔法数 50 散落 5 处。
2. LocalizedText 三元解析（`typeof x === 'function' ? x() : x`）在宿主各屏重复 ~9 处。
3. mountable 挂载协议（Symbol 判定 + try/catch mount/unmount）在 PluginScreenContainer 与 TransferImportScreen 近乎逐行复制两份。
4. primary 选择（`find(isPrimary) ?? sort[0]`）在 transfer-state 与 TransferExportScreen 双写。
5. ui-kit `SlotOutlet` 导出但零消费者——一个没有适配器的假想缝隙。

## 架构决策

1. **排序以 registry 为唯一真相**：`get()` 返回稳定排序副本即为契约；删除全部消费端二次排序；`order ?? 50` 字面量只允许存在于 registry。
2. **core 新增纯函数 helper**：
   - `resolveLocalizedText(text, fallback?)` —— LocalizedText 解析唯一实现；
   - `pickPrimary(items)` —— 主操作选择唯一实现。
3. **ui-kit 新增 `MountableSlotOutlet.svelte`**：mountable 生命周期（isChronosMountable 判定、try/catch mount/unmount）单一实现；PluginScreenContainer 与 TransferImportScreen 均委托该组件。两个真实消费者使缝隙成立。
4. **删除 SlotOutlet**：各屏均有定制渲染诉求且无任何采用者——删除直到出现真实需求（缝隙的位置是设计决策，不是预付款）。
5. MineScreen 分组后不再重排：section/item 插入序即 registry 排序序。

## 影响与收益

- **Leverage**：新插槽家族零样板接入——排序、文本解析、主操作选择免费获得一致语义。
- **Locality**：顺序/解析 bug 只能出现在一处；`vp test` 对 registry 排序与 helper 的单测即覆盖全部消费屏。
- 删除测试通过：SlotOutlet 移除无任何调用方破裂。

## 验证

- `grep "(a.order ?? 50)" apps packages` 仅命中 hierarchical-slot-registry.ts
- `typeof .* === 'function' ? .*()` 模式业务代码清零（badge 数字型场景除外）
- `vp check` / `vp test` 全绿
