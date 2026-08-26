import { describe, expect, it } from 'vitest';
import { createCourse } from '../src/domain/course';
import { matchesCourseQuery } from '../src/domain/course-query';

describe('matchesCourseQuery', () => {
	const baseCourse = createCourse({
		id: 'c1',
		name: '高等数学',
		teacher: '张老师',
		location: 'A101',
		dayOfWeek: 3,
		startPeriod: 1,
		endPeriod: 2,
		weeks: [1, 3, 5]
	});

	it('matches when filter is empty', () => {
		expect(matchesCourseQuery(baseCourse)).toBe(true);
	});

	it('filters by dayOfWeek', () => {
		expect(matchesCourseQuery(baseCourse, { dayOfWeek: 3 })).toBe(true);
		expect(matchesCourseQuery(baseCourse, { dayOfWeek: 2 })).toBe(false);
		expect(matchesCourseQuery(baseCourse, { dayOfWeek: [2, 3] })).toBe(true);
	});

	it('filters by week; empty weeks matches all weeks', () => {
		expect(matchesCourseQuery(baseCourse, { week: 3 })).toBe(true);
		expect(matchesCourseQuery(baseCourse, { week: 2 })).toBe(false);
		expect(matchesCourseQuery(createCourse({ ...baseCourse, weeks: [] }), { week: 10 })).toBe(true);
	});

	it('filters by location exact and contains', () => {
		expect(matchesCourseQuery(baseCourse, { location: 'A101' })).toBe(true);
		expect(matchesCourseQuery(baseCourse, { location: { exact: 'a101' } })).toBe(true);
		expect(matchesCourseQuery(baseCourse, { location: { contains: '101' } })).toBe(true);
		expect(matchesCourseQuery(baseCourse, { location: 'B202' })).toBe(false);
	});

	it('filters by name and teacher contains (case-insensitive)', () => {
		expect(matchesCourseQuery(baseCourse, { nameContains: '数学' })).toBe(true);
		expect(matchesCourseQuery(baseCourse, { nameContains: '英语' })).toBe(false);
		expect(matchesCourseQuery(baseCourse, { teacherContains: '张' })).toBe(true);
	});
});
