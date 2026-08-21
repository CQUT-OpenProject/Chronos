import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { CQUT_PASSWORD_SECRET_KEY, createCredentialVault } from '$lib/client/credential-vault';
import { MemoryVaultProvider } from '$lib/providers/memory-vault';
import type { CqutCredentialRecord } from '@chronos/plugin-source-cqut';

const mockCredentialEnvironment = vi.hoisted(() => ({
	prfAvailable: false,
	ready: true,
	init: vi.fn(async () => {}),
	subscribe: vi.fn((listener: () => void) => {
		listener();
		return () => {};
	})
}));

vi.mock('$lib/client/credential-environment.svelte', () => ({
	credentialEnvironment: mockCredentialEnvironment
}));

describe('CredentialVault', () => {
	let pluginRecord: CqutCredentialRecord | null = null;

	beforeEach(() => {
		pluginRecord = null;
		mockCredentialEnvironment.prfAvailable = false;
		mockCredentialEnvironment.ready = true;
		mockCredentialEnvironment.init.mockClear();
		mockCredentialEnvironment.subscribe.mockClear();
	});

	function createVault(vaultPort = new MemoryVaultProvider()) {
		return createCredentialVault({
			vault: vaultPort,
			readPluginCredentialRecord: async () => pluginRecord,
			clearPluginCredentialRecord: async () => {
				pluginRecord = null;
			}
		});
	}

	it('reads vault-backed credentials from plugin storage', async () => {
		const vaultPort = new MemoryVaultProvider();
		await vaultPort.storeSecret(CQUT_PASSWORD_SECRET_KEY, 'secret');
		pluginRecord = { mode: 'vault', account: '20240101' };
		const vault = createVault(vaultPort);

		const unlock = await vault.unlock();
		expect(unlock.ok).toBe(true);
		if (unlock.ok) {
			expect(unlock.value).toEqual({ account: '20240101', password: 'secret' });
		}
	});

	it('clears stored credential and vault secret', async () => {
		const vaultPort = new MemoryVaultProvider();
		await vaultPort.storeSecret(CQUT_PASSWORD_SECRET_KEY, 'secret');
		pluginRecord = { mode: 'vault', account: '20240101' };
		const vault = createVault(vaultPort);

		const result = await vault.clear();
		expect(result.ok).toBe(true);
		expect(pluginRecord).toBeNull();
		expect(await vaultPort.getSecret(CQUT_PASSWORD_SECRET_KEY)).toBeNull();
	});

	it('treats leftover account-only records as unlock failures', async () => {
		pluginRecord = { mode: 'account_only', account: '20240101' };
		const vault = createVault(new MemoryVaultProvider());
		const unlock = await vault.unlock();
		expect(unlock.ok).toBe(false);
	});
});
