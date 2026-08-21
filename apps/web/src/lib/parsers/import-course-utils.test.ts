import { describe, expect, it } from 'vite-plus/test';
import { countDistinctCourseNames } from './import-course-utils';
import type { Course } from '@chronos/core';

describe('import-course-utils', () => {
	it('counts distinct course names across time slots', () => {
		expect(
			countDistinctCourseNames([
				course({ name: '数据库原理及应用', startPeriod: 1 }),
				course({ name: '数据库原理及应用', startPeriod: 3, dayOfWeek: 3 })
			])
		).toBe(1);
		expect(
			countDistinctCourseNames([course({ name: '数据库原理及应用' }), course({ name: '操作系统' })])
		).toBe(2);
	});

	it('normalizes course names before counting', () => {
		expect(
			countDistinctCourseNames([
				course({ name: '数据库原理及应用' }),
				course({ name: '【调】数据库原理及应用' }),
				course({ name: '操作系统★' })
			])
		).toBe(2);
	});

	it('returns zero for an empty course list', () => {
		expect(countDistinctCourseNames([])).toBe(0);
	});
});

function course(overrides: Partial<Course>): Course {
	return {
		id: 'c1',
		name: '数据库原理及应用',
		teacher: '朱烨华',
		location: '两江校区 弘远楼D0429',
		dayOfWeek: 1,
		startPeriod: 1,
		endPeriod: 2,
		color: '#EADDFF',
		textColor: '#21005D',
		weeks: [1],
		remark: '',
		...overrides
	};
}
