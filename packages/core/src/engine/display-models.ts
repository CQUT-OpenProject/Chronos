import type { Course } from '../domain/course';
import type { Timetable } from '../domain/timetable';
import { courseSlotKey } from './slot-key';

export interface TimetableCourseDisplayModel {
	course: Course;
	isInDisplayedWeek: boolean;
}

interface FutureCourseCandidate {
	course: Course;
	nextWeek: number;
	originalIndex: number;
}

function isBetterFutureCandidate(
	left: FutureCourseCandidate,
	right: FutureCourseCandidate
): boolean {
	if (left.nextWeek !== right.nextWeek) {
		return left.nextWeek < right.nextWeek;
	}
	return left.originalIndex < right.originalIndex;
}

export function buildTimetableCourseDisplayModels(
	timetable: Timetable,
	visibleDayOfWeeks: Set<number>,
	displayedWeek: number
): TimetableCourseDisplayModel[] {
	const currentEntries: TimetableCourseDisplayModel[] = [];
	const nonCurrentCandidates: Array<{ course: Course; originalIndex: number }> = [];

	for (let i = 0; i < timetable.courses.length; i += 1) {
		const course = timetable.courses[i]!;
		if (!visibleDayOfWeeks.has(course.dayOfWeek)) continue;

		if (course.weeks.length === 0 || course.weeks.includes(displayedWeek)) {
			currentEntries.push({
				course: { ...course, weeks: [...course.weeks] },
				isInDisplayedWeek: true
			});
		} else {
			nonCurrentCandidates.push({ course, originalIndex: i });
		}
	}

	if (!timetable.viewPrefs.showNonCurrentWeekCourses) {
		return currentEntries;
	}

	const occupiedSlots = new Set(currentEntries.map((entry) => courseSlotKey(entry.course)));
	const futureCandidatesBySlot = new Map<string, FutureCourseCandidate>();

	for (const { course, originalIndex } of nonCurrentCandidates) {
		let nextWeek = Number.POSITIVE_INFINITY;
		for (const week of course.weeks) {
			if (week >= displayedWeek && week < nextWeek) {
				nextWeek = week;
			}
		}
		if (!Number.isFinite(nextWeek)) continue;

		const key = courseSlotKey(course);
		if (occupiedSlots.has(key)) continue;

		const candidate: FutureCourseCandidate = {
			course,
			nextWeek,
			originalIndex
		};

		const current = futureCandidatesBySlot.get(key);
		if (!current || isBetterFutureCandidate(candidate, current)) {
			futureCandidatesBySlot.set(key, candidate);
		}
	}

	const futureEntries = [...futureCandidatesBySlot.values()]
		.sort((left, right) => left.originalIndex - right.originalIndex)
		.map((candidate) => ({
			course: { ...candidate.course, weeks: [...candidate.course.weeks] },
			isInDisplayedWeek: false
		}));

	return [...currentEntries, ...futureEntries];
}
