import type { Course, PeriodTime } from '@chronos/core';

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/** Minutes since midnight, or undefined for dirty input. */
export function timeToMinutes(value: unknown): number | undefined {
	if (typeof value !== 'string') return undefined;
	const match = TIME_PATTERN.exec(value.trim());
	if (!match) return undefined;
	const hour = Number(match[1]);
	const minute = Number(match[2]);
	if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return undefined;
	return hour * 60 + minute;
}

export function minutesToTimeString(total: number): string {
	const wrapped = ((Math.trunc(total) % 1440) + 1440) % 1440;
	return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}

/**
 * Same-day clock formatting without midnight wrapping, so overflow stays
 * visible (e.g. '24:10') instead of silently becoming a morning time.
 * Out-of-day results are rejected by timeToMinutes on purpose.
 */
function formatClockWithoutWrapping(total: number): string {
	const floored = Math.trunc(total);
	return `${String(Math.floor(floored / 60)).padStart(2, '0')}:${String(floored % 60).padStart(2, '0')}`;
}

/** Lesson length in minutes, or undefined when the range is invalid/dirty. */
export function periodDurationMinutes(
	period: Pick<PeriodTime, 'startTime' | 'endTime'>
): number | undefined {
	const start = timeToMinutes(period.startTime);
	const end = timeToMinutes(period.endTime);
	if (start === undefined || end === undefined || end <= start) return undefined;
	return end - start;
}

export type PeriodProblemKind = 'invalid-range' | 'overlap';

export interface PeriodProblem {
	index: number;
	kind: PeriodProblemKind;
	/** For overlaps: the other period index involved. */
	withIndex?: number;
}

/**
 * Row-level problems, non-blocking by design so imported dirty data
 * can still be opened and repaired. Touching boundaries (08:45/08:45) are fine.
 */
export function validatePeriodTimes(periods: PeriodTime[]): PeriodProblem[] {
	const problems: PeriodProblem[] = [];
	const ordered = [...periods].sort((a, b) => a.index - b.index);
	for (const period of ordered) {
		if (periodDurationMinutes(period) === undefined) {
			problems.push({ index: period.index, kind: 'invalid-range' });
		}
	}
	let maxEnd = Number.NEGATIVE_INFINITY;
	let maxEndIndex: number | undefined;
	for (let i = 1; i < ordered.length; i++) {
		const prev = ordered[i - 1];
		const curr = ordered[i];
		if (!prev || !curr) continue;
		const prevEnd = timeToMinutes(prev.endTime);
		if (prevEnd !== undefined && prevEnd > maxEnd) {
			maxEnd = prevEnd;
			maxEndIndex = prev.index;
		}
		const currStart = timeToMinutes(curr.startTime);
		if (currStart !== undefined && maxEndIndex !== undefined && currStart < maxEnd) {
			problems.push({ index: curr.index, kind: 'overlap', withIndex: maxEndIndex });
		}
	}
	return problems;
}

/** Suggest times for an appended period: last end + break, keeping last duration. */
export function suggestNextPeriodTime(
	periods: PeriodTime[],
	breakMinutes = 10,
	fallbackDurationMinutes = 45
): { startTime: string; endTime: string } {
	const last = periods[periods.length - 1];
	const lastEnd = last ? timeToMinutes(last.endTime) : undefined;
	const lastDuration = last
		? (periodDurationMinutes(last) ?? fallbackDurationMinutes)
		: fallbackDurationMinutes;
	const start = (lastEnd ?? 8 * 60) + breakMinutes;
	return {
		startTime: formatClockWithoutWrapping(start),
		endTime: formatClockWithoutWrapping(start + lastDuration)
	};
}

/**
 * Whether appending one more period still fits before midnight.
 * Unknown last end (empty/dirty input) counts as roomy: validation,
 * not the add button, guides repair.
 */
export function hasRoomForNextPeriod(
	periods: PeriodTime[],
	breakMinutes = 10,
	fallbackDurationMinutes = 45
): boolean {
	const last = periods[periods.length - 1];
	const lastEnd = last ? timeToMinutes(last.endTime) : undefined;
	if (lastEnd === undefined) return true;
	const lastDuration = last
		? (periodDurationMinutes(last) ?? fallbackDurationMinutes)
		: fallbackDurationMinutes;
	return lastEnd + breakMinutes + lastDuration <= 24 * 60 - 1;
}

/**
 * Courses whose period pointers change meaning when the period with the
 * given 1-based index is deleted and later periods shift down.
 */
export function countCoursesAffectedByPeriodDelete(
	courses: Course[],
	deletedIndex: number
): number {
	return courses.filter((course) => course.endPeriod >= deletedIndex).length;
}
