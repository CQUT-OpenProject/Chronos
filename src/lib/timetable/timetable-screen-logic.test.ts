import { describe, expect, it } from 'vite-plus/test';
import { TimetableImportSource } from '$lib/models/timetable';
import { createTimetable } from '$lib/models/timetable';
import type { TimetableGridModel } from '$lib/models/presentation';
import {
	buildWeekGridModels,
	calculateWeekSliderSteps,
	computeDelayUntilNextMidnightMillis,
	resolveDisplayedWeek
} from './timetable-screen-logic';

describe('timetable-screen-logic', () => {
	it('calculateWeekSliderSteps returns zero when only one selectable week remains', () => {
		expect(calculateWeekSliderSteps(1, 1)).toBe(0);
		expect(calculateWeekSliderSteps(4, 5)).toBe(0);
	});

	it('calculateWeekSliderSteps matches discrete selectable weeks', () => {
		expect(calculateWeekSliderSteps(1, 20)).toBe(18);
		expect(calculateWeekSliderSteps(8, 12)).toBe(3);
	});

	it('resolveDisplayedWeek resets to academic week when timetable changes', () => {
		const timetable = sampleTimetable([]);
		expect(resolveDisplayedWeek(timetable, 12, 'another-timetable', 6)).toBe(6);
	});

	it('resolveDisplayedWeek keeps displayed week for the current timetable', () => {
		const timetable = sampleTimetable([]);
		expect(resolveDisplayedWeek(timetable, 12, timetable.id, 6)).toBe(12);
	});

	it('buildWeekGridModels keeps only displayed week and adjacent pages', () => {
		const requestedWeeks: number[] = [];
		const existingWeekSix = sampleGridModel('existing-6');

		const weekGridModels = buildWeekGridModels(
			sampleTimetable([]),
			'2026-04-20',
			7,
			new Map([
				[6, existingWeekSix],
				[2, sampleGridModel('stale-2')]
			]),
			(_today, week) => {
				requestedWeeks.push(week);
				return sampleGridModel(`generated-${week}`);
			}
		);

		expect([...weekGridModels.keys()]).toEqual([6, 7, 8]);
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

function sampleGridModel(label: string): TimetableGridModel {
	return {
		monthLabel: label,
		visibleDays: [{ dayOfWeek: 1, date: '2026-04-20', isToday: false }],
		periods: [{ index: 1, startTime: '08:00', endTime: '08:45' }],
		displayedPeriodCount: 1
	};
}
