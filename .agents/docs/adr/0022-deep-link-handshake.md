# ADR 0022: 深链握手泛化与导出格式知识归还插件

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `4d54649`, `6ad1d6c`, `4ac2df3`
- **关联**: 深化 [ADR 0013](./0013-import-pipeline-slot-closure-and-deep-convergence.md) 的导入插槽闭环；对齐 [ADR 0015](./0015-deepening-round2-build-credential-glue-convergence.md)「宿主零特判」主线
- **范围**: `packages/core/src/types/slots`, `packages/plugins/codec-share`, `apps/web/src/lib/transfer`, `apps/web/src/routes/s`, `apps/web/src/lib/config/features.ts`

---

## 背景与问题

`codec-share` 是宿主最后一个深度特化对象，删除测试不过：

1. `/s` 落地页直接 import `@chronos/plugin-codec-share` 的 `extractSharePayloadFromLocation`，硬编码 slotId `'share-link'` ×4 与 inputs 形状 `{content, fileContent}`——删 codec-share 即编译失败。
2. 分享链接的 2000 字符推荐阈值由宿主 `SHARE_LINK_MAX_RECOMMENDED_LENGTH` 持有并施加于任意 primary 导出动作；警告文案在宿主重复三处（codec-share 的 `checkWarning` 已自带同语义实现，宿主 fallback 为死路径）。
3. TransferExportScreen 用 MIME 嗅探猜 disposition，而贡献已显式声明 `disposition: 'clipboard'`。
4. `setDirectPreview` 默认参数写死 `'share-link'`（无生产调用方依赖默认值）。
5. features.ts 兜底默认导入槽点名 `'share-link'`。

## 架构决策

### 1. `ImportTabSlotContribution.deepLink` 元数据

```ts
deepLink?: {
  fromLocation(location: Pick<Location, 'hash' | 'search'>): Record<string, unknown> | null;
};
```

codec-share 注册 `share-link` 时声明 `fromLocation`（包装其 payload 提取 + inputs 构造）。线格式知识完整留在插件内。

### 2. `/s` 页退化为通用分发器

新增纯函数 `resolveDeepLinkImport(tabs, location)`：遍历排序后的 import tab，返回首个认领该 location 的贡献及其 inputs。页面不再 import 任何插件包；卸载 codec-share 后 `/s` 显示优雅降级引导。

### 3. 格式知识归还

- 删除宿主阈值常量与 `estimateLength` fallback 分支（`checkWarning` 已是声明式通道）；
- 警告文案单源化：route 将 `getExportMetadata().warningMessage` 直传屏幕，删除两处硬编码文案；
- disposition 解析收敛为 `result.disposition ?? action.disposition ?? 'download'`，删除 MIME 嗅探；
- `setDirectPreview(t, slotId)` 参数必填；
- features.ts 兜底返回 profile 声明值本身，未声明时由 UI 回退到第一个可用槽（而非点名任何插件 id）。

## 影响与收益

- **删除测试通过**：删 codec-share 后宿主编译完好、`/s` 优雅降级；
- **Leverage**：第二个深链来源（如 NFC、图片识别落地页）零宿主改动接入；
- **Locality**：分享格式的全部知识（payload 提取、inputs 形状、长度阈值、警告文案）集中于 codec-share。

## 验证

- `grep -r "@chronos/plugin-" apps/web/src/routes` 零命中
- `grep "'share-link'" apps/web/src` 仅剩 profile 数据文件
- deep-link 单测覆盖命中/未命中/跳过继续扫描三条路径
- `vp check` / `vp test` 全绿
