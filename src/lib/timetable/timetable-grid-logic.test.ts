import { describe, expect, it } from 'vite-plus/test';
import {
	buildSlotGroups,
	computeDelayUntilNextCurrentTimeRefreshMillis,
	findCurrentPeriodIndex,
	parsePeriodRanges
} from './timetable-grid-logic';

describe('timetable-grid-logic', () => {
	it('findCurrentPeriodIndex prefers active period then next upcoming then last', () => {
		const periods = parsePeriodRanges([
			{ index: 1, startTime: '08:00', endTime: '08:45' },
			{ index: 2, startTime: '09:00', endTime: '09:45' },
			{ index: 3, startTime: '10:00', endTime: '10:45' }
		]);

		expect(findCurrentPeriodIndex(periods, 9 * 60 + 15)).toBe(2);
		expect(findCurrentPeriodIndex(periods, 9 * 60 + 50)).toBe(3);
		expect(findCurrentPeriodIndex(periods, 11 * 60 + 10)).toBe(3);
	});

	it('current time refresh delay waits for current period end', () => {
		const periods = parsePeriodRanges([
			{ index: 1, startTime: '09:00', endTime: '09:45' },
			{ index: 2, startTime: '10:00', endTime: '10:45' }
		]);
		const now = new Date(2026, 2, 21, 9, 15, 0, 0);

		expect(computeDelayUntilNextCurrentTimeRefreshMillis(now, periods)).toBe(30 * 60 * 1000);
	});

	it('buildSlotGroups groups overlapping courses on the same day', () => {
		const groups = buildSlotGroups([
			courseModel('a', 1, 1, 2),
			courseModel('b', 1, 2, 3),
			courseModel('c', 2, 1, 2)
		]);

		expect(groups).toHaveLength(2);
		expect(groups[0]?.courses.map((entry) => entry.course.id)).toEqual(['a', 'b']);
		expect(groups[1]?.courses.map((entry) => entry.course.id)).toEqual(['c']);
	});
});

function courseModel(id: string, dayOfWeek: number, startPeriod: number, endPeriod: number) {
	return {
		course: {
			id,
			name: id,
			teacher: '老师',
			location: 'A101',
			dayOfWeek,
			startPeriod,
			endPeriod,
			color: '#EADDFF',
			textColor: '#21005D',
			weeks: [1],
			remark: ''
		},
		isInDisplayedWeek: true
	};
}
