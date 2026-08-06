import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createWebAuthnSecureCredentialStore } from '$lib/client/webauthn-secure-credential-store';
import {
	readOnlineCredentialRecord,
	writeOnlineCredentialRecord
} from '$lib/storage/online-credential-record';
import * as prfSupport from '$lib/client/webauthn/prf-support';
import * as prfCrypto from '$lib/client/webauthn/prf-crypto';
import { bytesToBase64 } from '$lib/client/webauthn/binary';

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

describe('WebAuthnSecureCredentialStore', () => {
	let storage: Storage;

	beforeEach(() => {
		storage = createMemoryStorage();
		vi.restoreAllMocks();
	});

	it('saves account-only credential when PRF is unavailable', async () => {
		vi.spyOn(prfSupport, 'isPrfProtectionAvailable').mockResolvedValue(false);
		const store = createWebAuthnSecureCredentialStore(storage);

		const result = await store.saveCredential('20240101', '', '');
		expect(result.ok).toBe(true);

		const record = readOnlineCredentialRecord(storage);
		expect(record).toEqual({ mode: 'account_only', account: '20240101' });

		let observedAccount: string | null = null;
		store.subscribeSavedCredentialState((state) => {
			observedAccount = state.account;
		});
		expect(observedAccount).toBe('20240101');
	});

	it('saves encrypted credential when PRF unlock token is provided', async () => {
		vi.spyOn(prfSupport, 'isPrfProtectionAvailable').mockResolvedValue(true);
		vi.spyOn(prfCrypto, 'deriveAesKey').mockResolvedValue({} as CryptoKey);
		vi.spyOn(prfCrypto, 'encryptPayload').mockResolvedValue({
			iv: 'iv',
			ciphertext: 'ciphertext'
		});

		const store = createWebAuthnSecureCredentialStore(storage);
		const prepare = await store.prepareSave();
		expect(prepare.ok).toBe(true);

		const prfToken = bytesToBase64(new Uint8Array([1, 2, 3, 4]));
		const saveResult = await store.saveCredential(
			'20240101',
			'secret',
			JSON.stringify({ prf: prfToken, credentialId: 'credential-id' })
		);
		expect(saveResult.ok).toBe(true);

		const record = readOnlineCredentialRecord(storage);
		expect(record).toMatchObject({
			mode: 'prf',
			account: '20240101',
			credentialId: 'credential-id',
			iv: 'iv',
			ciphertext: 'ciphertext'
		});
	});

	it('unlocks encrypted credential with PRF token', async () => {
		writeOnlineCredentialRecord(
			{
				mode: 'prf',
				account: '20240101',
				credentialId: 'credential-id',
				salt: 'salt',
				iv: 'iv',
				ciphertext: 'ciphertext'
			},
			storage
		);

		vi.spyOn(prfSupport, 'isPrfProtectionAvailable').mockResolvedValue(true);
		vi.spyOn(prfCrypto, 'deriveAesKey').mockResolvedValue({} as CryptoKey);
		vi.spyOn(prfCrypto, 'decryptPayload').mockResolvedValue(new TextEncoder().encode('secret'));

		const store = createWebAuthnSecureCredentialStore(storage);
		const unlock = await store.unlockCredential(
			JSON.stringify({ prf: bytesToBase64(new Uint8Array([9, 8, 7])) })
		);

		expect(unlock.ok).toBe(true);
		if (unlock.ok) {
			expect(unlock.value).toEqual({ account: '20240101', password: 'secret' });
		}
	});

	it('clears stored credential', async () => {
		writeOnlineCredentialRecord({ mode: 'account_only', account: '20240101' }, storage);
		const store = createWebAuthnSecureCredentialStore(storage);

		const result = await store.clearCredential();
		expect(result.ok).toBe(true);
		expect(readOnlineCredentialRecord(storage)).toBeNull();
	});
});
