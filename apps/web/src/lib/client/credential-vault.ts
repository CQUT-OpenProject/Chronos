import type { IStorageService, IVaultService } from '@chronos/core';
import type { SavedCredentialState } from '$lib/models/auth';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import { credentialEnvironment } from './credential-environment.svelte';

/** CQUT 凭据常量 — 宿主侧本地定义，避免硬依赖 @chronos/plugin-source-cqut */
export const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';
export const CQUT_PASSWORD_SECRET_KEY = `${SOURCE_CQUT_PLUGIN_ID}:password`;
export const CQUT_CREDENTIAL_RECORD_KEY = 'credential-record';

export type PluginCredentialRecord =
	| { mode: 'vault'; account: string }
	| { mode: 'account_only'; account: string };

const CREDENTIAL_INVALIDATED_MESSAGE = '已保存凭据已失效，请重新录入账号和密码';

export interface CredentialVault {
	readonly state: SavedCredentialState;
	unlock(): Promise<AppResult<{ account: string; password: string }>>;
	clear(): Promise<AppResult<void>>;
	subscribe(listener: (state: SavedCredentialState) => void): () => void;
}

export interface GenericCredentialVaultDeps {
	vault?: IVaultService;
	storage?: IStorageService;
	pluginId: string;
	recordKey: string;
	vaultKey: string;
}

export function createGenericCredentialVault(deps: GenericCredentialVaultDeps): CredentialVault {
	const { vault, storage, pluginId, recordKey, vaultKey } = deps;
	const listeners = new Set<(state: SavedCredentialState) => void>();

	async function resolveCredentialRecord(): Promise<PluginCredentialRecord | null> {
		if (!storage) return null;
		return (await storage.getPluginData<PluginCredentialRecord>(pluginId, recordKey)) ?? null;
	}

	function buildState(record: PluginCredentialRecord | null): SavedCredentialState {
		const hasSavedCredential = Boolean(record?.account);
		return {
			account: record?.account ?? null,
			hasSavedCredential,
			protectionAvailable: credentialEnvironment.prfAvailable,
			capabilitiesReady: credentialEnvironment.ready,
			savedMode: record?.mode === 'vault' ? 'vault' : record ? 'account_only' : null
		};
	}

	function notifyState(record: PluginCredentialRecord | null) {
		const nextState = buildState(record);
		for (const listener of listeners) listener(nextState);
	}

	async function readStoredPassword(): Promise<string | null> {
		if (!vault) return null;
		return vault.getSecret(vaultKey);
	}

	async function unlock(): Promise<AppResult<{ account: string; password: string }>> {
		const record = await resolveCredentialRecord();
		if (!record || record.mode !== 'vault' || !vault) {
			return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
		}
		try {
			const password = await readStoredPassword();
			if (!password) return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
			return success({ account: record.account, password });
		} catch (error) {
			const message = error instanceof Error ? error.message : '已取消设备验证';
			if (message === 'WebAuthn verification was cancelled')
				return failure(AppError.security('已取消设备验证'));
			return failure(AppError.security(message));
		}
	}

	async function clear(): Promise<AppResult<void>> {
		await vault?.removeSecret(vaultKey);
		if (storage) await storage.deletePluginData(pluginId, recordKey);
		notifyState(null);
		return success(undefined);
	}

	function subscribe(listener: (state: SavedCredentialState) => void) {
		listeners.add(listener);
		void resolveCredentialRecord().then((record) => listener(buildState(record)));
		return () => {
			listeners.delete(listener);
		};
	}

	return {
		get state() {
			return buildState(null);
		},
		unlock,
		clear,
		subscribe
	};
}
