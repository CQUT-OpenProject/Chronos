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

	// Check for a candidate course in target slot to swap with
	// Candidate must be in targetDayOfWeek, active in currentWeek (if specified),
	// and have the EXACT same period span and starting period.
	const targetCandidates = currentCourses.filter((course) => {
		if (course.id === draggedCourseId) return false;
		if (course.dayOfWeek !== targetDayOfWeek) return false;
		if (currentWeek != null) {
			const weeks = resolveCourseWeeks(course, totalWeeks);
			if (!weeks.includes(currentWeek)) return false;
		}
		const courseSpan = course.endPeriod - course.startPeriod + 1;
		return course.startPeriod === clampedStart && courseSpan === span;
	});

	// If currentWeek is not specified, fall back to simple in-place mutation
	if (currentWeek == null) {
		if (targetCandidates.length === 1) {
			const targetCourse = targetCandidates[0];
			const oldStart = dragged.startPeriod;
			const oldEnd = dragged.endPeriod;
			const oldDay = dragged.dayOfWeek;

			return currentCourses.map((course) => {
				if (course.id === draggedCourseId) {
					return {
						...course,
						dayOfWeek: targetDayOfWeek,
						startPeriod: clampedStart,
						endPeriod: clampedEnd
					};
				}
				if (course.id === targetCourse.id) {
					return {
						...course,
						dayOfWeek: oldDay,
						startPeriod: oldStart,
						endPeriod: oldEnd
					};
				}
				return course;
			});
		}

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
	const oldDay = dragged.dayOfWeek;
	const oldStart = dragged.startPeriod;
	const oldEnd = dragged.endPeriod;

	// Case 1: Swapping two courses of identical span in currentWeek
	if (targetCandidates.length === 1) {
		const targetCourse = targetCandidates[0];
		const targetWeeks = resolveCourseWeeks(targetCourse, totalWeeks);

		const result: Course[] = [];

		// Handle dragged course
		if (draggedWeeks.length <= 1) {
			// Only exists in currentWeek, move directly
			result.push({
				...dragged,
				dayOfWeek: targetDayOfWeek,
				startPeriod: clampedStart,
				endPeriod: clampedEnd,
				weeks: [currentWeek]
			});
		} else {
			// Multi-week: retain other weeks at original slot
			result.push({
				...dragged,
				weeks: draggedWeeks.filter((w) => w !== currentWeek)
			});
			// Create new single-week entry for currentWeek at target slot
			result.push({
				...dragged,
				id: generateNewCourseId(),
				dayOfWeek: targetDayOfWeek,
				startPeriod: clampedStart,
				endPeriod: clampedEnd,
				weeks: [currentWeek]
			});
		}

		// Handle target course
		if (targetWeeks.length <= 1) {
			// Only exists in currentWeek, move directly to dragged's old slot
			result.push({
				...targetCourse,
				dayOfWeek: oldDay,
				startPeriod: oldStart,
				endPeriod: oldEnd,
				weeks: [currentWeek]
			});
		} else {
			// Multi-week: retain other weeks at original slot
			result.push({
				...targetCourse,
				weeks: targetWeeks.filter((w) => w !== currentWeek)
			});
			// Create new single-week entry for currentWeek at dragged's old slot
			result.push({
				...targetCourse,
				id: generateNewCourseId(),
				dayOfWeek: oldDay,
				startPeriod: oldStart,
				endPeriod: oldEnd,
				weeks: [currentWeek]
			});
		}

		// Copy over remaining untouched courses
		for (const course of currentCourses) {
			if (course.id !== dragged.id && course.id !== targetCourse.id) {
				result.push(course);
			}
		}

		return result;
	}

	// Case 2: Moving dragged course to an open slot or overlapping slot in currentWeek
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
