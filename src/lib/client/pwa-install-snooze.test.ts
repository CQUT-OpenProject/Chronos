import { describe, expect, it } from 'vite-plus/test';
import {
	isInstallPromptSnoozed,
	parseSnoozedUntil,
	SNOOZE_DURATION_MS
} from './pwa-install-snooze';

describe('parseSnoozedUntil', () => {
	it('returns null for missing or invalid values', () => {
		expect(parseSnoozedUntil(null)).toBeNull();
		expect(parseSnoozedUntil('')).toBeNull();
		expect(parseSnoozedUntil('not-a-number')).toBeNull();
	});

	it('parses a numeric timestamp', () => {
		expect(parseSnoozedUntil('1700000000000')).toBe(1700000000000);
	});
});

describe('isInstallPromptSnoozed', () => {
	const now = 1_700_000_000_000;

	it('returns false when there is no snooze record', () => {
		expect(isInstallPromptSnoozed(null, now)).toBe(false);
	});

	it('returns true while the snooze period has not expired', () => {
		expect(isInstallPromptSnoozed(now + SNOOZE_DURATION_MS, now)).toBe(true);
		expect(isInstallPromptSnoozed(now + 1, now)).toBe(true);
	});

	it('returns false once the snooze period has expired', () => {
		expect(isInstallPromptSnoozed(now, now)).toBe(false);
		expect(isInstallPromptSnoozed(now - 1, now)).toBe(false);
	});
});
