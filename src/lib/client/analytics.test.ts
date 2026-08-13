import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const envState = vi.hoisted(() => ({
	PUBLIC_POSTHOG_KEY: '',
	PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com'
}));

const posthog = vi.hoisted(() => ({
	init: vi.fn(),
	capture: vi.fn()
}));

vi.mock('$env/dynamic/public', () => ({
	env: envState
}));

vi.mock('posthog-js', () => ({
	default: posthog
}));

describe('analytics', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		envState.PUBLIC_POSTHOG_KEY = '';
		vi.stubEnv('DEV', false);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('does not throw and no-ops without a key', async () => {
		const { initAnalytics, trackEvent } = await import('./analytics');

		expect(() => initAnalytics()).not.toThrow();
		expect(() => trackEvent('onboarding_skip')).not.toThrow();
		expect(posthog.init).not.toHaveBeenCalled();
		expect(posthog.capture).not.toHaveBeenCalled();
	});

	it('inits posthog with privacy-first config', async () => {
		envState.PUBLIC_POSTHOG_KEY = 'phc_test';
		const { initAnalytics } = await import('./analytics');

		initAnalytics();

		await vi.waitFor(() => {
			expect(posthog.init).toHaveBeenCalled();
		});
		expect(posthog.init).toHaveBeenCalledWith(
			'phc_test',
			expect.objectContaining({
				autocapture: false,
				disable_session_recording: true
			})
		);
	});
});
