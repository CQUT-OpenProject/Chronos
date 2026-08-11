import type { Course } from '$lib/models/course';

export function periodSlotKey(day: number, start: number, end: number): string {
	return `${day}-${start}-${end}`;
}

export function courseSlotKey(course: Course): string {
	return `${course.dayOfWeek}:${course.startPeriod}:${course.endPeriod}`;
}
