export function periodSlotKey(day: number, start: number, end: number): string {
	return `${day}-${start}-${end}`;
}

export function courseSlotKey(course: {
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
}): string {
	return `${course.dayOfWeek}:${course.startPeriod}:${course.endPeriod}`;
}
