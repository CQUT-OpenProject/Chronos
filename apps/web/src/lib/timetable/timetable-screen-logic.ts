import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '@chronos/core';

const WEEK_GRID_CACHE_RADIUS = 1;
const MIN_DELAY_MILLIS = 1_000;

export function buildWeekGridModels(
	timetable: Timetable | null,
	today: string,
	displayedWeek: number,
	existingWeekGridModels: Map<number, TimetableGridModel>,
	buildGrid: (today: string, week: number, timetable: Timetable) => TimetableGridModel
): Map<number, TimetableGridModel> {
	if (!timetable) return new Map();

	const { startWeek, endWeek } = timetable.academicConfig;
	const minWeek = Math.max(startWeek, displayedWeek - WEEK_GRID_CACHE_RADIUS);
	const maxWeek = Math.min(endWeek, displayedWeek + WEEK_GRID_CACHE_RADIUS);

	const resultMap = new Map(existingWeekGridModels);
	for (let week = minWeek; week <= maxWeek; week += 1) {
		if (!resultMap.has(week)) {
			resultMap.set(week, buildGrid(today, week, timetable));
		}
	}
	return resultMap;
}

export function buildWeekCourseDisplayModels(
	timetable: Timetable | null,
	today: string,
	displayedWeek: number,
	weekGridModels: Map<number, TimetableGridModel>,
	existingWeekCourseDisplayModels: Map<number, TimetableCourseDisplayModel[]>,
	buildDisplayModels: (
		timetable: Timetable,
		visibleDayOfWeeks: Set<number>,
		week: number,
		today: string
	) => TimetableCourseDisplayModel[]
): Map<number, TimetableCourseDisplayModel[]> {
	if (!timetable) return new Map();

	const { startWeek, endWeek } = timetable.academicConfig;
	const minWeek = Math.max(startWeek, displayedWeek - WEEK_GRID_CACHE_RADIUS);
	const maxWeek = Math.min(endWeek, displayedWeek + WEEK_GRID_CACHE_RADIUS);

	const resultMap = new Map(existingWeekCourseDisplayModels);
	for (let week = minWeek; week <= maxWeek; week += 1) {
		if (!resultMap.has(week)) {
			const visibleDays = weekGridModels.get(week)?.visibleDays;
			const visibleDayOfWeeks = new Set<number>();
			if (visibleDays) {
				for (const day of visibleDays) {
					visibleDayOfWeeks.add(day.dayOfWeek);
				}
			}
			resultMap.set(week, buildDisplayModels(timetable, visibleDayOfWeeks, week, today));
		}
	}
	return resultMap;
}

export function computeDelayUntilNextMidnightMillis(
	now: Date,
	minimumDelayMillis = MIN_DELAY_MILLIS
): number {
	const nextMidnight = new Date(now);
	nextMidnight.setHours(24, 0, 0, 0);
	return Math.max(nextMidnight.getTime() - now.getTime(), minimumDelayMillis);
}
