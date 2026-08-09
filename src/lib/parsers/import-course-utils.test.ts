import { describe, expect, it } from 'vite-plus/test';
import {
	consolidateCourses,
	sanitizeAddress,
	sanitizeEventFields,
	sanitizeTeacher
} from './import-course-utils';
import type { Course } from '$lib/models/course';

describe('import-course-utils', () => {
	it('clears polluted teacher fields', () => {
		expect(sanitizeTeacher('2026-2027-1', '2026-2027-1')).toBe('');
		expect(sanitizeTeacher('2026-2027-1', '2025-2026-2')).toBe('');
		expect(sanitizeTeacher('朱烨华', '2026-2027-1')).toBe('朱烨华');
	});

	it('keeps the first address when campus fragments repeat', () => {
		expect(sanitizeAddress('两江校区 弘远楼D0429 两江校区 弘远楼D0426')).toBe(
			'两江校区 弘远楼D0429'
		);
		expect(sanitizeAddress('两江校区 弘远楼D0429')).toBe('两江校区 弘远楼D0429');
	});

	it('sanitizes event fields before course conversion', () => {
		const sanitized = sanitizeEventFields(
			{
				weekNum: '1',
				weekDay: '4',
				weekList: ['2'],
				weekCover: '',
				sessionList: ['3', '4'],
				sessionStart: '3',
				sessionLast: '2',
				eventName: '毛泽东思想和中国特色社会主义理论体系概论',
				address: '两江校区 弘远楼D0429 两江校区 弘远楼D0426',
				memberName: '2026-2027-1',
				remark: '',
				duplicateGroupType: '',
				duplicateGroup: 0,
				eventType: '1',
				eventID: ''
			},
			'2026-2027-1'
		);

		expect(sanitized.memberName).toBe('');
		expect(sanitized.address).toBe('两江校区 弘远楼D0429');
	});

	it('consolidates courses with the same identity', () => {
		const courses = consolidateCourses([
			course({ weeks: [3], dayOfWeek: 1 }),
			course({ weeks: [4], dayOfWeek: 1 })
		]);

		expect(courses).toHaveLength(1);
		expect(courses[0]?.weeks).toEqual([3, 4]);
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
