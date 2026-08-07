import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';

export const WEEK_GRID_CACHE_RADIUS = 1;
export const MIN_DELAY_MILLIS = 1_000;

export function calculateWeekSliderSteps(startWeek: number, endWeek: number): number {
	return Math.max(0, endWeek - startWeek - 1);
}

export function clampDisplayedWeek(week: number, startWeek: number, endWeek: number): number {
	return Math.min(Math.max(week, startWeek), endWeek);
}

export function resolveDisplayedWeek(
	timetable: Timetable | null,
	displayedWeek: number,
	displayedWeekTimetableId: string | null | undefined,
	academicWeek: number
): number {
	if (!timetable) return 1;
	if (displayedWeekTimetableId !== timetable.id) {
		return clampDisplayedWeek(
			academicWeek,
			timetable.academicConfig.startWeek,
			timetable.academicConfig.endWeek
		);
	}
	return clampDisplayedWeek(
		displayedWeek,
		timetable.academicConfig.startWeek,
		timetable.academicConfig.endWeek
	);
}

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

	return new Map(
		requiredWeeks.map((week) => [
			week,
			existingWeekGridModels.get(week) ?? buildGrid(today, week, timetable)
		])
	);
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

	return new Map(
		requiredWeeks.map((week) => {
			const existing = existingWeekCourseDisplayModels.get(week);
			if (existing) return [week, existing] as const;

			const visibleDayOfWeeks = new Set(
				weekGridModels.get(week)?.visibleDays.map((day) => day.dayOfWeek) ?? []
			);
			return [week, buildDisplayModels(timetable, visibleDayOfWeeks, week, today)] as const;
		})
	);
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
