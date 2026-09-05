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

export interface DistinctCourseSummary {
	name: string;
	entryCount: number;
}

export function listDistinctCourses(courses: Course[]): DistinctCourseSummary[] {
	const counts = new Map<string, number>();
	for (const course of courses) {
		const name = normalizedCourseName(course.name);
		if (!name) continue;
		counts.set(name, (counts.get(name) ?? 0) + 1);
	}
	return [...counts.entries()]
		.map(([name, entryCount]) => ({ name, entryCount }))
		.sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
}

export function countDistinctCourseNames(courses: Course[]): number {
	return listDistinctCourses(courses).length;
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
