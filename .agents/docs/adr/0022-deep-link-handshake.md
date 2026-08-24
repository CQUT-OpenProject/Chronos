# ADR 0022: 深链握手泛化与导出格式知识归还插件

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `4d54649`, `6ad1d6c`, `4ac2df3`
- **关联**: 深化 [ADR 0013](./0013-import-pipeline-slot-closure-and-deep-convergence.md) 的导入插槽闭环；对齐 [ADR 0015](./0015-deepening-round2-build-credential-glue-convergence.md)「宿主零特判」主线
- **范围**: `packages/core/src/types/slots`, `packages/plugins/codec-share`, `apps/web/src/lib/transfer`, `apps/web/src/routes/s`, `apps/web/src/lib/config/features.ts`

---

## 背景与问题

宿主代码中对 `codec-share` 的深度特化（专门为该插件编写的逻辑）是最后一个待清除对象。深链（deep link，从应用外部 URL 直接进入某个功能的链接）由 `/s` 落地页承接。我们用「删除测试」检验解耦：把插件整体删除后，宿主必须仍能编译运行。当前该测试不通过，具体问题如下：

1. `/s` 落地页直接 import `@chronos/plugin-codec-share` 包的 `extractSharePayloadFromLocation`，并在 4 处硬编码 slotId `'share-link'` 与 inputs 形状 `{content, fileContent}`。因此一旦删除 codec-share，宿主就无法通过编译。
2. 分享链接的 2000 字符推荐阈值由宿主常量 `SHARE_LINK_MAX_RECOMMENDED_LENGTH` 持有，并被施加到任意 primary 导出动作上。同语义的警告文案在宿主重复了三处；codec-share 的 `checkWarning` 已自带同样的实现，宿主那份 fallback 是永远不会执行的死路径。
3. TransferExportScreen 用 MIME 类型嗅探去猜 disposition（导出去向），而插槽贡献里已显式声明 `disposition: 'clipboard'`。
4. `setDirectPreview` 的默认参数写死为 `'share-link'`，而没有任何生产调用方依赖这个默认值。
5. features.ts 的兜底逻辑把默认导入槽点名写死为 `'share-link'`。

## 架构决策

### 1. `ImportTabSlotContribution.deepLink` 元数据

```ts
deepLink?: {
  fromLocation(location: Pick<Location, 'hash' | 'search'>): Record<string, unknown> | null;
};
```

codec-share 注册 `share-link` 槽位时声明 `fromLocation`，由它包装原有的 payload 提取与 inputs 构造两步。这样，分享链接的解析格式知识完整留在插件内部，宿主不再接触这些细节。

### 2. `/s` 页退化为通用分发器

新增纯函数 `resolveDeepLinkImport(tabs, location)`。它遍历排序后的 import tab 列表，逐个尝试各贡献的 `fromLocation`；返回值非 null 即视为认领。函数返回第一个认领该 location 的贡献及其 inputs。改造后，页面不再 import 任何插件包；卸载 codec-share 后，`/s` 显示降级引导界面。

### 3. 格式知识归还

- 删除宿主的阈值常量与 `estimateLength` fallback 分支；长度警告已由插件的 `checkWarning` 以声明式通道提供，宿主无需重复实现；
- 警告文案收敛为单一来源：route 把 `getExportMetadata().warningMessage` 直接传给屏幕组件，并删除另外两处硬编码文案；
- disposition 解析规则收敛为 `result.disposition ?? action.disposition ?? 'download'` 一行，删除 MIME 嗅探代码；
- `setDirectPreview(t, slotId)` 的参数改为必填；
- features.ts 兜底时返回 profile 声明的值本身；profile 未声明时，由 UI 回退到第一个可用槽位，不再点名任何插件 id。

## 影响与收益

- **删除测试通过**：删除 codec-share 后，宿主照常编译，`/s` 显示降级引导界面；
- **Leverage**：接入第二个深链来源（如 NFC、图片识别落地页）时，宿主零改动；
- **Locality**：分享格式的全部知识（payload 提取、inputs 形状、长度阈值、警告文案）集中在 codec-share 一处。

## 验证

- `grep -r "@chronos/plugin-" apps/web/src/routes` 零命中
- `grep "'share-link'" apps/web/src` 仅剩 profile 数据文件
- deep-link 单元测试覆盖三条路径：命中、未命中、跳过后继续扫描
- `vp check` / `vp test` 全绿
