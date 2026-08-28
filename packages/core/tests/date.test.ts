import { describe, expect, it } from 'vite-plus/test';
import { dayOfWeekFromIso } from '../src/engine/date';

describe('dayOfWeekFromIso', () => {
	it('maps Sunday to 7 and Monday to 1', () => {
		expect(dayOfWeekFromIso('2026-03-01')).toBe(7);
		expect(dayOfWeekFromIso('2026-03-02')).toBe(1);
	});
});
