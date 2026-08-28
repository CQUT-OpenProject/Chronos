import { describe, expect, it, vi, afterEach } from 'vite-plus/test';
import {
	computeDelayUntilNextMidnightMillis,
	createDayClock,
	findCurrentPeriodIndex,
	parsePeriodRanges
} from '../src/engine/period-clock';

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

	it('computeDelayUntilNextMidnightMillis returns at least one second', () => {
		const now = new Date('2026-03-02T23:59:30');
		const delay = computeDelayUntilNextMidnightMillis(now);
		expect(delay).toBeGreaterThanOrEqual(1_000);
		expect(delay).toBeLessThanOrEqual(31_000);
	});
});

describe('createDayClock', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts period timer after reschedule when periods become available', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-02T08:30:00'));
		const onPeriodBoundary = vi.fn();
		let periodTimes: { index: number; startTime: string; endTime: string }[] = [];

		const clock = createDayClock({
			getPeriodTimes: () => periodTimes,
			onMidnight: vi.fn(),
			onPeriodBoundary
		});

		periodTimes = [{ index: 1, startTime: '08:00', endTime: '08:45' }];
		clock.reschedule();

		vi.advanceTimersByTime(16 * 60 * 1000);
		expect(onPeriodBoundary).toHaveBeenCalled();

		clock.dispose();
	});

	it('does not schedule period timer when periods stay empty', () => {
		vi.useFakeTimers();
		const onPeriodBoundary = vi.fn();

		const clock = createDayClock({
			getPeriodTimes: () => [],
			onMidnight: vi.fn(),
			onPeriodBoundary
		});

		vi.advanceTimersByTime(60_000);
		expect(onPeriodBoundary).not.toHaveBeenCalled();

		clock.dispose();
	});
});
