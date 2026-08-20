import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import type { IVaultService } from '@chronos/core';

const MIGRATION_FLAG_KEY = 'chronos:credential-migration-v1';
const LEGACY_PASSWORD_SECRET_KEY = 'cqut-online-password';
const LEGACY_USERNAME_KEY = 'cqut_username';
const LEGACY_LAST_ACCOUNT_KEY = 'last_account';
const PLUGIN_USERNAME_KEY = 'source-cqut:username';
const CQUT_PASSWORD_SECRET_KEY = 'source-cqut:password';

export async function runCredentialMigration(
	storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null,
	vault?: IVaultService
): Promise<void> {
	if (!storage || storage.getItem(MIGRATION_FLAG_KEY) === 'done') {
		return;
	}

	const existing = readOnlineCredentialRecord(storage);
	if (!existing) {
		const legacyAccount =
			storage.getItem(PLUGIN_USERNAME_KEY) ||
			storage.getItem(LEGACY_USERNAME_KEY) ||
			storage.getItem(LEGACY_LAST_ACCOUNT_KEY);
		if (legacyAccount?.trim()) {
			writeOnlineCredentialRecord({ mode: 'account_only', account: legacyAccount.trim() }, storage);
		}
	}

	if (vault && (await vault.isSupported())) {
		const legacyPassword = await vault.getSecret(LEGACY_PASSWORD_SECRET_KEY);
		if (legacyPassword) {
			await vault.storeSecret(CQUT_PASSWORD_SECRET_KEY, legacyPassword);
			await vault.removeSecret(LEGACY_PASSWORD_SECRET_KEY);
			const account =
				readOnlineCredentialRecord(storage)?.account ||
				storage.getItem(PLUGIN_USERNAME_KEY) ||
				storage.getItem(LEGACY_USERNAME_KEY);
			if (account) {
				writeOnlineCredentialRecord({ mode: 'vault', account }, storage);
			}
		}
	}

	const record = readOnlineCredentialRecord(storage);
	if (record?.mode === 'prf') {
		writeOnlineCredentialRecord(null, storage);
	}

	storage.removeItem(LEGACY_USERNAME_KEY);
	storage.removeItem(LEGACY_LAST_ACCOUNT_KEY);
	storage.setItem(MIGRATION_FLAG_KEY, 'done');
}
