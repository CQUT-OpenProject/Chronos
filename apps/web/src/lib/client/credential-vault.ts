import type { IVaultService } from '@chronos/core';
import {
	CQUT_PASSWORD_SECRET_KEY,
	SOURCE_CQUT_PLUGIN_ID,
	type CqutCredentialRecord
} from '@chronos/plugin-source-cqut';
import type { SavedCredentialState } from '$lib/models/auth';
import { AppError } from '$lib/domain/result/app-error';
import { failure, success, type AppResult } from '$lib/domain/result/app-result';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord,
	type OnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import { credentialEnvironment } from './credential-environment.svelte';

export { CQUT_PASSWORD_SECRET_KEY, SOURCE_CQUT_PLUGIN_ID };

const CREDENTIAL_INVALIDATED_MESSAGE = '已保存凭据已失效，请重新录入账号和密码';
const LEGACY_USERNAME_KEY = `${SOURCE_CQUT_PLUGIN_ID}:username`;

export interface CredentialVault {
	readonly state: SavedCredentialState;
	unlock(): Promise<AppResult<{ account: string; password: string }>>;
	clear(): Promise<AppResult<void>>;
	subscribe(listener: (state: SavedCredentialState) => void): () => void;
}

export interface CredentialVaultDeps {
	vault?: IVaultService;
	storage?: Storage | null;
	readPluginCredentialRecord?: () => Promise<CqutCredentialRecord | null>;
	clearPluginCredentialRecord?: () => Promise<void>;
}

function mapLegacyRecord(record: OnlineCredentialRecord | null): CqutCredentialRecord | null {
	if (!record) return null;
	if (record.mode === 'vault' || record.mode === 'account_only') {
		return { mode: record.mode, account: record.account };
	}
	return null;
}

export function createCredentialVault(deps: CredentialVaultDeps = {}): CredentialVault {
	const storage = deps.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
	const vault = deps.vault;
	const listeners = new Set<(state: SavedCredentialState) => void>();

	async function resolveCredentialRecord(): Promise<CqutCredentialRecord | null> {
		const pluginRecord = (await deps.readPluginCredentialRecord?.()) ?? null;
		if (pluginRecord) return pluginRecord;
		return mapLegacyRecord(readOnlineCredentialRecord(storage));
	}

	function buildState(record: CqutCredentialRecord | null): SavedCredentialState {
		const legacyAccount =
			record?.account ||
			(typeof localStorage !== 'undefined' ? localStorage.getItem(LEGACY_USERNAME_KEY) : null);

		const hasSavedCredential = Boolean(record?.account || legacyAccount);

		return {
			account: legacyAccount ?? null,
			hasSavedCredential,
			protectionAvailable: credentialEnvironment.prfAvailable,
			capabilitiesReady: credentialEnvironment.ready,
			savedMode: record?.mode === 'vault' ? 'vault' : legacyAccount ? 'account_only' : null
		};
	}

	function notifyState(record: CqutCredentialRecord | null) {
		const nextState = buildState(record);
		for (const listener of listeners) {
			listener(nextState);
		}
	}

	async function readStoredPassword(): Promise<string | null> {
		if (!vault) return null;
		return vault.getSecret(CQUT_PASSWORD_SECRET_KEY);
	}

	async function unlock(): Promise<AppResult<{ account: string; password: string }>> {
		const record = await resolveCredentialRecord();
		if (!record || record.mode !== 'vault' || !vault) {
			return failure(AppError.notFound(CREDENTIAL_INVALIDATED_MESSAGE));
		}

		try {
			const password = await readStoredPassword();
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
		await vault?.removeSecret(CQUT_PASSWORD_SECRET_KEY);
		writeOnlineCredentialRecord(null, storage);
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(LEGACY_USERNAME_KEY);
		}
		await deps.clearPluginCredentialRecord?.();
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
