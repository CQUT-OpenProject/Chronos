import { mergeCompatibleOfferings, type Course } from '@chronos/core';

export function consolidateCourses(courses: Course[]): Course[] {
	return mergeCompatibleOfferings(courses).sort((left, right) => {
		if (left.dayOfWeek !== right.dayOfWeek) {
			return left.dayOfWeek - right.dayOfWeek;
		}
		if (left.startPeriod !== right.startPeriod) {
			return left.startPeriod - right.startPeriod;
		}
		return left.endPeriod - right.endPeriod;
	});
}
