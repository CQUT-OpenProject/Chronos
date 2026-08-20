import { describe, expect, it } from 'vite-plus/test';
import { TimetableImportSource } from '$lib/models/timetable';
import { createTimetable } from '$lib/models/timetable';
import type { TimetableGridModel } from '@chronos/core';
import { buildWeekGridModels, computeDelayUntilNextMidnightMillis } from './timetable-screen-logic';

describe('timetable-screen-logic', () => {
	it('buildWeekGridModels preserves cached models and generates missing adjacent pages', () => {
		const requestedWeeks: number[] = [];
		const existingWeekSix = sampleGridModel('existing-6');

		const weekGridModels = buildWeekGridModels(
			sampleTimetable([]),
			'2026-04-20',
			7,
			new Map([
				[6, existingWeekSix],
				[2, sampleGridModel('existing-2')]
			]),
			(_today, week) => {
				requestedWeeks.push(week);
				return sampleGridModel(`generated-${week}`);
			}
		);

		expect([...weekGridModels.keys()].sort((a, b) => a - b)).toEqual([2, 6, 7, 8]);
		expect(weekGridModels.get(6)).toBe(existingWeekSix);
		expect(requestedWeeks).toEqual([7, 8]);
	});

	it('midnight delay waits until next local midnight', () => {
		const now = new Date(2026, 2, 21, 10, 15, 0, 0);
		expect(computeDelayUntilNextMidnightMillis(now)).toBe((13 * 60 + 45) * 60 * 1000);
	});
});

function sampleTimetable(courses: ReturnType<typeof createTimetable>['courses']) {
	return createTimetable({
		id: 'timetable',
		name: '课表',
		courses,
		createdAt: 0,
		updatedAt: 0,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: TimetableImportSource.UNKNOWN },
		viewPrefs: {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		}
	});
}

function sampleGridModel(monthLabel: string): TimetableGridModel {
	return {
		monthLabel,
		visibleDays: [],
		periods: [],
		displayedPeriodCount: 0
	};
}
