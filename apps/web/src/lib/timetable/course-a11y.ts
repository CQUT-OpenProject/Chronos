import type { Course } from '@chronos/core';
import { hostText } from '$lib/i18n/host-text';
import { timetableDayLabel } from '$lib/timetable/day-labels';

function formatPeriodRange(startPeriod: number, endPeriod: number): string {
	return startPeriod === endPeriod
		? hostText('courseA11y.periodSingle', { n: startPeriod })
		: hostText('courseA11y.periodRange', { start: startPeriod, end: endPeriod });
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
	return hostText('courseA11y.overlap', { count });
}
