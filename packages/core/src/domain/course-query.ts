import type { Course } from './course';
import type { CourseQueryFilter } from '../types/course-query';

function normalizeForMatch(value: string): string {
	return value.trim().toLowerCase();
}

function matchesDayOfWeek(course: Course, dayOfWeek: CourseQueryFilter['dayOfWeek']): boolean {
	if (dayOfWeek === undefined) return true;
	const days = Array.isArray(dayOfWeek) ? dayOfWeek : [dayOfWeek];
	return days.includes(course.dayOfWeek);
}

function matchesWeek(course: Course, week: number | undefined): boolean {
	if (week === undefined) return true;
	if (course.weeks.length === 0) return true;
	return course.weeks.includes(week);
}

function matchesLocation(course: Course, location: CourseQueryFilter['location']): boolean {
	if (location === undefined) return true;
	const courseLocation = normalizeForMatch(course.location);
	if (typeof location === 'string') {
		return courseLocation === normalizeForMatch(location);
	}
	if (location.exact !== undefined) {
		return courseLocation === normalizeForMatch(location.exact);
	}
	if (location.contains !== undefined) {
		return courseLocation.includes(normalizeForMatch(location.contains));
	}
	return true;
}

function matchesTextField(value: string, needle: string | undefined): boolean {
	if (needle === undefined) return true;
	return normalizeForMatch(value).includes(normalizeForMatch(needle));
}

export function matchesCourseQuery(course: Course, filter: CourseQueryFilter = {}): boolean {
	if (!matchesDayOfWeek(course, filter.dayOfWeek)) return false;
	if (!matchesWeek(course, filter.week)) return false;
	if (!matchesLocation(course, filter.location)) return false;
	if (!matchesTextField(course.name, filter.nameContains)) return false;
	if (!matchesTextField(course.teacher, filter.teacherContains)) return false;
	return true;
}
