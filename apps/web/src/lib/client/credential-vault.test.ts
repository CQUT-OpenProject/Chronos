import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { CQUT_PASSWORD_SECRET_KEY, createCredentialVault } from '$lib/client/credential-vault';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
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

function createMemoryStorage(): Storage {
	const map = new Map<string, string>();
	return {
		getItem: (key: string) => map.get(key) ?? null,
		setItem: (key: string, value: string) => map.set(key, value),
		removeItem: (key: string) => map.delete(key),
		clear: () => map.clear(),
		key: (index: number) => [...map.keys()][index] ?? null,
		get length() {
			return map.size;
		}
	} as Storage;
}

describe('CredentialVault', () => {
	let storage: Storage;
	let pluginRecord: CqutCredentialRecord | null = null;

	beforeEach(() => {
		storage = createMemoryStorage();
		pluginRecord = null;
		mockCredentialEnvironment.prfAvailable = false;
		mockCredentialEnvironment.ready = true;
		mockCredentialEnvironment.init.mockClear();
		mockCredentialEnvironment.subscribe.mockClear();
	});

	function createVault(vaultPort = new MemoryVaultProvider()) {
		return createCredentialVault({
			storage,
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

	it('falls back to legacy online credential record', async () => {
		const vaultPort = new MemoryVaultProvider();
		await vaultPort.storeSecret(CQUT_PASSWORD_SECRET_KEY, 'secret');
		writeOnlineCredentialRecord({ mode: 'vault', account: '20240101' }, storage);
		const vault = createVault(vaultPort);

		const unlock = await vault.unlock();
		expect(unlock.ok).toBe(true);
	});

	it('clears stored credential and vault secret', async () => {
		const vaultPort = new MemoryVaultProvider();
		await vaultPort.storeSecret(CQUT_PASSWORD_SECRET_KEY, 'secret');
		pluginRecord = { mode: 'vault', account: '20240101' };
		writeOnlineCredentialRecord({ mode: 'vault', account: '20240101' }, storage);
		const vault = createVault(vaultPort);

		const result = await vault.clear();
		expect(result.ok).toBe(true);
		expect(readOnlineCredentialRecord(storage)).toBeNull();
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
