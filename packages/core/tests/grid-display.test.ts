import { describe, it, expect } from 'vite-plus/test';
import {
	createTimetable,
	createCourse,
	buildVisibleDayIndices,
	weekMonthLabel,
	calculateTimetableGrid,
	buildTimetableCourseDisplayModels,
	periodSlotKey,
	courseSlotKey
} from '../src/index';

describe('Grid & Display Models in @chronos/core', () => {
	it('generates periodSlotKey and courseSlotKey correctly', () => {
		expect(periodSlotKey(1, 1, 2)).toBe('1:1:2');
		expect(courseSlotKey({ dayOfWeek: 3, startPeriod: 5, endPeriod: 6 })).toBe('3:5:6');
	});

	it('computes visible day indices from view preferences', () => {
		expect(
			buildVisibleDayIndices({
				viewPrefs: { showSaturday: false, showSunday: false, showNonCurrentWeekCourses: false }
			})
		).toEqual([1, 2, 3, 4, 5]);
		expect(
			buildVisibleDayIndices({
				viewPrefs: { showSaturday: true, showSunday: false, showNonCurrentWeekCourses: false }
			})
		).toEqual([1, 2, 3, 4, 5, 6]);
		expect(
			buildVisibleDayIndices({
				viewPrefs: { showSaturday: true, showSunday: true, showNonCurrentWeekCourses: false }
			})
		).toEqual([1, 2, 3, 4, 5, 6, 7]);
	});

	it('generates week month label across month boundary', () => {
		expect(weekMonthLabel(['2026-03-02', '2026-03-08'])).toBe('3');
		expect(weekMonthLabel(['2026-03-30', '2026-04-05'])).toBe('3/4');
	});

	it('calculates full timetable grid', () => {
		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [
					{ index: 1, startTime: '08:30', endTime: '09:15' },
					{ index: 2, startTime: '09:20', endTime: '10:05' }
				]
			}
		});

		const grid = calculateTimetableGrid('2026-03-04', 1, timetable);
		expect(grid.visibleDays.length).toBe(7);
		expect(grid.visibleDays[0]?.date).toBe('2026-03-02');
		expect(grid.visibleDays[2]?.isToday).toBe(true);
		expect(grid.displayedPeriodCount).toBeGreaterThanOrEqual(10);
		expect(grid.periods[0]?.startTime).toBe('08:30');
	});

	it('builds course display models including future candidates when enabled', () => {
		const course1 = createCourse({
			id: 'c1',
			name: '本周课程',
			teacher: '李老师',
			location: '第一教学楼',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 2, 3]
		});

		const course2 = createCourse({
			id: 'c2',
			name: '下周课程',
			teacher: '王老师',
			location: '第二教学楼',
			dayOfWeek: 1,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [2, 4]
		});

		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			courses: [course1, course2],
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: true
			}
		});

		const displayModels = buildTimetableCourseDisplayModels(
			timetable,
			new Set([1, 2, 3, 4, 5, 6, 7]),
			1
		);

		expect(displayModels.length).toBe(2);
		expect(displayModels[0]?.isInDisplayedWeek).toBe(true);
		expect(displayModels[0]?.course.id).toBe('c1');
		expect(displayModels[1]?.isInDisplayedWeek).toBe(false);
		expect(displayModels[1]?.course.id).toBe('c2');
	});
});
