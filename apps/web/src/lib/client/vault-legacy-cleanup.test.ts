import { describe, expect, it, vi } from 'vite-plus/test';
import {
	clearLegacyVaultArtifacts,
	clearLegacyPluginCredentials,
	runVaultLegacyCleanup
} from './vault-legacy-cleanup';

describe('vault-legacy-cleanup', () => {
	it('removes chronos_vault_enc keys from localStorage', () => {
		const storage = {
			length: 3,
			key: (index: number) => ['chronos_vault_enc:pw', 'theme', 'other'][index] ?? null,
			removeItem: vi.fn()
		};

		clearLegacyVaultArtifacts(storage as unknown as Storage);

		expect(storage.removeItem).toHaveBeenCalledWith('chronos_vault_enc:pw');
		expect(storage.removeItem).toHaveBeenCalledTimes(1);
	});

	it('deletes legacy source-cqut credential record via engine storage', async () => {
		const deletePluginData = vi.fn().mockResolvedValue(undefined);
		const engine = {
			storage: { deletePluginData }
		} as never;

		await clearLegacyPluginCredentials(engine);

		expect(deletePluginData).toHaveBeenCalledWith('source-cqut', 'credential-record');
	});

	it('runs both local and plugin cleanup', async () => {
		const storage = {
			length: 1,
			key: () => 'chronos_vault_enc:legacy',
			removeItem: vi.fn()
		};
		vi.stubGlobal('localStorage', storage);
		const deletePluginData = vi.fn().mockResolvedValue(undefined);
		const engine = {
			storage: { deletePluginData }
		} as never;

		await runVaultLegacyCleanup(engine);

		expect(storage.removeItem).toHaveBeenCalledWith('chronos_vault_enc:legacy');
		expect(deletePluginData).toHaveBeenCalledWith('source-cqut', 'credential-record');
		vi.unstubAllGlobals();
	});
});
