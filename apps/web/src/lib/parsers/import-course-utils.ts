import { normalizedCourseName, type Course } from '@chronos/core';

export function countDistinctCourseNames(courses: Course[]): number {
	if (courses.length === 0) return 0;
	return new Set(courses.map((course) => normalizedCourseName(course.name))).size;
}
