import type { Course } from '@chronos/core';

export interface DeleteCourseForWeekOptions {
	currentCourses: Course[];
	courseId: string;
	currentWeek: number;
	totalWeeks?: { startWeek: number; endWeek: number };
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

/**
 * Removes a course offering from the specified week only.
 * Returns null when the course is missing or not scheduled in currentWeek.
 */
export function deleteCourseForWeek(options: DeleteCourseForWeekOptions): Course[] | null {
	const { currentCourses, courseId, currentWeek, totalWeeks } = options;

	const course = currentCourses.find((item) => item.id === courseId);
	if (!course) return null;

	const courseWeeks = resolveCourseWeeks(course, totalWeeks);
	if (!courseWeeks.includes(currentWeek)) return null;

	const remainingWeeks = courseWeeks.filter((week) => week !== currentWeek);
	if (remainingWeeks.length === 0) {
		return currentCourses.filter((item) => item.id !== courseId);
	}

	return currentCourses.map((item) =>
		item.id === courseId ? { ...item, weeks: remainingWeeks } : item
	);
}
