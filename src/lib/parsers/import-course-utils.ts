import type { Course } from '$lib/models/course';
import type { OnlineScheduleEvent } from '$lib/models/online-schedule';
import { normalizedCourseName } from '$lib/parsers/course-palette';

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

export function sanitizeEventFields(
	event: OnlineScheduleEvent,
	yearTerm: string
): OnlineScheduleEvent {
	return {
		...event,
		memberName: sanitizeTeacher(event.memberName, yearTerm),
		address: sanitizeAddress(event.address)
	};
}

function courseIdentityKey(course: Course): string {
	return `${course.name}\0${course.dayOfWeek}\0${course.startPeriod}\0${course.endPeriod}\0${course.teacher}\0${course.location}`;
}

export function consolidateCourses(courses: Course[]): Course[] {
	const merged = new Map<string, Course>();

	for (const course of courses) {
		const key = courseIdentityKey(course);
		const existing = merged.get(key);
		if (!existing) {
			merged.set(key, course);
			continue;
		}

		const weeks = [...new Set([...existing.weeks, ...course.weeks])].sort(
			(left, right) => left - right
		);
		merged.set(key, {
			...existing,
			weeks,
			remark: existing.remark || course.remark
		});
	}

	return [...merged.values()];
}

export function countDistinctCourseNames(courses: Course[]): number {
	if (courses.length === 0) return 0;
	return new Set(courses.map((course) => normalizedCourseName(course.name))).size;
}
