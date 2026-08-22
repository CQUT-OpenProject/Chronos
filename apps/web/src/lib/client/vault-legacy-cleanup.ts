import type { ChronosEngine } from '@chronos/core';

const VAULT_STORAGE_PREFIX = 'chronos_vault_enc:';
const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';
const LEGACY_CREDENTIAL_RECORD_KEY = 'credential-record';

export function clearLegacyVaultArtifacts(storage: Storage | null | undefined): void {
	if (!storage) return;
	const keysToRemove: string[] = [];
	for (let i = 0; i < storage.length; i++) {
		const key = storage.key(i);
		if (key?.startsWith(VAULT_STORAGE_PREFIX)) {
			keysToRemove.push(key);
		}
	}
	for (const key of keysToRemove) {
		storage.removeItem(key);
	}
}

export async function clearLegacyPluginCredentials(engine: ChronosEngine): Promise<void> {
	try {
		await engine.storage.deletePluginData(SOURCE_CQUT_PLUGIN_ID, LEGACY_CREDENTIAL_RECORD_KEY);
	} catch {
		// Best-effort cleanup for retired credential persistence
	}
}

export async function runVaultLegacyCleanup(engine: ChronosEngine): Promise<void> {
	clearLegacyVaultArtifacts(typeof localStorage !== 'undefined' ? localStorage : null);
	await clearLegacyPluginCredentials(engine);
}
