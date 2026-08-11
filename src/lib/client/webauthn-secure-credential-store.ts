import type { SavedCredentialState } from '$lib/models/auth';
import type { SecureCredentialStore } from '$lib/domain/interfaces/secure-credential-store';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import { credentialEnvironment } from './credential-environment.svelte';
import { encodePasswordPayload, decodePasswordPayload } from './webauthn/credential-payload';
import { base64ToBytes, bytesToBase64, randomBytes } from './webauthn/binary';
import { deriveAesKey, decryptPayload, encryptPayload } from './webauthn/prf-crypto';

const CREDENTIAL_INVALIDATED_MESSAGE = '已保存凭据已失效，请重新录入账号和密码';

export function createWebAuthnSecureCredentialStore(
	storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
): SecureCredentialStore {
	const listeners = new Set<(state: SavedCredentialState) => void>();
	const accountOnlyFallbackAvailable = storage != null;
	let pendingSalt: string | null = null;

	function buildState(): SavedCredentialState {
		const record = readOnlineCredentialRecord(storage);
		const savedAccount =
			record?.mode === 'account_only' || record?.mode === 'prf' ? record.account : null;

		return {
			account: savedAccount,
			hasSavedCredential: record != null,
			protectionAvailable: credentialEnvironment.prfAvailable,
			capabilitiesReady: credentialEnvironment.ready,
			savedMode: record?.mode ?? null
		};
	}

	function notify() {
		const state = buildState();
		for (const listener of listeners) {
			listener(state);
		}
	}

	async function ensureEnvironmentReady(): Promise<void> {
		await credentialEnvironment.init();
	}

	if (typeof window !== 'undefined') {
		credentialEnvironment.subscribe(() => notify());
		void ensureEnvironmentReady();
	}

	function subscribeSavedCredentialState(
		listener: (state: SavedCredentialState) => void
	): () => void {
		listeners.add(listener);
		listener(buildState());
		return () => listeners.delete(listener);
	}

	async function prepareSave(): Promise<AppResult<string>> {
		await ensureEnvironmentReady();
		if (!credentialEnvironment.prfAvailable) {
			return failure(AppError.security('当前设备不支持保存帐号密码'));
		}

		const salt = randomBytes(32);
		pendingSalt = bytesToBase64(salt);
		return success(pendingSalt);
	}

	async function saveCredential(
		account: string,
		password: string,
		unlockToken: string
	): Promise<AppResult<void>> {
		const trimmedAccount = account.trim();
		if (!trimmedAccount) {
			return failure(AppError.validation('账号不能为空'));
		}

		await ensureEnvironmentReady();

		if (!credentialEnvironment.prfAvailable) {
			if (!accountOnlyFallbackAvailable) {
				return failure(AppError.security('当前设备不支持保存帐号密码'));
			}
			if (unlockToken.trim()) {
				return failure(AppError.security('当前设备不支持保存帐号密码'));
			}
			writeOnlineCredentialRecord({ mode: 'account_only', account: trimmedAccount }, storage);
			pendingSalt = null;
			notify();
			return success(undefined);
		}

		if (!pendingSalt) {
			return failure(AppError.security('请先准备保存凭据'));
		}
		if (!unlockToken.trim()) {
			return failure(AppError.security('设备验证未完成'));
		}

		try {
			const parsed = JSON.parse(unlockToken) as { prf?: string; credentialId?: string };
			if (!parsed.prf || !parsed.credentialId) {
				return failure(AppError.security('保存在线凭据失败'));
			}

			const aesKey = await deriveAesKey(base64ToBytes(parsed.prf), base64ToBytes(pendingSalt));
			const encrypted = await encryptPayload(aesKey, encodePasswordPayload(password));
			writeOnlineCredentialRecord(
				{
					mode: 'prf',
					account: trimmedAccount,
					credentialId: parsed.credentialId,
					salt: pendingSalt,
					iv: encrypted.iv,
					ciphertext: encrypted.ciphertext
				},
				storage
			);
			pendingSalt = null;
			notify();
			return success(undefined);
		} catch {
			return failure(AppError.security('保存在线凭据失败'));
		}
	}

	async function prepareUnlock(): Promise<AppResult<string>> {
		await ensureEnvironmentReady();
		const record = readOnlineCredentialRecord(storage);
		if (!record) {
			return failure(AppError.security('当前没有可用的已保存凭据'));
		}
		if (record.mode === 'account_only') {
			return failure(AppError.security('当前仅保存了账号，请输入密码后预览'));
		}
		return success(JSON.stringify({ salt: record.salt, credentialId: record.credentialId }));
	}

	async function unlockCredential(
		unlockToken: string
	): Promise<AppResult<{ account: string; password: string }>> {
		const record = readOnlineCredentialRecord(storage);
		if (!record) {
			return failure(AppError.notFound('未找到已保存的在线凭据'));
		}
		if (record.mode === 'account_only') {
			return failure(AppError.security('当前仅保存了账号，请输入密码后预览'));
		}
		if (!unlockToken.trim()) {
			return failure(AppError.security('设备验证未完成'));
		}

		try {
			const parsed = JSON.parse(unlockToken) as { prf?: string };
			if (!parsed.prf) {
				return failure(AppError.security('读取已保存凭据失败'));
			}

			const aesKey = await deriveAesKey(base64ToBytes(parsed.prf), base64ToBytes(record.salt));
			const decrypted = await decryptPayload(aesKey, record.iv, record.ciphertext);
			return success({
				account: record.account,
				password: decodePasswordPayload(decrypted)
			});
		} catch {
			writeOnlineCredentialRecord(null, storage);
			notify();
			return failure(AppError.security(CREDENTIAL_INVALIDATED_MESSAGE));
		}
	}

	async function clearCredential(): Promise<AppResult<void>> {
		writeOnlineCredentialRecord(null, storage);
		pendingSalt = null;
		notify();
		return success(undefined);
	}

	return {
		subscribeSavedCredentialState,
		saveCredential,
		unlockCredential,
		clearCredential,
		prepareSave,
		prepareUnlock
	};
}
