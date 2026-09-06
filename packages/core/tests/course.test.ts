import { describe, expect, it } from 'vite-plus/test';
import {
	countDistinctCourseNames,
	countDistinctCoursesAffectedByPeriodDelete,
	countDistinctHiddenCourses,
	createCourse,
	listDistinctCourses
} from '../src/domain/course';

describe('course counting', () => {
	it('returns an empty list for no courses', () => {
		expect(listDistinctCourses([])).toEqual([]);
		expect(countDistinctCourseNames([])).toBe(0);
	});

	it('lists distinct courses with entry counts and stable zh-CN ordering', () => {
		const courses = [
			createCourse({ id: '1', name: '操作系统', dayOfWeek: 1, startPeriod: 1, endPeriod: 2 }),
			createCourse({
				id: '2',
				name: '数据库原理及应用★',
				dayOfWeek: 2,
				startPeriod: 1,
				endPeriod: 2
			}),
			createCourse({
				id: '3',
				name: '数据库原理及应用☆',
				dayOfWeek: 3,
				startPeriod: 3,
				endPeriod: 4
			})
		];
		expect(listDistinctCourses(courses)).toEqual([
			{ name: '操作系统', entryCount: 1 },
			{ name: '数据库原理及应用', entryCount: 2 }
		]);
	});

	it('counts distinct normalized course names', () => {
		const courses = [
			createCourse({
				id: '1',
				name: '数据库原理及应用★',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2
			}),
			createCourse({
				id: '2',
				name: '数据库原理及应用☆',
				dayOfWeek: 3,
				startPeriod: 3,
				endPeriod: 4
			}),
			createCourse({ id: '3', name: '操作系统', dayOfWeek: 2, startPeriod: 1, endPeriod: 2 })
		];
		expect(courses).toHaveLength(3);
		expect(countDistinctCourseNames(courses)).toBe(2);
	});

	it('counts distinct hidden courses by normalized name', () => {
		const courses = [
			createCourse({ id: '1', name: '高等数学★', dayOfWeek: 1, startPeriod: 9, endPeriod: 10 }),
			createCourse({ id: '2', name: '高等数学☆', dayOfWeek: 2, startPeriod: 9, endPeriod: 10 }),
			createCourse({ id: '3', name: '线性代数', dayOfWeek: 3, startPeriod: 1, endPeriod: 2 })
		];
		expect(countDistinctHiddenCourses(courses, 8)).toBe(1);
		expect(countDistinctHiddenCourses(courses, 10)).toBe(0);
	});

	it('counts distinct courses affected by period delete', () => {
		const courses = [
			createCourse({
				id: '1',
				name: '数据库原理及应用★',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 1
			}),
			createCourse({
				id: '2',
				name: '数据库原理及应用☆',
				dayOfWeek: 2,
				startPeriod: 2,
				endPeriod: 4
			}),
			createCourse({ id: '3', name: '操作系统', dayOfWeek: 3, startPeriod: 5, endPeriod: 6 })
		];
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 2)).toBe(2);
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 5)).toBe(1);
		expect(countDistinctCoursesAffectedByPeriodDelete(courses, 7)).toBe(0);
	});
});
