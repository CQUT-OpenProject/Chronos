import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { isPrfProtectionAvailable } from './prf-support';

describe('isPrfProtectionAvailable', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.stubGlobal('window', {});
	});

	it('returns true when UV platform auth and extension:prf are available', async () => {
		const publicKeyCredential = {
			isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
			getClientCapabilities: vi.fn().mockResolvedValue({ 'extension:prf': true })
		};
		vi.stubGlobal('PublicKeyCredential', publicKeyCredential);
		vi.stubGlobal('window', { PublicKeyCredential: publicKeyCredential });

		await expect(isPrfProtectionAvailable()).resolves.toBe(true);
	});

	it('returns false when extension:prf is missing or false', async () => {
		const publicKeyCredential = {
			isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(true),
			getClientCapabilities: vi.fn().mockResolvedValue({ 'extension:prf': false })
		};
		vi.stubGlobal('PublicKeyCredential', publicKeyCredential);
		vi.stubGlobal('window', { PublicKeyCredential: publicKeyCredential });

		await expect(isPrfProtectionAvailable()).resolves.toBe(false);
	});

	it('returns false when UV platform authenticator is unavailable', async () => {
		const publicKeyCredential = {
			isUserVerifyingPlatformAuthenticatorAvailable: vi.fn().mockResolvedValue(false),
			getClientCapabilities: vi.fn().mockResolvedValue({ 'extension:prf': true })
		};
		vi.stubGlobal('PublicKeyCredential', publicKeyCredential);
		vi.stubGlobal('window', { PublicKeyCredential: publicKeyCredential });

		await expect(isPrfProtectionAvailable()).resolves.toBe(false);
	});
});
