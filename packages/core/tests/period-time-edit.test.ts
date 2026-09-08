import { describe, expect, it } from 'vitest';
import type { Course } from '../src/domain/course';
import { countDistinctCoursesAffectedByPeriodDelete } from '../src/domain/course';
import {
	hasRoomForNextPeriod,
	minutesToTimeString,
	parseTimeMinutesStrict,
	periodDurationMinutes,
	suggestNextPeriodTime,
	validatePeriodTimes
} from '../src/algorithms/period-time-edit';

const P = (index: number, startTime: string, endTime: string) => ({ index, startTime, endTime });

describe('period-time-edit', () => {
	it('parses and formats clock times defensively', () => {
		expect(parseTimeMinutesStrict('08:45')).toBe(525);
		expect(parseTimeMinutesStrict(' 8:05 ')).toBe(485);
		expect(parseTimeMinutesStrict('24:00')).toBeUndefined();
		expect(parseTimeMinutesStrict('nope')).toBeUndefined();
		expect(parseTimeMinutesStrict(undefined)).toBeUndefined();
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

	it('counts distinct courses whose pointers shift when a period is deleted', () => {
		const courses = [
			{ name: '高等数学', startPeriod: 1, endPeriod: 1 },
			{ name: '线性代数', startPeriod: 2, endPeriod: 4 },
			{ name: '大学物理', startPeriod: 5, endPeriod: 6 }
		] as Course[];
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 2)).toBe(2);
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 5)).toBe(1);
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 7)).toBe(0);
	});

	it('deduplicates split entries of the same course when counting period-delete impact', () => {
		const courses = [
			{ name: '数据库原理及应用★', startPeriod: 1, endPeriod: 1 },
			{ name: '数据库原理及应用☆', startPeriod: 2, endPeriod: 4 },
			{ name: '操作系统', startPeriod: 5, endPeriod: 6 }
		] as Course[];
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 2)).toBe(2);
	});
});
