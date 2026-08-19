import { bytesToBase64, base64ToBytes, randomBytes } from './binary';

const HKDF_INFO = new TextEncoder().encode('chronos-online-credential');
const GCM_IV_LENGTH = 12;

export async function deriveAesKey(prfOutput: Uint8Array, salt: Uint8Array): Promise<CryptoKey> {
	const baseKey = await crypto.subtle.importKey('raw', prfOutput as BufferSource, 'HKDF', false, [
		'deriveKey'
	]);
	return crypto.subtle.deriveKey(
		{
			name: 'HKDF',
			hash: 'SHA-256',
			salt: salt as BufferSource,
			info: HKDF_INFO
		},
		baseKey,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

export async function encryptPayload(
	aesKey: CryptoKey,
	payload: Uint8Array
): Promise<{ iv: string; ciphertext: string }> {
	const iv = randomBytes(GCM_IV_LENGTH);
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv: iv as BufferSource },
		aesKey,
		payload as BufferSource
	);
	return {
		iv: bytesToBase64(iv),
		ciphertext: bytesToBase64(new Uint8Array(encrypted))
	};
}

export async function decryptPayload(
	aesKey: CryptoKey,
	ivBase64: string,
	ciphertextBase64: string
): Promise<Uint8Array> {
	const iv = base64ToBytes(ivBase64);
	const ciphertext = base64ToBytes(ciphertextBase64);
	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv: iv as BufferSource },
		aesKey,
		ciphertext as BufferSource
	);
	return new Uint8Array(decrypted);
}
