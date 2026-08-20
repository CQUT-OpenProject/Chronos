import { describe, expect, it } from 'vite-plus/test';
import { bytesToBase64, base64ToBytes, randomBytes } from '$lib/client/webauthn/binary';
import { deriveAesKey, decryptPayload, encryptPayload } from '$lib/client/webauthn/prf-crypto';
import {
	decodePasswordPayload,
	encodePasswordPayload
} from '$lib/client/webauthn/credential-payload';

describe('prf-crypto', () => {
	it('round-trips password payload with HKDF + AES-GCM', async () => {
		const prfOutput = randomBytes(32);
		const salt = randomBytes(32);
		const password = 'test-password-123';

		const aesKey = await deriveAesKey(prfOutput, salt);
		const encrypted = await encryptPayload(aesKey, encodePasswordPayload(password));
		const decrypted = await decryptPayload(aesKey, encrypted.iv, encrypted.ciphertext);

		expect(decodePasswordPayload(decrypted)).toBe(password);
	});

	it('uses different ciphertext for different salts', async () => {
		const prfOutput = randomBytes(32);
		const payload = encodePasswordPayload('same-password');

		const first = await encryptPayload(await deriveAesKey(prfOutput, randomBytes(32)), payload);
		const second = await encryptPayload(await deriveAesKey(prfOutput, randomBytes(32)), payload);

		expect(first.ciphertext).not.toBe(second.ciphertext);
	});

	it('base64 helpers round-trip bytes', () => {
		const bytes = randomBytes(16);
		expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
	});
});
