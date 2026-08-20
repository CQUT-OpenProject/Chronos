import type { Course } from '@chronos/core';
import { timetableDayLabel } from '$lib/timetable/day-labels';

function formatPeriodRange(startPeriod: number, endPeriod: number): string {
	return startPeriod === endPeriod ? `第 ${startPeriod} 节` : `第 ${startPeriod}-${endPeriod} 节`;
}

export function buildCourseCapsuleAriaLabel(
	course: Course,
	options?: { teacher?: string }
): string {
	const parts = [
		course.name,
		timetableDayLabel(course.dayOfWeek),
		formatPeriodRange(course.startPeriod, course.endPeriod)
	];

	const location = course.location.trim();
	if (location) parts.push(location);

	const teacher = options?.teacher?.trim() || course.teacher.trim();
	if (teacher) parts.push(teacher);

	return parts.join('，');
}

export function buildOverlapPlaceholderAriaLabel(count: number): string {
	return `此时段有 ${count} 门课程重叠，点击展开`;
}
