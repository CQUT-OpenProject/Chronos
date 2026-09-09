import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { consolidateCourses } from '../src/share-link/import-course-utils';

describe('consolidateCourses', () => {
	it('keeps empty weeks as all weeks instead of truncating to a fragment', () => {
		const allWeeks = createCourse({
			id: 'course-a',
			name: '高等数学',
			teacher: '张老师',
			location: 'B201',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: []
		});
		const fragment = createCourse({
			id: 'course-a-clone',
			name: '高等数学',
			teacher: '张老师',
			location: 'B201',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});

		const consolidated = consolidateCourses([fragment, allWeeks]);
		expect(consolidated).toHaveLength(1);
		expect(consolidated[0]!.weeks).toEqual([]);
		expect(consolidated[0]!.id).toBe('course-a-clone');
	});
});
