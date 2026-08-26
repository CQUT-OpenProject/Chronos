# ADR 0017: Web 端 WebAuthn 凭据功能退役

- **状态**: Accepted
- **日期**: 2026-08-22
- **关联提交**: `567a2e7`, `4a69a9f`
- **关联**: 退役 [ADR 0006](./0006-hardware-credential-vault-via-webauthn-prf.md) Web 实现层；撤销 [ADR 0015](./0015-deepening-round2-build-credential-glue-convergence.md) §2 凭据缝隙上移在 Web 端的落地
- **范围**: `packages/plugins/source-cqut`, `apps/web/src/lib/transfer`, `apps/web/src/lib/client`, `apps/web/src/lib/providers`, `packages/core/src/types`

---

## 背景与问题

ADR 0006 引入 `IVaultService` 与 Web 端 WebAuthn PRF 保险箱，ADR 0015 将凭据元数据上移至 `ImportTabSlotContribution.credential`，由宿主 `transfer-state` + `credential-vault` 泛化消费。

实践中该能力**仅**服务于 `source-cqut` 知行理工在线导入的「保存帐号密码 / 验证并预览」流程，带来：

1. 宿主与插件边界模糊（凭据键名、vault 状态机、PRF 检测胶水）；
2. Web 端维护成本高（`webauthn/*`、`WebAuthnVaultProvider`、隐私政策双模式说明）；
3. 安全收益有限——密码仍需每次经服务端代理认证；本地加密保存并没有减少需要保护的敏感数据，反而扩大了攻击面，也让隐私政策的说明更复杂。

产品决策：**移除 Web 端凭据持久化与 WebAuthn 实现**，在线导入恢复为每次手动输入账号密码。

---

## 架构决策

### 1. source-cqut 插件

- 删除 `credentials.ts` 与 `saveCredentialsIfRequested`；
- `CqutOnlineImportTab` 仅保留账号/密码表单与单次导入；
- 插件 `apply()` 启动时清理历史 `credential-record`。

### 2. 宿主拆除

- 删除 `transfer-state` 凭据 vault 状态机（`previewWithSavedCredential`、`clearSavedCredential`、`savedCredentialState`）；
- 删除整目录 `apps/web/src/lib/client/webauthn/`、`credential-vault`、`credential-environment`、`WebAuthnVaultProvider`；
- `createWebChronosEnv` 不再注入 `vault`；
- 启动时 `runVaultLegacyCleanup` 清除 `localStorage` 中 `chronos_vault_enc:*` 与插件侧 `credential-record`。

### 3. Core 保留端口、收紧契约

- **保留** `IVaultService` 接口定义（供未来 iOS/Android 原生宿主）；
- `ChronosEnv.vault` 改为**可选**；
- 删除 `ImportTabSlotContribution.credential`（无消费者，避免悬空 API）。

### 4. ADR 0006 状态

- ADR 0006 **Accepted** 不变（端口契约仍有效）；
- Web 端 `WebAuthnVaultProvider` 实现层标记为 **Superseded by ADR 0017**。

---

## 影响

- 用户每次在线导入需重新输入密码；无「保存凭据」「验证并预览」入口；
- 隐私政策删除 WebAuthn PRF 相关条款；
- 代码库减少 ~15 个 WebAuthn/凭据专用文件。

---

## 验证

- `vp check` / `vp test -- --run` 全绿；
- 手动：知行理工导入屏仅账号+密码，导入成功；设置中无凭据相关 UI。
