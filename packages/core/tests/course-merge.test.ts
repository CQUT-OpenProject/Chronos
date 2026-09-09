import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '../src/domain/course';
import { mergeCompatibleOfferings } from '../src/domain/course-merge';

describe('mergeCompatibleOfferings', () => {
	it('unions weeks and keeps the first id for the same slot identity', () => {
		const remnant = createCourse({
			id: 'course-a',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 3, 4]
		});
		const clone = createCourse({
			id: 'course-a-clone',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});

		const merged = mergeCompatibleOfferings([remnant, clone]);
		expect(merged).toHaveLength(1);
		expect(merged[0]!.id).toBe('course-a');
		expect(merged[0]!.weeks).toEqual([1, 2, 3, 4]);
	});

	it('treats empty weeks as all weeks when unioning', () => {
		const allWeeks = createCourse({
			id: 'course-a',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: []
		});
		const fragment = createCourse({
			id: 'course-a-clone',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});

		const merged = mergeCompatibleOfferings([allWeeks, fragment]);
		expect(merged).toHaveLength(1);
		expect(merged[0]!.id).toBe('course-a');
		expect(merged[0]!.weeks).toEqual([]);
	});

	it('collapses weeks that cover the academic range after a merge', () => {
		const remnant = createCourse({
			id: 'course-a',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 3, 4]
		});
		const clone = createCourse({
			id: 'course-a-clone',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});

		const merged = mergeCompatibleOfferings([remnant, clone], { startWeek: 1, endWeek: 4 });
		expect(merged).toHaveLength(1);
		expect(merged[0]!.id).toBe('course-a');
		expect(merged[0]!.weeks).toEqual([]);
	});

	it('does not merge different locations or names in the same slot', () => {
		const lab = createCourse({
			id: 'db-lab',
			name: '数据库原理及应用',
			teacher: '朱烨华',
			location: '两江校区 弘远楼D0429',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [6, 7, 8]
		});
		const theory = createCourse({
			id: 'db-theory',
			name: '数据库原理及应用',
			teacher: '朱烨华',
			location: '两江校区 弘远楼B0415',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2, 7, 8]
		});
		const other = createCourse({
			id: 'iot',
			name: '物联网通信技术',
			teacher: '王东',
			location: '两江校区 弘远楼D0236',
			dayOfWeek: 2,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [2, 3, 4]
		});
		const later = createCourse({
			id: 'sense',
			name: '物联网感知与控制技术',
			teacher: '但远宏',
			location: '两江校区 弘远楼D0426',
			dayOfWeek: 2,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [11, 12]
		});

		const merged = mergeCompatibleOfferings([lab, theory, other, later]);
		expect(merged.map((course) => course.id)).toEqual(['db-lab', 'db-theory', 'iot', 'sense']);
	});

	it('preserves first-seen order and does not reorder unrelated courses', () => {
		const physics = createCourse({
			id: 'course-b',
			name: '大学物理',
			teacher: '李老师',
			location: '理学院 302',
			dayOfWeek: 2,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [1, 2, 3]
		});
		const remnant = createCourse({
			id: 'course-a',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 3]
		});
		const clone = createCourse({
			id: 'course-a-clone',
			name: '高等数学',
			teacher: '张老师',
			location: '第一教学楼 101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});

		const merged = mergeCompatibleOfferings([physics, remnant, clone]);
		expect(merged.map((course) => course.id)).toEqual(['course-b', 'course-a']);
		expect(merged[1]!.weeks).toEqual([1, 2, 3]);
	});
});
