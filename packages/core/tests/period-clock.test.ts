import { describe, expect, it } from 'vite-plus/test';
import { findCurrentPeriodIndex, parsePeriodRanges } from '../src/engine/period-clock';

describe('period-clock', () => {
	const periods = parsePeriodRanges([
		{ index: 1, startTime: '08:00', endTime: '08:45' },
		{ index: 2, startTime: '09:00', endTime: '09:45' },
		{ index: 3, startTime: '10:00', endTime: '10:45' }
	]);

	it('none fallback only returns an in-progress period', () => {
		expect(findCurrentPeriodIndex(periods, 9 * 60 + 15, 'none')).toBe(2);
		expect(findCurrentPeriodIndex(periods, 9 * 60 + 50, 'none')).toBeNull();
		expect(findCurrentPeriodIndex(periods, 11 * 60 + 10, 'none')).toBeNull();
	});

	it('upcomingOrLast prefers active then next then last', () => {
		expect(findCurrentPeriodIndex(periods, 9 * 60 + 15, 'upcomingOrLast')).toBe(2);
		expect(findCurrentPeriodIndex(periods, 9 * 60 + 50, 'upcomingOrLast')).toBe(3);
		expect(findCurrentPeriodIndex(periods, 11 * 60 + 10, 'upcomingOrLast')).toBe(3);
	});
});
