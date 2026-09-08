import { describe, expect, it, beforeEach } from 'vite-plus/test';
import { PLUGIN_RATE_LIMIT_MAX } from './config';
import { PluginRateLimiter } from './rate-limit';

describe('PluginRateLimiter', () => {
	let limiter: PluginRateLimiter;

	beforeEach(() => {
		limiter = new PluginRateLimiter();
	});

	it('allows requests under the per-plugin limit', () => {
		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			expect(limiter.check('source-cqut', '1.2.3.4')).toEqual({ allowed: true });
		}
	});

	it('blocks when the per-plugin limit is exceeded', () => {
		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			limiter.check('source-cqut', '1.2.3.4');
		}
		const blocked = limiter.check('source-cqut', '1.2.3.4');
		expect(blocked.allowed).toBe(false);
		if (!blocked.allowed) {
			expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
		}
	});

	it('isolates rate limits by plugin id', () => {
		for (let i = 0; i < PLUGIN_RATE_LIMIT_MAX; i++) {
			limiter.check('source-cqut', '1.2.3.4');
		}
		expect(limiter.check('other-plugin', '1.2.3.4')).toEqual({ allowed: true });
	});
});
