# ADR 0020: codec-kit 共享编解码原语收敛

- **状态**: Accepted
- **日期**: 2026-08-23
- **关联提交**: `2a37e7d`, `4a5feda`, `faca0ab`, `c9a8131`, `4f30afc`, `23fd807`
- **范围**: `packages/codec-kit`（新增）, `packages/plugins/codec-share`, `packages/plugins/codec-qrcode`

---

## 背景与问题

`codec-share` 与 `codec-qrcode` 各自实现了字节级编解码原语，且已发生语义漂移：

| 能力         | codec-share                                       | codec-qrcode                              | 漂移                     |
| ------------ | ------------------------------------------------- | ----------------------------------------- | ------------------------ |
| 周次 bitmask | `1 << (week - 1)`，MAX=32                         | `1 << w`，上限 31                         | **偏移差一位，不可互换** |
| deflate      | `'deflate'`（zlib 包装），reader-pump 手拼 chunks | `'deflate-raw'`，`Response.arrayBuffer()` | 格式与实现均不同         |
| 字符串池     | 上限 255 溢出抛错                                 | 无上限                                    | 校验缺失                 |
| base64       | url-safe 无填充                                   | 标准 padded                               | 变体不同                 |

重复导致的知识分散是实际风险（bitmask 偏移漂移即为实证）；而线格式（信封、版本策略）属于各插件的产品接口，**不应**统一。

## 备选方案否决

| 方案                        | 否决理由                                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 迁入宿主 `apps/web`         | CONTEXT.md 已记录 share-link codec 不进 web 的决策；官方 ESM bundle 插件无法 import 宿主内部模块                 |
| 迁入 `@chronos/core`        | ADR 0001 微内核边界：core 只容纳平台端口（storage/http/vault 等），压缩原语非内核能力                            |
| ServiceContainer 运行时服务 | 服务共享要求提供方在场；codec-qrcode 是独立异步加载的 bundle，提供方缺席时仍需自带完整回退实现，等于维护两份代码 |

## 架构决策

新建 workspace 包 **`@chronos/codec-kit`**（与 `@chronos/ui-kit` 同类的构建期共享库，非插件），两个插件以普通 npm 依赖消费。这与 ADR 0015/0016 的子路径导出先例同构：插件化的边界是运行时互不依赖对方的槽位与服务，不禁止共用同一个库。

### 提供的接口（全部纯函数，零线格式知识）

- `deflateRaw` / `inflateRaw`：统一为 `'deflate-raw'`；浏览器走 `CompressionStream`，其余环境经 `@vite-ignore` 计算 specifier 懒加载 `node:zlib`；失败一律 throw，回退策略归调用方
- `bytesToBase64` / `base64ToBytes` / `bytesToBase64Url` / `base64UrlToBytes`
- `crc32` / `appendCrc32` / `verifyAndStripCrc32`（校验失败返回 `null`，错误类型映射归调用方）
- `writeVarint` / `VarintReader`
- `MAX_TIMETABLE_WEEK = 32`、`assertValidWeeks`、`weeksToBitmask`（规范 `bit(w-1)`）/ `bitmaskToWeeks`
- `StringInterner`（trim 归一、空值 → `-1`、可选 `maxEntries` 溢出抛错、可选 seed）

### 明确不放进去的

- 线格式信封（`"2."`、`"chronos-qr:v2:"`、版本字节、压缩标志位）
- brotli-wasm 懒加载与自适应选择策略（留在 codec-share）
- Timetable ↔ bytes 的完整编码器（`chronos-share-binary.ts` 是 codec-share 的产品实现）

### 行为变化声明（无存量用户，无版本升级）

1. share-link 的 deflate 从 zlib 包装切换为 raw（对外版本字节值不变）；Node 测试环境与浏览器行为对齐，编码产物从 brotli 版本变为 deflate 版本
2. qr 载荷 bitmask 从 `1<<w` 翻转为规范的 `1<<(w-1)`，信封 `"chronos-qr:v2:"` 不变；周次超界由静默丢弃改为抛错
3. 分享链接体积阈值测试相应放宽（15 门课 <520、25 门课 CQUT <740 字符）

---

## 后果

- 全仓 `weeksToBitmask`/varint/crc32/base64 单一真相，消除漂移面
- 官方 ESM bundle 构建自动内联 kit 代码（rolldown `inlineDynamicImports`），分发形态不变
- 第三个导出渠道（NFC/图片识别等）出现时直接复用原语层
