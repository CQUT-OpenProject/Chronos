import type { Course } from './course';

export interface AcademicWeekRange {
	startWeek: number;
	endWeek: number;
}

function offeringMergeKey(course: Course): string {
	return `${course.name}|${course.teacher}|${course.location}|${course.dayOfWeek}|${course.startPeriod}|${course.endPeriod}|${course.remark ?? ''}`;
}

function sortedWeeks(weeks: readonly number[]): number[] {
	return [...weeks].sort((left, right) => left - right);
}

function unionWeeks(left: readonly number[], right: readonly number[]): number[] {
	if (left.length === 0 || right.length === 0) return [];
	return sortedWeeks([...new Set([...left, ...right])]);
}

function coversAcademicWeeks(weeks: readonly number[], totalWeeks: AcademicWeekRange): boolean {
	const { startWeek, endWeek } = totalWeeks;
	const expectedLength = endWeek - startWeek + 1;
	if (expectedLength <= 0 || weeks.length !== expectedLength) return false;
	return weeks.every((week, index) => week === startWeek + index);
}

function cloneOffering(course: Course, weeks: number[]): Course {
	return {
		...course,
		weeks,
		...(course.customMetadata ? { customMetadata: { ...course.customMetadata } } : {})
	};
}

/**
 * Merges offerings that share name, teacher, location, slot, and remark.
 * Empty `weeks` means every academic week. The first row in each group keeps its id
 * and relative position; the timetable is not re-sorted.
 */
export function mergeCompatibleOfferings(
	courses: readonly Course[],
	totalWeeks?: AcademicWeekRange
): Course[] {
	const indexByKey = new Map<string, number>();
	const result: Course[] = [];

	for (const course of courses) {
		const key = offeringMergeKey(course);
		const existingIndex = indexByKey.get(key);
		if (existingIndex === undefined) {
			indexByKey.set(key, result.length);
			result.push(cloneOffering(course, sortedWeeks(course.weeks)));
			continue;
		}

		const existing = result[existingIndex]!;
		const mergedWeeks = unionWeeks(existing.weeks, course.weeks);
		const weeks =
			totalWeeks && mergedWeeks.length > 0 && coversAcademicWeeks(mergedWeeks, totalWeeks)
				? []
				: mergedWeeks;
		result[existingIndex] = cloneOffering(existing, weeks);
	}

	return result;
}
