import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createCredentialVault } from '$lib/client/credential-vault';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import * as prfCrypto from '$lib/client/webauthn/prf-crypto';
import { bytesToBase64 } from '$lib/client/webauthn/binary';
import { WebAuthnCredentialUnavailableError } from '$lib/client/webauthn/prf-coordinator';

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
		vi.restoreAllMocks();
	});

	it('saves account-only credential when PRF is unavailable', async () => {
		mockCredentialEnvironment.prfAvailable = false;
		const vault = createCredentialVault({ storage });

		const result = await vault.save('20240101', 'password123');
		expect(result.ok).toBe(true);

		const record = readOnlineCredentialRecord(storage);
		expect(record).toEqual({ mode: 'account_only', account: '20240101' });

		let observedAccount: string | null = null;
		vault.subscribe((state) => {
			observedAccount = state.account;
		});
		expect(observedAccount).toBe('20240101');
	});

	it('saves encrypted credential when PRF is available', async () => {
		mockCredentialEnvironment.prfAvailable = true;
		vi.spyOn(prfCrypto, 'deriveAesKey').mockResolvedValue({} as CryptoKey);
		vi.spyOn(prfCrypto, 'encryptPayload').mockResolvedValue({
			iv: 'iv',
			ciphertext: 'ciphertext'
		});

		const createPrf = vi.fn().mockResolvedValue({
			credentialId: 'cred-123',
			prfOutput: bytesToBase64(new Uint8Array([1, 2, 3, 4]))
		});

		const vault = createCredentialVault({ storage, createPrf });
		const saveResult = await vault.save('20240101', 'secret');
		expect(saveResult.ok).toBe(true);

		const record = readOnlineCredentialRecord(storage);
		expect(record).toMatchObject({
			mode: 'prf',
			account: '20240101',
			credentialId: 'cred-123',
			iv: 'iv',
			ciphertext: 'ciphertext'
		});
	});

	it('unlocks encrypted credential with PRF output', async () => {
		writeOnlineCredentialRecord(
			{
				mode: 'prf',
				account: '20240101',
				credentialId: 'cred-123',
				salt: bytesToBase64(new Uint8Array(32)),
				iv: 'iv',
				ciphertext: 'ciphertext'
			},
			storage
		);

		mockCredentialEnvironment.prfAvailable = true;
		vi.spyOn(prfCrypto, 'deriveAesKey').mockResolvedValue({} as CryptoKey);
		vi.spyOn(prfCrypto, 'decryptPayload').mockResolvedValue(new TextEncoder().encode('secret'));

		const getPrf = vi.fn().mockResolvedValue(bytesToBase64(new Uint8Array([9, 8, 7])));

		const vault = createCredentialVault({ storage, getPrf });
		const unlock = await vault.unlock();

		expect(unlock.ok).toBe(true);
		if (unlock.ok) {
			expect(unlock.value).toEqual({ account: '20240101', password: 'secret' });
		}
	});

	it('automatically clears credential when WebAuthn credential is unavailable', async () => {
		writeOnlineCredentialRecord(
			{
				mode: 'prf',
				account: '20240101',
				credentialId: 'cred-invalid',
				salt: bytesToBase64(new Uint8Array(32)),
				iv: 'iv',
				ciphertext: 'ciphertext'
			},
			storage
		);

		const getPrf = vi.fn().mockRejectedValue(new WebAuthnCredentialUnavailableError());

		const vault = createCredentialVault({ storage, getPrf });
		const unlock = await vault.unlock();

		expect(unlock.ok).toBe(false);
		expect(readOnlineCredentialRecord(storage)).toBeNull();
	});

	it('clears stored credential', async () => {
		writeOnlineCredentialRecord({ mode: 'account_only', account: '20240101' }, storage);
		const vault = createCredentialVault({ storage });

		const result = await vault.clear();
		expect(result.ok).toBe(true);
		expect(readOnlineCredentialRecord(storage)).toBeNull();
	});
});
