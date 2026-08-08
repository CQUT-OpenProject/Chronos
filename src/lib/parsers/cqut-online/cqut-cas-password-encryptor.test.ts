import { describe, expect, it } from 'vite-plus/test';
import { encryptCasPassword } from '$lib/client/cqut-cas-password-encryptor';

describe('encryptCasPassword', () => {
	it('returns empty string for blank password', () => {
		expect(encryptCasPassword('')).toBe('');
		expect(encryptCasPassword('   ')).toBe('');
	});

	it('returns encoded payload for non blank password', () => {
		const encrypted = encryptCasPassword('123456');
		expect(encrypted.length).toBeGreaterThan(0);
		expect(encrypted.includes('%') || encrypted.includes('%5B')).toBe(true);
	});

	it('splits long passwords into 30-char encrypted chunks', () => {
		const singleChunk = JSON.parse(
			decodeURIComponent(encryptCasPassword('a'.repeat(30)))
		) as string[];
		expect(singleChunk).toHaveLength(1);

		const twoChunks = JSON.parse(
			decodeURIComponent(encryptCasPassword('a'.repeat(60)))
		) as string[];
		expect(twoChunks).toHaveLength(2);

		const threeChunks = JSON.parse(
			decodeURIComponent(encryptCasPassword('a'.repeat(61)))
		) as string[];
		expect(threeChunks).toHaveLength(3);
	});
});
