import { describe, expect, it } from 'vitest';
import {
	countCoursesAffectedByPeriodDelete,
	hasRoomForNextPeriod,
	minutesToTimeString,
	periodDurationMinutes,
	suggestNextPeriodTime,
	timeToMinutes,
	validatePeriodTimes
} from './period-times';
import type { Course } from '@chronos/core';

const P = (index: number, startTime: string, endTime: string) => ({ index, startTime, endTime });

describe('period-times', () => {
	it('parses and formats clock times defensively', () => {
		expect(timeToMinutes('08:45')).toBe(525);
		expect(timeToMinutes(' 8:05 ')).toBe(485);
		expect(timeToMinutes('24:00')).toBeUndefined();
		expect(timeToMinutes('nope')).toBeUndefined();
		expect(timeToMinutes(undefined)).toBeUndefined();
		expect(minutesToTimeString(525)).toBe('08:45');
	});

	it('measures durations only for sane ranges', () => {
		expect(periodDurationMinutes(P(1, '08:00', '08:45'))).toBe(45);
		expect(periodDurationMinutes(P(1, '10:00', '09:00'))).toBeUndefined();
		expect(periodDurationMinutes(P(1, '08:00', '08:00'))).toBeUndefined();
	});

	it('flags invalid ranges and strict overlaps, allowing touching boundaries', () => {
		const problems = validatePeriodTimes([
			P(1, '08:00', '08:45'),
			P(2, '08:45', '09:30'),
			P(3, '09:20', '10:00'),
			P(4, '11:00', '10:00')
		]);
		expect(problems).toEqual([
			{ index: 4, kind: 'invalid-range' },
			{ index: 3, kind: 'overlap', withIndex: 2 }
		]);
	});

	it('flags non-adjacent overlaps against the latest end so far', () => {
		const problems = validatePeriodTimes([
			P(1, '08:00', '12:00'),
			P(2, '09:00', '09:30'),
			P(3, '10:00', '10:30')
		]);
		expect(problems).toEqual([
			{ index: 2, kind: 'overlap', withIndex: 1 },
			{ index: 3, kind: 'overlap', withIndex: 1 }
		]);
	});

	it('does not wrap suggested times past midnight so the new row carries the error', () => {
		expect(suggestNextPeriodTime([P(1, '23:30', '23:50')])).toEqual({
			startTime: '24:00',
			endTime: '24:20'
		});
		const problems = validatePeriodTimes([
			P(1, '23:30', '23:50'),
			{ index: 2, startTime: '24:00', endTime: '24:20' }
		]);
		expect(problems).toEqual([{ index: 2, kind: 'invalid-range' }]);
	});

	it('reports whether another period still fits before midnight', () => {
		expect(hasRoomForNextPeriod([P(1, '08:00', '08:45')])).toBe(true);
		expect(hasRoomForNextPeriod([])).toBe(true);
		expect(hasRoomForNextPeriod([P(1, 'nope', 'nope')])).toBe(true);
		expect(hasRoomForNextPeriod([P(1, '23:30', '23:50')])).toBe(false);
	});

	it('suggests the next period after the last one instead of duplicating defaults', () => {
		expect(suggestNextPeriodTime([P(1, '08:00', '08:45')])).toEqual({
			startTime: '08:55',
			endTime: '09:40'
		});
		expect(suggestNextPeriodTime([])).toEqual({ startTime: '08:10', endTime: '08:55' });
	});

	it('counts courses whose pointers shift when a period is deleted', () => {
		const courses = [
			{ startPeriod: 1, endPeriod: 1 },
			{ startPeriod: 2, endPeriod: 4 },
			{ startPeriod: 5, endPeriod: 6 }
		] as Course[];
		expect(countCoursesAffectedByPeriodDelete(courses, 2)).toBe(2);
		expect(countCoursesAffectedByPeriodDelete(courses, 5)).toBe(1);
		expect(countCoursesAffectedByPeriodDelete(courses, 7)).toBe(0);
	});
});
