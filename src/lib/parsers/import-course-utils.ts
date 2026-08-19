import { normalizedCourseName, type Course } from '@chronos/core';

const YEAR_TERM_PATTERN = /^\d{4}-\d{4}-\d+$/;
const CAMPUS_PATTERN = /[^ ]+校区/g;

export function sanitizeTeacher(memberName: string, yearTerm: string): string {
	const trimmed = memberName.trim();
	if (!trimmed) return '';
	if (trimmed === yearTerm.trim()) return '';
	if (YEAR_TERM_PATTERN.test(trimmed)) return '';
	return trimmed;
}

export function sanitizeAddress(address: string): string {
	const trimmed = address.trim();
	if (!trimmed) return '';

	const campusMatches = [...trimmed.matchAll(CAMPUS_PATTERN)];
	if (campusMatches.length <= 1) return trimmed;

	const secondCampus = campusMatches[1]?.index;
	if (secondCampus === undefined || secondCampus <= 0) return trimmed;
	return trimmed.slice(0, secondCampus).trim();
}

export function sanitizeEventFields<T extends { memberName: string; address: string }>(
	event: T,
	yearTerm: string
): T {
	return {
		...event,
		memberName: sanitizeTeacher(event.memberName, yearTerm),
		address: sanitizeAddress(event.address)
	};
}

export function consolidateCourses(courses: Course[]): Course[] {
	const map = new Map<string, Course>();

	for (const course of courses) {
		const key = `${course.name}|${course.teacher}|${course.location}|${course.dayOfWeek}|${course.startPeriod}|${course.endPeriod}|${course.remark}`;
		const existing = map.get(key);

		if (existing) {
			const combinedWeeks = Array.from(new Set([...existing.weeks, ...course.weeks])).sort(
				(a, b) => a - b
			);
			existing.weeks = combinedWeeks;
		} else {
			map.set(key, {
				...course,
				weeks: [...course.weeks].sort((a, b) => a - b)
			});
		}
	}

	return Array.from(map.values()).sort((a, b) => {
		if (a.dayOfWeek !== b.dayOfWeek) {
			return a.dayOfWeek - b.dayOfWeek;
		}
		if (a.startPeriod !== b.startPeriod) {
			return a.startPeriod - b.startPeriod;
		}
		return a.endPeriod - b.endPeriod;
	});
}

export function countDistinctCourseNames(courses: Course[]): number {
	if (courses.length === 0) return 0;
	return new Set(courses.map((course) => normalizedCourseName(course.name))).size;
}
