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
import {
	createPrfCredential,
	getPrfOutput,
	WebAuthnCredentialUnavailableError
} from './webauthn/prf-coordinator';

const CREDENTIAL_INVALIDATED_MESSAGE = '已保存凭据已失效，请重新录入账号和密码';

export interface CredentialVault {
	readonly state: SavedCredentialState;
	save(account: string, password?: string): Promise<AppResult<void>>;
	unlock(): Promise<AppResult<{ account: string; password: string }>>;
	clear(): Promise<AppResult<void>>;
	subscribe(listener: (state: SavedCredentialState) => void): () => void;
}

export interface CredentialVaultDeps {
	storage?: Storage | null;
	createPrf?: typeof createPrfCredential;
	getPrf?: typeof getPrfOutput;
}

export function createCredentialVault(deps: CredentialVaultDeps = {}): CredentialVault {
	const storage = deps.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
	const createPrf = deps.createPrf ?? createPrfCredential;
	const getPrf = deps.getPrf ?? getPrfOutput;
	const listeners = new Set<(state: SavedCredentialState) => void>();

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

	async function save(account: string, password?: string): Promise<AppResult<void>> {
		const trimmed = account.trim();
		if (!trimmed) {
			return failure(AppError.validation('请输入账号'));
		}

		if (!password || !password.trim() || !credentialEnvironment.prfAvailable) {
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

		try {
			const saltBytes = randomBytes(32);
			const saltBase64 = bytesToBase64(saltBytes);

			const { credentialId, prfOutput } = await createPrf(saltBytes);
			const prfKey = base64ToBytes(prfOutput);
			const aesKey = await deriveAesKey(prfKey, saltBytes);

			const encoded = encodePasswordPayload(password);
			const encrypted = await encryptPayload(aesKey, encoded);

			writeOnlineCredentialRecord(
				{
					mode: 'prf',
					account: trimmed,
					credentialId,
					salt: saltBase64,
					ciphertext: encrypted.ciphertext,
					iv: encrypted.iv
				},
				storage
			);

			notifyState();
			return success(undefined);
		} catch (error) {
			const message = error instanceof Error ? error.message : '保存安全凭据失败';
			if (
				message === 'WebAuthn verification was cancelled' ||
				message === 'WebAuthn registration was cancelled'
			) {
				return failure(AppError.security('已取消设备验证'));
			}
			return failure(AppError.security(message));
		}
	}

	async function unlock(): Promise<AppResult<{ account: string; password: string }>> {
		const record = readOnlineCredentialRecord(storage);
		if (
			!record ||
			record.mode !== 'prf' ||
			!record.ciphertext ||
			!record.iv ||
			!record.salt ||
			!record.credentialId
		) {
			return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
		}

		try {
			const prfOutput = await getPrf(record.salt, record.credentialId);
			const salt = base64ToBytes(record.salt);
			const prfKey = base64ToBytes(prfOutput);
			const aesKey = await deriveAesKey(prfKey, salt);

			const decrypted = await decryptPayload(aesKey, record.iv, record.ciphertext);
			const password = decodePasswordPayload(decrypted);

			return success({
				account: record.account,
				password
			});
		} catch (error) {
			if (error instanceof WebAuthnCredentialUnavailableError) {
				await clear();
				return failure(AppError.security(CREDENTIAL_INVALIDATED_MESSAGE));
			}
			const message = error instanceof Error ? error.message : '已取消设备验证';
			if (message === 'WebAuthn verification was cancelled') {
				return failure(AppError.security('已取消设备验证'));
			}
			return failure(AppError.security(message));
		}
	}

	async function clear(): Promise<AppResult<void>> {
		writeOnlineCredentialRecord(null, storage);
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('cqut_username');
			localStorage.removeItem('last_account');
		}
		notifyState();
		return success(undefined);
	}

	function subscribe(listener: (state: SavedCredentialState) => void) {
		listeners.add(listener);
		listener(buildState());
		return () => {
			listeners.delete(listener);
		};
	}

	return {
		get state() {
			return buildState();
		},
		save,
		unlock,
		clear,
		subscribe
	};
}
