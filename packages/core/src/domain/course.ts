import { isCoursePeriodVisible } from '../engine/display-models';
import { normalizedCourseName } from '../engine/palette';

export const COURSE_REMARK_MAX_LENGTH = 200;

export interface Course {
	id: string;
	name: string;
	teacher: string;
	location: string;
	dayOfWeek: number; // 1 (Monday) - 7 (Sunday)
	startPeriod: number; // 1-indexed start period
	endPeriod: number; // 1-indexed end period
	weeks: number[]; // e.g. [1, 2, 3, 5]
	remark?: string;
	/** Plugin-specific metadata keyed by plugin ID */
	customMetadata?: Record<string, unknown>;
}

export function createCourse(
	partial: Omit<Course, 'weeks' | 'teacher' | 'location'> &
		Partial<Pick<Course, 'weeks' | 'teacher' | 'location'>>
): Course {
	const name = partial.name ? normalizedCourseName(partial.name) : '';
	return {
		teacher: '',
		location: '',
		weeks: [],
		remark: '',
		...partial,
		name: name || partial.name
	};
}

export function countDistinctCourseNames(courses: Course[]): number {
	if (courses.length === 0) return 0;
	return new Set(courses.map((course) => normalizedCourseName(course.name))).size;
}

/** User-facing count of distinct courses hidden when period rows are trimmed. */
export function countDistinctHiddenCourses(courses: Course[], periodCount: number): number {
	const hidden = courses.filter((course) => !isCoursePeriodVisible(course, periodCount));
	return countDistinctCourseNames(hidden);
}

/** User-facing count of distinct courses whose period pointers shift after deleting a period. */
export function countDistinctCoursesAffectedByPeriodDelete(
	courses: Course[],
	deletedIndex: number
): number {
	const affected = courses.filter((course) => course.endPeriod >= deletedIndex);
	return countDistinctCourseNames(affected);
}
