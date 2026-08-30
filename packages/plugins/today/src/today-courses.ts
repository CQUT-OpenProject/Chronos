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

export type CourseTimeStatus = 'past' | 'current' | 'upcoming';

export interface TodayCourseEntry {
	hit: CourseQueryHit;
	status: CourseTimeStatus;
}

const calendarService = new AcademicCalendarService();

export function formatPeriodRange(
	periodTimes: PeriodTime[],
	startPeriod: number,
	endPeriod: number
): string {
	const start = periodTimes.find((period) => period.index === startPeriod);
	const end = periodTimes.find((period) => period.index === endPeriod);
	if (!start || !end) return '';
	return `${start.startTime}–${end.endTime}`;
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

export function resolveCourseTimeStatus(
	course: Course,
	periodTimes: PeriodTime[],
	nowMinutes: number,
	currentPeriodIndex: number | null
): CourseTimeStatus {
	const ranges = parsePeriodRanges(periodTimes);
	const start = ranges.find((period) => period.index === course.startPeriod);
	const end = ranges.find((period) => period.index === course.endPeriod);

	if (start && end) {
		if (nowMinutes > end.endMinutes) return 'past';
		if (nowMinutes >= start.startMinutes && nowMinutes <= end.endMinutes) return 'current';
		if (nowMinutes < start.startMinutes) return 'upcoming';
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
	currentPeriodIndex: number | null
): TodayCourseEntry[] {
	return sortCourseHits(hits).map((hit) => ({
		hit,
		status: resolveCourseTimeStatus(hit.course, periodTimes, nowMinutes, currentPeriodIndex)
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
