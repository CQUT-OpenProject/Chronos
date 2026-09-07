import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { rearrangeCourseSchedule } from './course-reorder';

describe('rearrangeCourseSchedule', () => {
	const courseA = createCourse({
		id: 'course-a',
		name: '高等数学',
		teacher: '张老师',
		location: '第一教学楼 101',
		dayOfWeek: 1,
		startPeriod: 1,
		endPeriod: 2,
		weeks: [1, 2, 3, 4]
	});

	const courseB = createCourse({
		id: 'course-b',
		name: '大学物理',
		teacher: '李老师',
		location: '理学院 302',
		dayOfWeek: 2,
		startPeriod: 3,
		endPeriod: 4,
		weeks: [1, 2, 3, 4]
	});

	const courseC = createCourse({
		id: 'course-c',
		name: '体育课',
		teacher: '王教练',
		location: '田径场',
		dayOfWeek: 3,
		startPeriod: 5,
		endPeriod: 7, // 3 periods
		weeks: [1, 2, 3, 4]
	});

	it('moves course in currentWeek without affecting other weeks', () => {
		const courses = [courseA, courseB];
		const result = rearrangeCourseSchedule({
			currentCourses: courses,
			draggedCourseId: 'course-a',
			targetDayOfWeek: 4,
			targetStartPeriod: 5,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).not.toBeNull();
		// Original course-a retained for weeks [1, 3, 4] at original slot
		const origA = result!.find((c) => c.id === 'course-a')!;
		expect(origA.dayOfWeek).toBe(1);
		expect(origA.startPeriod).toBe(1);
		expect(origA.endPeriod).toBe(2);
		expect(origA.weeks).toEqual([1, 3, 4]);

		// New entry created specifically for week 2 at target slot
		const newA = result!.find((c) => c.name === '高等数学' && c.id !== 'course-a')!;
		expect(newA).toBeDefined();
		expect(newA.dayOfWeek).toBe(4);
		expect(newA.startPeriod).toBe(5);
		expect(newA.endPeriod).toBe(6);
		expect(newA.weeks).toEqual([2]);
	});

	it('mutates single-week course in-place without creating extra entry', () => {
		const singleWeekCourse = createCourse({
			id: 'course-single',
			name: '单周讲座',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});
		const result = rearrangeCourseSchedule({
			currentCourses: [singleWeekCourse],
			draggedCourseId: 'course-single',
			targetDayOfWeek: 4,
			targetStartPeriod: 5,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).not.toBeNull();
		expect(result!.length).toBe(1);
		const moved = result![0]!;
		expect(moved.id).toBe('course-single');
		expect(moved.dayOfWeek).toBe(4);
		expect(moved.startPeriod).toBe(5);
		expect(moved.endPeriod).toBe(6);
		expect(moved.weeks).toEqual([2]);
	});

	it('stacks courses in currentWeek without swapping when periods match', () => {
		const courses = [courseA, courseB];
		const result = rearrangeCourseSchedule({
			currentCourses: courses,
			draggedCourseId: 'course-a',
			targetDayOfWeek: 2,
			targetStartPeriod: 3,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).not.toBeNull();

		// Original courseA for weeks 1, 3, 4 stays at Mon 1-2
		const origA = result!.find((c) => c.id === 'course-a')!;
		expect(origA.dayOfWeek).toBe(1);
		expect(origA.startPeriod).toBe(1);
		expect(origA.weeks).toEqual([1, 3, 4]);

		// Target courseB is completely untouched and remains at Tue 3-4
		const origB = result!.find((c) => c.id === 'course-b')!;
		expect(origB.dayOfWeek).toBe(2);
		expect(origB.startPeriod).toBe(3);
		expect(origB.endPeriod).toBe(4);
		expect(origB.weeks).toEqual([1, 2, 3, 4]);

		// New entry for courseA in week 2 moves to Tue 3-4 (stacks/overlaps with courseB)
		const week2A = result!.find((c) => c.name === '高等数学' && c.id !== 'course-a')!;
		expect(week2A.dayOfWeek).toBe(2);
		expect(week2A.startPeriod).toBe(3);
		expect(week2A.endPeriod).toBe(4);
		expect(week2A.weeks).toEqual([2]);
	});

	it('does not swap if the target course has a different span', () => {
		const courses = [courseA, courseC]; // A has span 2, C has span 3
		const result = rearrangeCourseSchedule({
			currentCourses: courses,
			draggedCourseId: 'course-a',
			targetDayOfWeek: 3,
			targetStartPeriod: 5,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).not.toBeNull();
		const origA = result!.find((c) => c.id === 'course-a')!;
		expect(origA.weeks).toEqual([1, 3, 4]);

		const newA = result!.find((c) => c.name === '高等数学' && c.id !== 'course-a')!;
		expect(newA.dayOfWeek).toBe(3);
		expect(newA.startPeriod).toBe(5);
		expect(newA.endPeriod).toBe(6);
		expect(newA.weeks).toEqual([2]);

		// C is completely untouched
		const origC = result!.find((c) => c.id === 'course-c')!;
		expect(origC.dayOfWeek).toBe(3);
		expect(origC.startPeriod).toBe(5);
		expect(origC.endPeriod).toBe(7);
		expect(origC.weeks).toEqual([1, 2, 3, 4]);
	});

	it('returns null when dropped at the identical slot', () => {
		const courses = [courseA, courseB];
		const result = rearrangeCourseSchedule({
			currentCourses: courses,
			draggedCourseId: 'course-a',
			targetDayOfWeek: 1,
			targetStartPeriod: 1,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).toBeNull();
	});

	it('clamps target period to stay within bounds', () => {
		const singleWeekCourse = createCourse({
			id: 'course-single',
			name: '单周讲座',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [2]
		});
		const result = rearrangeCourseSchedule({
			currentCourses: [singleWeekCourse],
			draggedCourseId: 'course-single',
			targetDayOfWeek: 1,
			targetStartPeriod: 15, // Out of bounds for 10 periods
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).not.toBeNull();
		const moved = result![0]!;
		expect(moved.startPeriod).toBe(9);
		expect(moved.endPeriod).toBe(10);
	});

	it('returns null if course id is not found', () => {
		const result = rearrangeCourseSchedule({
			currentCourses: [courseA],
			draggedCourseId: 'non-existent',
			targetDayOfWeek: 2,
			targetStartPeriod: 1,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).toBeNull();
	});

	it('returns null when dragged course is not in currentWeek', () => {
		const futureCourse = createCourse({
			id: 'course-future',
			name: '下学期课程',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [5, 6, 7]
		});
		const result = rearrangeCourseSchedule({
			currentCourses: [futureCourse, courseB],
			draggedCourseId: 'course-future',
			targetDayOfWeek: 4,
			targetStartPeriod: 5,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).toBeNull();
	});

	it('returns null when dragging a single-week course from another week', () => {
		const otherWeekCourse = createCourse({
			id: 'course-w5',
			name: '第5周讲座',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [5]
		});
		const result = rearrangeCourseSchedule({
			currentCourses: [otherWeekCourse],
			draggedCourseId: 'course-w5',
			targetDayOfWeek: 3,
			targetStartPeriod: 3,
			currentWeek: 2,
			displayedPeriodCount: 10
		});

		expect(result).toBeNull();
	});
});
