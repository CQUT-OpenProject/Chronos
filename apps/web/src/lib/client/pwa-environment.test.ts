import { describe, expect, it } from 'vite-plus/test';
import { detectPwaEnvironment } from './pwa-install.svelte';

describe('detectPwaEnvironment', () => {
	it('detects iOS Safari', () => {
		const flags = detectPwaEnvironment({
			userAgent:
				'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
			platform: 'iOS',
			maxTouchPoints: 5,
			hasTouchStart: true
		});

		expect(flags.isIOS).toBe(true);
		expect(flags.isMacSafari).toBe(false);
	});

	it('detects macOS Safari', () => {
		const flags = detectPwaEnvironment({
			userAgent:
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
			platform: 'macOS',
			maxTouchPoints: 0,
			hasTouchStart: false
		});

		expect(flags.isIOS).toBe(false);
		expect(flags.isMacSafari).toBe(true);
	});

	it('does not classify Chrome on Android as iOS', () => {
		const flags = detectPwaEnvironment({
			userAgent:
				'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
			platform: 'Android',
			brands: [{ brand: 'Google Chrome' }],
			maxTouchPoints: 5,
			hasTouchStart: true
		});

		expect(flags.isIOS).toBe(false);
		expect(flags.isMacSafari).toBe(false);
	});
});
