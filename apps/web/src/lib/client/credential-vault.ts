import type { IVaultService } from '@chronos/core';
import type { SavedCredentialState } from '$lib/models/auth';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import { credentialEnvironment } from './credential-environment.svelte';

const CREDENTIAL_INVALIDATED_MESSAGE = '已保存凭据已失效，请重新录入账号和密码';
const PASSWORD_SECRET_KEY = 'cqut-online-password';

export interface CredentialVault {
	readonly state: SavedCredentialState;
	save(account: string, password?: string): Promise<AppResult<void>>;
	unlock(): Promise<AppResult<{ account: string; password: string }>>;
	clear(): Promise<AppResult<void>>;
	subscribe(listener: (state: SavedCredentialState) => void): () => void;
}

export interface CredentialVaultDeps {
	vault?: IVaultService;
	storage?: Storage | null;
}

export function createCredentialVault(deps: CredentialVaultDeps = {}): CredentialVault {
	const storage = deps.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
	const vault = deps.vault;
	const listeners = new Set<(state: SavedCredentialState) => void>();

	function buildState(): SavedCredentialState {
		const record = readOnlineCredentialRecord(storage);
		const savedAccount =
			record?.account ||
			(typeof localStorage !== 'undefined'
				? localStorage.getItem('cqut_username') || localStorage.getItem('last_account')
				: null);

		const hasSavedCredential = Boolean(record?.account || savedAccount);

		return {
			account: savedAccount ?? null,
			hasSavedCredential,
			protectionAvailable: credentialEnvironment.prfAvailable,
			capabilitiesReady: credentialEnvironment.ready,
			savedMode: record?.mode === 'vault' ? 'vault' : savedAccount ? 'account_only' : null
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

		const canStoreSecret = Boolean(password?.trim() && vault && (await vault.isSupported()));
		if (!canStoreSecret) {
			await vault?.removeSecret(PASSWORD_SECRET_KEY);
			writeOnlineCredentialRecord({ mode: 'account_only', account: trimmed }, storage);
			notifyState();
			return success(undefined);
		}

		try {
			await vault!.storeSecret(PASSWORD_SECRET_KEY, password!.trim());
			writeOnlineCredentialRecord({ mode: 'vault', account: trimmed }, storage);
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
		if (!record || record.mode !== 'vault' || !vault) {
			return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
		}

		try {
			const password = await vault.getSecret(PASSWORD_SECRET_KEY);
			if (!password) {
				return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
			}
			return success({
				account: record.account,
				password
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : '已取消设备验证';
			if (message === 'WebAuthn verification was cancelled') {
				return failure(AppError.security('已取消设备验证'));
			}
			return failure(AppError.security(message));
		}
	}

	async function clear(): Promise<AppResult<void>> {
		await vault?.removeSecret(PASSWORD_SECRET_KEY);
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
