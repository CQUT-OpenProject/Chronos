import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { CQUT_PASSWORD_SECRET_KEY, createCredentialVault } from '$lib/client/credential-vault';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import { MemoryVaultProvider } from '$lib/providers/memory-vault';

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

	beforeEach(() => {
		storage = createMemoryStorage();
		mockCredentialEnvironment.prfAvailable = false;
		mockCredentialEnvironment.ready = true;
		mockCredentialEnvironment.init.mockClear();
		mockCredentialEnvironment.subscribe.mockClear();
	});

	it('saves account-only credential when vault cannot store secrets', async () => {
		const vaultPort = new MemoryVaultProvider();
		vi.spyOn(vaultPort, 'isSupported').mockResolvedValue(false);
		const vault = createCredentialVault({ storage, vault: vaultPort });

		const result = await vault.save('20240101', 'password123');
		expect(result.ok).toBe(true);

		const record = readOnlineCredentialRecord(storage);
		expect(record).toEqual({ mode: 'account_only', account: '20240101' });
		expect(await vaultPort.getSecret(CQUT_PASSWORD_SECRET_KEY)).toBeNull();
	});

	it('stores password on IVaultService when supported', async () => {
		const vaultPort = new MemoryVaultProvider();
		const vault = createCredentialVault({ storage, vault: vaultPort });

		const saveResult = await vault.save('20240101', 'secret');
		expect(saveResult.ok).toBe(true);
		expect(readOnlineCredentialRecord(storage)).toEqual({ mode: 'vault', account: '20240101' });
		expect(await vaultPort.getSecret(CQUT_PASSWORD_SECRET_KEY)).toBe('secret');

		const unlock = await vault.unlock();
		expect(unlock.ok).toBe(true);
		if (unlock.ok) {
			expect(unlock.value).toEqual({ account: '20240101', password: 'secret' });
		}
	});

	it('clears stored credential and vault secret', async () => {
		const vaultPort = new MemoryVaultProvider();
		const vault = createCredentialVault({ storage, vault: vaultPort });
		await vault.save('20240101', 'secret');

		const result = await vault.clear();
		expect(result.ok).toBe(true);
		expect(readOnlineCredentialRecord(storage)).toBeNull();
		expect(await vaultPort.getSecret(CQUT_PASSWORD_SECRET_KEY)).toBeNull();
	});

	it('treats leftover account-only records as unlock failures', async () => {
		writeOnlineCredentialRecord({ mode: 'account_only', account: '20240101' }, storage);
		const vault = createCredentialVault({ storage, vault: new MemoryVaultProvider() });
		const unlock = await vault.unlock();
		expect(unlock.ok).toBe(false);
	});
});
