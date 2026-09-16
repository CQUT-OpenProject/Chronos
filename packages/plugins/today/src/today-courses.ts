import {
	AcademicCalendarService,
	type Course,
	type CourseQueryHit,
	type IStorageService,
	type PeriodTime,
	type Timetable,
	dayOfWeekFromIso,
	parsePeriodRanges
} from '@chronos/core';
import type { TodayScope } from './constants';

export type { TodayScope };

export type CourseTimeStatus = 'past' | 'current' | 'preparing' | 'upcoming';

export interface TodayCourseEntry {
	hit: CourseQueryHit;
	status: CourseTimeStatus;
	minutesUntilStart: number | null;
}

const calendarService = new AcademicCalendarService();

export function resolvePeriodTimeRange(
	periodTimes: PeriodTime[],
	startPeriod: number,
	endPeriod: number
): { startTime: string; endTime: string } | null {
	const start = periodTimes.find((period) => period.index === startPeriod);
	const end = periodTimes.find((period) => period.index === endPeriod);
	if (!start || !end) return null;
	return { startTime: start.startTime, endTime: end.endTime };
}

export function formatPeriodRange(
	periodTimes: PeriodTime[],
	startPeriod: number,
	endPeriod: number
): string {
	const range = resolvePeriodTimeRange(periodTimes, startPeriod, endPeriod);
	if (!range) return '';
	return `${range.startTime}–${range.endTime}`;
}

export function sortCourseHits(hits: CourseQueryHit[]): CourseQueryHit[] {
	return [...hits].sort((left, right) => {
		const startDiff = left.course.startPeriod - right.course.startPeriod;
		if (startDiff !== 0) return startDiff;
		const endDiff = left.course.endPeriod - right.course.endPeriod;
		if (endDiff !== 0) return endDiff;
		return left.course.name.localeCompare(right.course.name, 'zh-CN');
	});
}

export function resolveMinutesUntilCourseStart(
	course: Course,
	periodTimes: PeriodTime[],
	nowMinutes: number
): number | null {
	const ranges = parsePeriodRanges(periodTimes);
	const start = ranges.find((period) => period.index === course.startPeriod);
	if (!start || nowMinutes >= start.startMinutes) return null;
	return start.startMinutes - nowMinutes;
}

export function resolveCourseTimeStatus(
	course: Course,
	periodTimes: PeriodTime[],
	nowMinutes: number,
	currentPeriodIndex: number | null,
	prepareReminderMinutes = 0
): CourseTimeStatus {
	const ranges = parsePeriodRanges(periodTimes);
	const start = ranges.find((period) => period.index === course.startPeriod);
	const end = ranges.find((period) => period.index === course.endPeriod);

	if (start && end) {
		if (nowMinutes > end.endMinutes) return 'past';
		if (nowMinutes >= start.startMinutes && nowMinutes <= end.endMinutes) return 'current';
		if (nowMinutes < start.startMinutes) {
			const minutesUntilStart = start.startMinutes - nowMinutes;
			if (prepareReminderMinutes > 0 && minutesUntilStart <= prepareReminderMinutes) {
				return 'preparing';
			}
			return 'upcoming';
		}
	}

	if (currentPeriodIndex == null) return 'upcoming';
	if (course.endPeriod < currentPeriodIndex) return 'past';
	if (course.startPeriod <= currentPeriodIndex && course.endPeriod >= currentPeriodIndex) {
		return 'current';
	}
	return 'upcoming';
}

export function attachCourseStatuses(
	hits: CourseQueryHit[],
	periodTimes: PeriodTime[],
	nowMinutes: number,
	currentPeriodIndex: number | null,
	prepareReminderMinutes = 0
): TodayCourseEntry[] {
	return sortCourseHits(hits).map((hit) => ({
		hit,
		status: resolveCourseTimeStatus(
			hit.course,
			periodTimes,
			nowMinutes,
			currentPeriodIndex,
			prepareReminderMinutes
		),
		minutesUntilStart: resolveMinutesUntilCourseStart(hit.course, periodTimes, nowMinutes)
	}));
}

export async function queryTodayCourses(
	storage: IStorageService,
	options: {
		todayIso: string;
		scope: TodayScope;
		timetable: Timetable | null;
	}
): Promise<CourseQueryHit[]> {
	const { todayIso, scope, timetable } = options;
	if (!timetable) return [];

	const dayOfWeek = dayOfWeekFromIso(todayIso);

	if (scope === 'active') {
		const week = calendarService.calculateAcademicWeek(todayIso, timetable.academicConfig);
		return storage.queryCourses({ dayOfWeek, week, timetableIds: [timetable.id] });
	}

	const summaries = await storage.listTimetables();
	if (summaries.length === 0) return [];

	const entries = (
		await Promise.all(summaries.map((summary) => storage.getTimetable(summary.id)))
	).filter((entry): entry is Timetable => entry != null);

	const weekGroups = new Map<number, string[]>();
	for (const entry of entries) {
		const week = calendarService.calculateAcademicWeek(todayIso, entry.academicConfig);
		const ids = weekGroups.get(week) ?? [];
		ids.push(entry.id);
		weekGroups.set(week, ids);
	}

	const hitGroups = await Promise.all(
		[...weekGroups.entries()].map(([week, timetableIds]) =>
			storage.queryCourses({ dayOfWeek, week, timetableIds })
		)
	);

	return hitGroups.flat();
}
