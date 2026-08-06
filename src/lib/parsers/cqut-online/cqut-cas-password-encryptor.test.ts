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
});
