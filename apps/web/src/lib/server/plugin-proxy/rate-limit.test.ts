import { describe, expect, it, beforeEach } from 'vite-plus/test';
import { PLUGIN_RATE_LIMIT_MAX } from './config';
import { checkPluginRateLimit, resetPluginRateLimitForTests } from './rate-limit';

describe('checkPluginRateLimit', () => {
	beforeEach(() => {
		resetPluginRateLimitForTests();
	});

	it('allows requests under the per-plugin limit', () => {
		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			expect(checkPluginRateLimit('source-cqut', '1.2.3.4')).toEqual({ allowed: true });
		}
	});

	it('blocks when the per-plugin limit is exceeded', () => {
		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			checkPluginRateLimit('source-cqut', '1.2.3.4');
		}
		const blocked = checkPluginRateLimit('source-cqut', '1.2.3.4');
		expect(blocked.allowed).toBe(false);
		if (!blocked.allowed) {
			expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
		}
	});

	it('isolates rate limits by plugin id', () => {
		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			checkPluginRateLimit('source-cqut', '1.2.3.4');
		}
		expect(checkPluginRateLimit('other-plugin', '1.2.3.4')).toEqual({ allowed: true });
	});
});
