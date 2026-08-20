import type { Course } from '@chronos/core';

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
