import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';

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
	const requiredWeeks = range(
		displayedWeek - WEEK_GRID_CACHE_RADIUS,
		displayedWeek + WEEK_GRID_CACHE_RADIUS
	).filter((week) => week >= startWeek && week <= endWeek);

	const resultMap = new Map(existingWeekGridModels);
	for (const week of requiredWeeks) {
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
	const requiredWeeks = range(
		displayedWeek - WEEK_GRID_CACHE_RADIUS,
		displayedWeek + WEEK_GRID_CACHE_RADIUS
	).filter((week) => week >= startWeek && week <= endWeek);

	const resultMap = new Map(existingWeekCourseDisplayModels);
	for (const week of requiredWeeks) {
		if (!resultMap.has(week)) {
			const visibleDayOfWeeks = new Set(
				weekGridModels.get(week)?.visibleDays.map((day) => day.dayOfWeek) ?? []
			);
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

function range(start: number, end: number): number[] {
	const result: number[] = [];
	for (let value = start; value <= end; value += 1) {
		result.push(value);
	}
	return result;
}
