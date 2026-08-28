import { hostT } from '$lib/i18n/host-i18n.svelte';
import type { Course } from '@chronos/core';

import { timetableDayLabel } from '$lib/timetable/day-labels';

function formatPeriodRange(startPeriod: number, endPeriod: number): string {
	return startPeriod === endPeriod
		? hostT('courseA11y.periodSingle', { n: startPeriod })
		: hostT('courseA11y.periodRange', { start: startPeriod, end: endPeriod });
}

export function buildCourseCapsuleAriaLabel(
	course: Course,
	options?: { teacher?: string; isHolidayMuted?: boolean }
): string {
	const parts = [
		course.name,
		timetableDayLabel(course.dayOfWeek),
		formatPeriodRange(course.startPeriod, course.endPeriod)
	];

	if (options?.isHolidayMuted) {
		parts.push(hostT('timetable.holiday.label'));
	}

	const location = course.location.trim();
	if (location) parts.push(location);

	const teacher = options?.teacher?.trim() || course.teacher.trim();
	if (teacher) parts.push(teacher);

	return parts.join('，');
}

export function buildOverlapPlaceholderAriaLabel(count: number): string {
	return hostT('courseA11y.overlap', { count });
}
