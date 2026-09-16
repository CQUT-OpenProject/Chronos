import { describe, expect, it, vi, afterEach } from 'vite-plus/test';
import {
	createDayClock,
	findCurrentPeriodIndex,
	parsePeriodRanges
} from '../src/algorithms/period-clock';

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

describe('createDayClock', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('realigns after a suspended page resumes and leaves only one timer', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-02T07:49:40'));
		const onTick = vi.fn();
		const clock = createDayClock({ onTick });
		vi.setSystemTime(new Date('2026-03-02T08:07:30'));
		clock.reschedule();
		expect(vi.getTimerCount()).toBe(1);
		vi.advanceTimersByTime(30_000);
		expect(onTick).toHaveBeenCalledExactlyOnceWith(new Date('2026-03-02T08:08:00'));
		clock.dispose();
		expect(vi.getTimerCount()).toBe(0);
	});
});
