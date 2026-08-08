import { describe, expect, it, beforeEach } from 'vite-plus/test';
import { PREVIEW_RATE_LIMIT_MAX, PREVIEW_RATE_LIMIT_WINDOW_MS } from './config';
import { checkPreviewRateLimit, resetPreviewRateLimitForTests } from './preview-rate-limit';

describe('checkPreviewRateLimit', () => {
	beforeEach(() => {
		resetPreviewRateLimitForTests();
	});

	it('allows requests until the configured limit is reached', () => {
		const now = 1_700_000_000_000;
		for (let index = 0; index < PREVIEW_RATE_LIMIT_MAX; index += 1) {
			expect(checkPreviewRateLimit('127.0.0.1', now + index)).toEqual({ allowed: true });
		}
	});

	it('blocks the next request within the same window', () => {
		const now = 1_700_000_000_000;
		for (let index = 0; index < PREVIEW_RATE_LIMIT_MAX; index += 1) {
			checkPreviewRateLimit('127.0.0.1', now);
		}

		const blocked = checkPreviewRateLimit('127.0.0.1', now + 1_000);
		expect(blocked.allowed).toBe(false);
		if (!blocked.allowed) {
			expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
			expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(
				Math.ceil(PREVIEW_RATE_LIMIT_WINDOW_MS / 1000)
			);
		}
	});

	it('resets the bucket after the window expires', () => {
		const now = 1_700_000_000_000;
		for (let index = 0; index < PREVIEW_RATE_LIMIT_MAX; index += 1) {
			checkPreviewRateLimit('10.0.0.1', now);
		}

		expect(checkPreviewRateLimit('10.0.0.1', now + PREVIEW_RATE_LIMIT_WINDOW_MS + 1)).toEqual({
			allowed: true
		});
	});
});
