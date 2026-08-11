import { describe, expect, it } from 'vite-plus/test';
import { encryptCasPassword } from '$lib/client/cqut-cas-password-encryptor';

describe('encryptCasPassword', () => {
	it('returns empty string for blank password', async () => {
		await expect(encryptCasPassword('')).resolves.toBe('');
		await expect(encryptCasPassword('   ')).resolves.toBe('');
	});

	it('returns encoded payload for non blank password', async () => {
		const encrypted = await encryptCasPassword('123456');
		expect(encrypted.length).toBeGreaterThan(0);
		expect(encrypted.includes('%') || encrypted.includes('%5B')).toBe(true);
	});

	it('splits long passwords into 30-char encrypted chunks', async () => {
		const singleChunk = JSON.parse(
			decodeURIComponent(await encryptCasPassword('a'.repeat(30)))
		) as string[];
		expect(singleChunk).toHaveLength(1);

		const twoChunks = JSON.parse(
			decodeURIComponent(await encryptCasPassword('a'.repeat(60)))
		) as string[];
		expect(twoChunks).toHaveLength(2);

		const threeChunks = JSON.parse(
			decodeURIComponent(await encryptCasPassword('a'.repeat(61)))
		) as string[];
		expect(threeChunks).toHaveLength(3);
	});
});
