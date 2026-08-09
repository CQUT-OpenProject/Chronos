import type { Course } from '$lib/models/course';
import type { OnlineScheduleEvent } from '$lib/models/online-schedule';

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
	return JSON.stringify([
		course.name,
		course.dayOfWeek,
		course.startPeriod,
		course.endPeriod,
		course.teacher,
		course.location
	]);
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
