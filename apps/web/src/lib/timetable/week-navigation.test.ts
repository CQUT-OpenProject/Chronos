import { describe, expect, it } from 'vite-plus/test';
import { TimetableImportSource } from '$lib/models/timetable';
import { createTimetable } from '$lib/models/timetable';
import {
	academicBounds,
	buildWeekList,
	clampDisplayedWeek,
	resolveDisplayedWeek,
	slideIndexFromWeek,
	weekFromSlideIndex
} from './week-navigation';

describe('week-navigation', () => {
	it('buildWeekList enumerates inclusive academic weeks', () => {
		expect(buildWeekList(1, 1)).toEqual([1]);
		expect(buildWeekList(8, 12)).toEqual([8, 9, 10, 11, 12]);
	});

	it('clampDisplayedWeek stays inside academic bounds', () => {
		expect(clampDisplayedWeek(0, 1, 20)).toBe(1);
		expect(clampDisplayedWeek(12, 1, 20)).toBe(12);
		expect(clampDisplayedWeek(99, 1, 20)).toBe(20);
	});

	it('resolveDisplayedWeek resets to academic week when timetable changes', () => {
		const timetable = sampleTimetable();
		expect(resolveDisplayedWeek(timetable, 12, 'another-timetable', 6)).toBe(6);
	});

	it('resolveDisplayedWeek keeps displayed week for the current timetable', () => {
		const timetable = sampleTimetable();
		expect(resolveDisplayedWeek(timetable, 12, timetable.id, 6)).toBe(12);
	});

	it('slideIndex and week convert both ways', () => {
		expect(slideIndexFromWeek(1, 7, 20)).toBe(6);
		expect(weekFromSlideIndex(1, 6)).toBe(7);
		expect(slideIndexFromWeek(8, 8, 5)).toBe(0);
		expect(slideIndexFromWeek(8, 99, 5)).toBe(4);
		expect(slideIndexFromWeek(1, 1, 0)).toBe(0);
	});

	it('academicBounds falls back when timetable is missing', () => {
		expect(academicBounds(null)).toEqual({ startWeek: 1, endWeek: 1 });
		expect(academicBounds(sampleTimetable())).toEqual({ startWeek: 1, endWeek: 20 });
	});

	it('pager settle converts slide index into a clamped week', () => {
		const timetable = sampleTimetable();
		const { startWeek, endWeek } = academicBounds(timetable);
		const weeks = buildWeekList(startWeek, endWeek);
		const week = weekFromSlideIndex(startWeek, 3);
		expect(clampDisplayedWeek(week, startWeek, endWeek)).toBe(4);
		expect(slideIndexFromWeek(startWeek, week, weeks.length)).toBe(3);
	});
});

function sampleTimetable() {
	return createTimetable({
		id: 'timetable',
		name: '课表',
		courses: [],
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
