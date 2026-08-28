import { describe, it, expect } from 'vite-plus/test';
import {
	buildHolidayLookup,
	filterHolidaysInTermRange,
	inferYearsFromAcademicConfig,
	truncateHolidayLabel,
	calculateTimetableGrid,
	buildTimetableCourseDisplayModels,
	createTimetable,
	createCourse,
	type CalendarHoliday
} from '../src/index';

describe('holiday-calendar engine', () => {
	const holidays: CalendarHoliday[] = [
		{ date: '2026-01-01', label: '元旦' },
		{ date: '2026-10-01', label: '国庆节' }
	];

	it('builds lookup when holidays are present', () => {
		expect(buildHolidayLookup(undefined).size).toBe(0);
		expect(buildHolidayLookup({ holidays: [] }).size).toBe(0);
		expect(buildHolidayLookup({ holidays }).get('2026-10-01')?.label).toBe('国庆节');
	});

	it('infers years spanning term range', () => {
		const years = inferYearsFromAcademicConfig(
			{
				termStartDate: '2025-09-01',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			'2025-09-01'
		);
		expect(years).toEqual([2025, 2026]);
	});

	it('filters holidays within term range', () => {
		const inRange = filterHolidaysInTermRange(
			[
				{ date: '2025-12-31', label: '元旦' },
				{ date: '2026-03-02', label: '测试' },
				{ date: '2027-01-01', label: '太远' }
			],
			{
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 2,
				periodTimes: []
			},
			'2026-03-04'
		);
		expect(inRange.map((holiday) => holiday.date)).toEqual(['2026-03-02']);
	});

	it('truncates holiday labels for column headers', () => {
		expect(truncateHolidayLabel('国庆节')).toBe('国庆节');
		expect(truncateHolidayLabel('中国人民抗日战争胜利纪念日')).toBe('中国人民');
	});
});

describe('grid holiday integration', () => {
	it('annotates holiday columns and mutes courses on holiday dates', () => {
		const course = createCourse({
			id: 'c1',
			name: '高等数学',
			dayOfWeek: 4,
			startPeriod: 1,
			endPeriod: 2
		});
		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			courses: [course],
			academicConfig: {
				termStartDate: '2026-09-28',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [{ index: 1, startTime: '08:00', endTime: '08:45' }],
				holidayCalendar: {
					holidays: [{ date: '2026-10-01', label: '国庆节' }]
				}
			},
			viewPrefs: { showSaturday: true, showSunday: true, showNonCurrentWeekCourses: false }
		});

		const grid = calculateTimetableGrid('2026-10-01', 1, timetable);
		const nationalDay = grid.visibleDays.find((day) => day.date === '2026-10-01');
		expect(nationalDay?.holiday?.label).toBe('国庆节');

		const holidayMutedDayOfWeeks = new Set(
			grid.visibleDays.filter((day) => day.holiday).map((day) => day.dayOfWeek)
		);
		const models = buildTimetableCourseDisplayModels(
			timetable,
			new Set(grid.visibleDays.map((day) => day.dayOfWeek)),
			1,
			holidayMutedDayOfWeeks
		);
		expect(models[0]?.isHolidayMuted).toBe(true);
	});
});
