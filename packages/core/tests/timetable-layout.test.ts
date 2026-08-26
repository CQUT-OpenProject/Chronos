import { describe, expect, it } from 'vite-plus/test';
import {
	computeTimetableWeekLayout,
	formatShortDate,
	formatWeekDateRange,
	createTimetable,
	createCourse
} from '../src/index';

describe('Timetable Layout Pipeline', () => {
	const sampleTimetable = createTimetable({
		id: 'tt-1',
		name: '测试课表',
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: [
				{ index: 1, startTime: '08:00', endTime: '08:45' },
				{ index: 2, startTime: '08:55', endTime: '09:40' }
			]
		},
		viewPrefs: {
			showSaturday: false,
			showSunday: false,
			showNonCurrentWeekCourses: true
		},
		courses: [
			createCourse({
				id: 'c-1',
				name: '高等数学',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				weeks: [1, 2, 3],
				teacher: '张老师',
				location: '花溪校区 第三教学楼 A101'
			}),
			createCourse({
				id: 'c-2',
				name: '大学物理',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				weeks: [4, 5],
				teacher: '李老师',
				location: '花溪校区 物理楼 B202'
			})
		]
	});

	it('formats short dates and week ranges correctly', () => {
		expect(formatShortDate('2026-03-02')).toBe('3/2');
		expect(formatShortDate('2026-11-09')).toBe('11/9');

		const range5Days = formatWeekDateRange(sampleTimetable.academicConfig, 1, '2026-03-02', {
			showSaturday: false,
			showSunday: false
		});
		expect(range5Days).toBe('3/2 - 3/6');

		const range7Days = formatWeekDateRange(sampleTimetable.academicConfig, 1, '2026-03-02', {
			showSaturday: true,
			showSunday: true
		});
		expect(range7Days).toBe('3/2 - 3/8');
	});

	it('computes full week layout pipeline with active and future courses', () => {
		const layoutWeek1 = computeTimetableWeekLayout({
			timetable: sampleTimetable,
			displayedWeek: 1,
			todayIso: '2026-03-02',
			columnWidthPx: 80
		});

		expect(layoutWeek1.isCurrentWeek).toBe(true);
		expect(layoutWeek1.academicWeek).toBe(1);
		expect(layoutWeek1.gridModel.visibleDays.length).toBe(5);
		expect(layoutWeek1.weekRangeText).toBe('3/2 - 3/6');

		// In week 1: c-1 is active, so it occupies slot (1, 1-2)
		expect(layoutWeek1.courseDisplayModels.length).toBe(1);
		expect(layoutWeek1.courseDisplayModels[0]?.course.id).toBe('c-1');
		expect(layoutWeek1.courseDisplayModels[0]?.isInDisplayedWeek).toBe(true);

		// Placements should have 1 placed course capsule
		expect(layoutWeek1.placements.length).toBe(1);
		expect(layoutWeek1.placements[0]?.kind).toBe('course');
		if (layoutWeek1.placements[0]?.kind === 'course') {
			expect(layoutWeek1.placements[0].course.name).toBe('高等数学');
			expect(layoutWeek1.placements[0].locationLines).toEqual(['花溪校区', '第三教学楼', 'A101']);
		}
	});

	it('shows non-current week future courses when slot is unoccupied', () => {
		const layoutWeek4 = computeTimetableWeekLayout({
			timetable: sampleTimetable,
			displayedWeek: 4,
			todayIso: '2026-03-02',
			columnWidthPx: 80
		});

		expect(layoutWeek4.isCurrentWeek).toBe(false);
		expect(layoutWeek4.courseDisplayModels.length).toBe(1);
		expect(layoutWeek4.courseDisplayModels[0]?.course.id).toBe('c-2');
		expect(layoutWeek4.courseDisplayModels[0]?.isInDisplayedWeek).toBe(true);
	});
});
