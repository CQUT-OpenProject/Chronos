import type { Course } from '@chronos/core';

export interface RearrangeCourseOptions {
	currentCourses: Course[];
	draggedCourseId: string;
	targetDayOfWeek: number;
	targetStartPeriod: number;
	currentWeek?: number;
	totalWeeks?: { startWeek: number; endWeek: number };
	displayedPeriodCount: number;
}

function resolveCourseWeeks(
	course: Course,
	totalWeeks?: { startWeek: number; endWeek: number }
): number[] {
	if (course.weeks.length > 0) {
		return [...course.weeks].sort((a, b) => a - b);
	}
	const start = totalWeeks?.startWeek ?? 1;
	const end = totalWeeks?.endWeek ?? 20;
	return Array.from({ length: Math.max(1, end - start + 1) }, (_, i) => start + i);
}

function generateNewCourseId(): string {
	return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Calculates updated courses list when a course is moved or swapped to a new day and period.
 * Only affects the specified currentWeek without mutating other weeks' schedules.
 * Returns null if no changes are required (e.g. dropped on the same slot).
 */
export function rearrangeCourseSchedule(options: RearrangeCourseOptions): Course[] | null {
	const {
		currentCourses,
		draggedCourseId,
		targetDayOfWeek,
		targetStartPeriod,
		currentWeek,
		totalWeeks,
		displayedPeriodCount
	} = options;

	const draggedIndex = currentCourses.findIndex((c) => c.id === draggedCourseId);
	if (draggedIndex === -1) return null;

	const dragged = currentCourses[draggedIndex];
	const span = Math.max(1, dragged.endPeriod - dragged.startPeriod + 1);

	// Clamp start period to valid range [1 .. displayedPeriodCount - span + 1]
	const clampedStart = Math.max(1, Math.min(targetStartPeriod, displayedPeriodCount - span + 1));
	const clampedEnd = clampedStart + span - 1;

	// If position hasn't changed, do nothing
	if (dragged.dayOfWeek === targetDayOfWeek && dragged.startPeriod === clampedStart) {
		return null;
	}

	// If currentWeek is not specified, fall back to simple in-place mutation
	if (currentWeek == null) {
		return currentCourses.map((course) => {
			if (course.id === draggedCourseId) {
				return {
					...course,
					dayOfWeek: targetDayOfWeek,
					startPeriod: clampedStart,
					endPeriod: clampedEnd
				};
			}
			return course;
		});
	}

	// === Week-isolated rescheduling for currentWeek ===
	const draggedWeeks = resolveCourseWeeks(dragged, totalWeeks);
	if (!draggedWeeks.includes(currentWeek)) {
		return null;
	}

	// Moving dragged course to an open slot or overlapping slot in currentWeek
	const result: Course[] = [];

	if (draggedWeeks.length <= 1) {
		// Only exists in currentWeek, move directly
		for (const course of currentCourses) {
			if (course.id === dragged.id) {
				result.push({
					...course,
					dayOfWeek: targetDayOfWeek,
					startPeriod: clampedStart,
					endPeriod: clampedEnd,
					weeks: [currentWeek]
				});
			} else {
				result.push(course);
			}
		}
		return result;
	}

	// Multi-week: retain other weeks in original course
	for (const course of currentCourses) {
		if (course.id === dragged.id) {
			result.push({
				...course,
				weeks: draggedWeeks.filter((w) => w !== currentWeek)
			});
		} else {
			result.push(course);
		}
	}

	// Add single-week entry for currentWeek at target slot
	result.push({
		...dragged,
		id: generateNewCourseId(),
		dayOfWeek: targetDayOfWeek,
		startPeriod: clampedStart,
		endPeriod: clampedEnd,
		weeks: [currentWeek]
	});

	return result;
}
