import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { CredentialEnvironmentController } from '$lib/client/credential-environment.svelte';
import * as prfSupport from '$lib/client/webauthn/prf-support';

describe('CredentialEnvironmentController', () => {
	beforeEach(() => {
		vi.stubGlobal('window', {});
		vi.restoreAllMocks();
	});

	it('detects PRF availability and marks ready', async () => {
		vi.spyOn(prfSupport, 'isPrfProtectionAvailable').mockResolvedValue(true);

		const environment = new CredentialEnvironmentController();
		expect(environment.ready).toBe(false);

		await environment.init();

		expect(environment.prfAvailable).toBe(true);
		expect(environment.ready).toBe(true);
	});

	it('init is idempotent', async () => {
		const detectSpy = vi.spyOn(prfSupport, 'isPrfProtectionAvailable').mockResolvedValue(false);

		const environment = new CredentialEnvironmentController();
		await Promise.all([environment.init(), environment.init()]);

		expect(detectSpy).toHaveBeenCalledTimes(1);
		expect(environment.ready).toBe(true);
	});

	it('notifies subscribers when detection completes', async () => {
		vi.spyOn(prfSupport, 'isPrfProtectionAvailable').mockResolvedValue(true);

		const environment = new CredentialEnvironmentController();
		const listener = vi.fn();
		environment.subscribe(listener);

		await environment.init();

		expect(listener).toHaveBeenCalledTimes(1);
	});
});
