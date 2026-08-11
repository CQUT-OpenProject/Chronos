import { describe, expect, it } from 'vite-plus/test';
import type { Course } from '$lib/models/course';
import { buildCourseCapsuleAriaLabel, buildOverlapPlaceholderAriaLabel } from './course-a11y';

const baseCourse: Course = {
	id: '1',
	name: '高等数学',
	teacher: '张老师',
	location: '教学楼 A101',
	dayOfWeek: 3,
	startPeriod: 1,
	endPeriod: 2,
	color: '#EADDFF',
	textColor: '#21005D',
	weeks: [],
	remark: ''
};

describe('buildCourseCapsuleAriaLabel', () => {
	it('combines name, day, period, location, and teacher', () => {
		expect(buildCourseCapsuleAriaLabel(baseCourse)).toBe(
			'高等数学，周三，第 1-2 节，教学楼 A101，张老师'
		);
	});

	it('uses single-period label when start and end match', () => {
		expect(
			buildCourseCapsuleAriaLabel({
				...baseCourse,
				startPeriod: 4,
				endPeriod: 4
			})
		).toBe('高等数学，周三，第 4 节，教学楼 A101，张老师');
	});

	it('omits empty location and teacher', () => {
		expect(
			buildCourseCapsuleAriaLabel({
				...baseCourse,
				teacher: '',
				location: ''
			})
		).toBe('高等数学，周三，第 1-2 节');
	});

	it('prefers teacher from options when provided', () => {
		expect(buildCourseCapsuleAriaLabel(baseCourse, { teacher: '李老师' })).toBe(
			'高等数学，周三，第 1-2 节，教学楼 A101，李老师'
		);
	});
});

describe('buildOverlapPlaceholderAriaLabel', () => {
	it('describes overlap count and expand action', () => {
		expect(buildOverlapPlaceholderAriaLabel(3)).toBe('此时段有 3 门课程重叠，点击展开');
	});
});
