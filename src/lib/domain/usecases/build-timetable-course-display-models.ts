import type { Course } from '$lib/models/course';
import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel } from '$lib/models/presentation';
import { AcademicCalendarService } from '../services/academic-calendar';
import { courseSlotKey } from '$lib/timetable/slot-key';

export class BuildTimetableCourseDisplayModelsUseCase {
	constructor(private readonly academicCalendarService = new AcademicCalendarService()) {}

	invoke(
		timetable: Timetable,
		visibleDayOfWeeks: Set<number>,
		displayedWeek: number,
		today: string
	): TimetableCourseDisplayModel[] {
		const visibleCourses = timetable.courses
			.map((course, originalIndex) => ({ course, originalIndex }))
			.filter(({ course }) => visibleDayOfWeeks.has(course.dayOfWeek));

		const currentEntries = visibleCourses
			.filter(({ course }) => course.weeks.length === 0 || course.weeks.includes(displayedWeek))
			.map(({ course }) => ({
				course: { ...course, weeks: [...course.weeks] },
				isInDisplayedWeek: true
			}));

		if (!timetable.viewPrefs.showNonCurrentWeekCourses) {
			return currentEntries;
		}

		const occupiedSlots = new Set(currentEntries.map((entry) => courseSlotKey(entry.course)));
		const futureCandidatesBySlot = new Map<string, FutureCourseCandidate>();

		for (const { course, originalIndex } of visibleCourses) {
			if (course.weeks.length === 0 || course.weeks.includes(displayedWeek)) continue;

			const nextWeek = course.weeks
				.filter((week) => week >= displayedWeek)
				.sort((a, b) => a - b)[0];
			if (nextWeek == null) continue;

			const key = courseSlotKey(course);
			if (occupiedSlots.has(key)) continue;

			const candidate: FutureCourseCandidate = {
				course,
				nextOccurrenceDate: this.academicCalendarService.resolveCourseDate(
					timetable.academicConfig,
					nextWeek,
					course.dayOfWeek,
					today
				),
				originalIndex
			};

			const current = futureCandidatesBySlot.get(key);
			if (!current || isBetterFutureCandidate(candidate, current)) {
				futureCandidatesBySlot.set(key, candidate);
			}
		}

		const futureEntries = [...futureCandidatesBySlot.values()]
			.sort((left, right) =>
				left.originalIndex === right.originalIndex
					? left.nextOccurrenceDate.localeCompare(right.nextOccurrenceDate)
					: left.originalIndex - right.originalIndex
			)
			.map((candidate) => ({
				course: { ...candidate.course, weeks: [...candidate.course.weeks] },
				isInDisplayedWeek: false
			}));

		return [...currentEntries, ...futureEntries];
	}
}

interface FutureCourseCandidate {
	course: Course;
	nextOccurrenceDate: string;
	originalIndex: number;
}
function isBetterFutureCandidate(
	left: FutureCourseCandidate,
	right: FutureCourseCandidate
): boolean {
	if (left.nextOccurrenceDate !== right.nextOccurrenceDate) {
		return left.nextOccurrenceDate < right.nextOccurrenceDate;
	}
	return left.originalIndex < right.originalIndex;
}
