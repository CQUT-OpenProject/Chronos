# ADR 0021: 插槽消费缝隙收敛 — 排序契约下沉、文本解析与 mountable 单一实现

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `dd87c35`, `dcf87e6`, `6ad1d6c`, `27076d1`, `4ac2df3`, `5ac598b`
- **关联**: 落实 [ADR 0003](./0003-hierarchical-slot-registry-and-extensibility.md) 的消费侧闭环；兑现 CONTEXT.md 冲突策略表「Coexist; sorted by order」的既有承诺
- **范围**: `packages/core/src/types/slots`, `packages/core/src/runtime/hierarchical-slot-registry`, `packages/ui-kit`, `apps/web`

---

## 背景与问题

插槽的排序契约早已写入 CONTEXT.md，但实现散落在消费端：

1. `HierarchicalSlotRegistry.get()` 本来就按 `(order ?? 50)` 做稳定排序后返回，但 BottomTabBar、MineScreen（两处）、TransferExportScreen、transfer-state 又各自再排一次——默认值 50 这个魔法数在 5 个地方重复出现。
2. LocalizedText 的解析逻辑（`typeof x === 'function' ? x() : x`）在宿主各屏重复了约 9 处。
3. mountable 挂载协议（Symbol 判定 + try/catch 包裹的 mount/unmount）在 PluginScreenContainer 与 TransferImportScreen 里几乎逐行复制了两份。
4. 主操作选择逻辑（`find(isPrimary) ?? sort[0]`）在 transfer-state 与 TransferExportScreen 各写了一份。
5. ui-kit 导出了 `SlotOutlet` 组件但没有任何消费者——它对应一个并不存在的使用场景。

## 架构决策

1. **排序以 registry 为唯一依据**：`get()` 返回的稳定排序副本就是契约；删除所有消费端的二次排序；`order ?? 50` 这个字面量只允许出现在 registry 里。
2. **core 新增纯函数工具**：
   - `resolveLocalizedText(text, fallback?)` —— LocalizedText 解析的唯一实现；
   - `pickPrimary(items)` —— 主操作选择的唯一实现。
3. **ui-kit 新增 `MountableSlotOutlet.svelte`**：mountable 的完整生命周期（isChronosMountable 判定、try/catch 包裹的 mount/unmount）只在这一个组件里实现；PluginScreenContainer 与 TransferImportScreen 都委托给它。有两个真实消费者，这个抽象才成立。
4. **删除 SlotOutlet**：各屏幕都有定制渲染需求且没有任何使用方——在真实需求出现之前先删除（要不要留扩展点是设计决策，不是提前占位）。
5. MineScreen 分组后不再重新排序：section/item 的插入顺序即 registry 排序顺序。

## 影响与收益

- **接入成本低**：新增一类插槽时零样板代码——排序、文本解析、主操作选择自动获得一致语义。
- **问题只会出现在一处**：顺序或解析相关的 bug 只可能在唯一实现里出现；`vp test` 对 registry 排序与工具函数的单测即可覆盖全部消费屏幕。
- 删除测试通过：移除 SlotOutlet 后没有任何调用方报错。

## 验证

- `grep "(a.order ?? 50)" apps packages` 仅命中 hierarchical-slot-registry.ts
- `typeof .* === 'function' ? .*()` 模式业务代码清零（badge 数字型场景除外）
- `vp check` / `vp test` 全绿
