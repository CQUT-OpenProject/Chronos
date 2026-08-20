import type { SavedCredentialState } from '$lib/models/auth';
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

export interface SecureCredentialStore {
	subscribeSavedCredentialState(listener: (state: SavedCredentialState) => void): () => void;
	saveCredential(account: string, password: string, unlockToken: string): Promise<AppResult<void>>;
	unlockCredential(unlockToken: string): Promise<AppResult<{ account: string; password: string }>>;
	clearCredential(): Promise<AppResult<void>>;
	prepareSave(): Promise<AppResult<string>>;
	prepareUnlock(): Promise<AppResult<string>>;
}

export function createWebAuthnSecureCredentialStore(
	storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
): SecureCredentialStore {
	const listeners = new Set<(state: SavedCredentialState) => void>();
	let pendingSalt: string | null = null;

	function buildState(): SavedCredentialState {
		const record = readOnlineCredentialRecord(storage);
		const savedAccount =
			record?.account ||
			(typeof localStorage !== 'undefined'
				? localStorage.getItem('cqut_username') || localStorage.getItem('last_account')
				: null);

		const hasValidEncryptedRecord =
			record &&
			record.mode === 'prf' &&
			record.account &&
			record.credentialId &&
			record.salt &&
			record.ciphertext &&
			record.iv;

		const hasSavedCredential = Boolean(hasValidEncryptedRecord || savedAccount);

		return {
			account: savedAccount,
			hasSavedCredential,
			protectionAvailable: credentialEnvironment.prfAvailable,
			capabilitiesReady: credentialEnvironment.ready,
			savedMode: hasValidEncryptedRecord ? 'prf' : savedAccount ? 'account_only' : null
		};
	}

	function notifyState() {
		const nextState = buildState();
		for (const listener of listeners) {
			listener(nextState);
		}
	}

	async function prepareSave(): Promise<AppResult<string>> {
		if (!credentialEnvironment.prfAvailable) {
			return failure(AppError.security('当前设备不支持硬件安全存储'));
		}
		pendingSalt = bytesToBase64(randomBytes(32));
		return success(pendingSalt);
	}

	async function saveCredential(
		account: string,
		password: string,
		unlockToken: string
	): Promise<AppResult<void>> {
		const trimmed = account.trim();
		if (!trimmed) {
			return failure(AppError.validation('请输入账号'));
		}

		if (!password && !unlockToken) {
			writeOnlineCredentialRecord(
				{
					mode: 'account_only',
					account: trimmed
				},
				storage
			);
			notifyState();
			return success(undefined);
		}

		if (!unlockToken) {
			return failure(AppError.validation('缺少凭据安全参数'));
		}

		try {
			const parsed = JSON.parse(unlockToken) as { prf?: string; credentialId?: string };
			if (!parsed.prf || !parsed.credentialId) {
				return failure(AppError.validation('无效的安全参数结构'));
			}

			const saltBase64 = pendingSalt || bytesToBase64(randomBytes(32));
			pendingSalt = null;

			const salt = base64ToBytes(saltBase64);
			const prfKey = base64ToBytes(parsed.prf);
			const aesKey = await deriveAesKey(prfKey, salt);

			const encoded = encodePasswordPayload(password);
			const encrypted = await encryptPayload(aesKey, encoded);

			writeOnlineCredentialRecord(
				{
					mode: 'prf',
					account: trimmed,
					credentialId: parsed.credentialId,
					salt: saltBase64,
					ciphertext: encrypted.ciphertext,
					iv: encrypted.iv
				},
				storage
			);

			notifyState();
			return success(undefined);
		} catch (error) {
			return failure(
				AppError.security(error instanceof Error ? error.message : '保存安全凭据失败')
			);
		}
	}

	async function prepareUnlock(): Promise<AppResult<string>> {
		const record = readOnlineCredentialRecord(storage);
		if (!record || record.mode !== 'prf' || !record.salt || !record.credentialId) {
			return failure(AppError.notFound('未找到保存的凭据'));
		}
		return success(
			JSON.stringify({
				salt: record.salt,
				credentialId: record.credentialId
			})
		);
	}

	async function unlockCredential(
		unlockToken: string
	): Promise<AppResult<{ account: string; password: string }>> {
		const record = readOnlineCredentialRecord(storage);
		if (!record || record.mode !== 'prf' || !record.ciphertext || !record.iv || !record.salt) {
			return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
		}

		try {
			const parsed = JSON.parse(unlockToken) as { prf?: string };
			if (!parsed.prf) {
				return failure(AppError.validation('无效的安全解锁参数'));
			}

			const salt = base64ToBytes(record.salt);
			const prfKey = base64ToBytes(parsed.prf);
			const aesKey = await deriveAesKey(prfKey, salt);

			const decrypted = await decryptPayload(aesKey, record.iv, record.ciphertext);
			const password = decodePasswordPayload(decrypted);

			return success({
				account: record.account,
				password
			});
		} catch {
			return failure(AppError.security(CREDENTIAL_INVALIDATED_MESSAGE));
		}
	}

	async function clearCredential(): Promise<AppResult<void>> {
		writeOnlineCredentialRecord(null, storage);
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('cqut_username');
			localStorage.removeItem('last_account');
		}
		notifyState();
		return success(undefined);
	}

	function subscribeSavedCredentialState(listener: (state: SavedCredentialState) => void) {
		listeners.add(listener);
		listener(buildState());
		return () => {
			listeners.delete(listener);
		};
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

export class WebAuthnSecureCredentialStore implements SecureCredentialStore {
	private impl: SecureCredentialStore;
	constructor(storage?: Storage | null) {
		this.impl = createWebAuthnSecureCredentialStore(storage);
	}
	subscribeSavedCredentialState(listener: (state: SavedCredentialState) => void) {
		return this.impl.subscribeSavedCredentialState(listener);
	}
	saveCredential(account: string, password: string, unlockToken: string) {
		return this.impl.saveCredential(account, password, unlockToken);
	}
	unlockCredential(unlockToken: string) {
		return this.impl.unlockCredential(unlockToken);
	}
	clearCredential() {
		return this.impl.clearCredential();
	}
	prepareSave() {
		return this.impl.prepareSave();
	}
	prepareUnlock() {
		return this.impl.prepareUnlock();
	}
}
