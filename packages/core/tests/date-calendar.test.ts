import { describe, it, expect } from 'vite-plus/test';
import {
	parseIsoDate,
	formatIsoDate,
	formatSlashDate,
	previousOrSameMonday,
	addDays,
	addWeeks,
	weeksBetween,
	isBefore,
	safeParseIsoDate,
	currentWeekMonday,
	AcademicCalendarService
} from '../src/index';

describe('Date & AcademicCalendar in @chronos/core', () => {
	it('parses and formats ISO dates', () => {
		const parsed = parseIsoDate('2026-03-02');
		expect(formatIsoDate(parsed)).toBe('2026-03-02');
		expect(formatSlashDate('2026-03-02')).toBe('2026/3/2');
	});

	it('computes previous or same Monday correctly', () => {
		// 2026-03-04 is Wednesday
		const wednesday = parseIsoDate('2026-03-04');
		const monday = previousOrSameMonday(wednesday);
		expect(formatIsoDate(monday)).toBe('2026-03-02');

		// Monday remains Monday
		expect(formatIsoDate(previousOrSameMonday(monday))).toBe('2026-03-02');
	});

	it('calculates date addition and week differences', () => {
		const start = parseIsoDate('2026-03-02');
		const nextWeek = addWeeks(start, 2);
		expect(formatIsoDate(nextWeek)).toBe('2026-03-16');
		expect(weeksBetween(start, nextWeek)).toBe(2);

		const plus3Days = addDays(start, 3);
		expect(formatIsoDate(plus3Days)).toBe('2026-03-05');
		expect(isBefore(start, plus3Days)).toBe(true);
		expect(isBefore(plus3Days, start)).toBe(false);
	});

	it('safely parses invalid date with fallback', () => {
		const fallback = new Date();
		expect(safeParseIsoDate('invalid-date', fallback)).toBe(fallback);
		expect(currentWeekMonday('2026-03-04')).toBe('2026-03-02');
	});

	describe('AcademicCalendarService', () => {
		const calendarService = new AcademicCalendarService();

		it('infers term start date from term name', () => {
			const term1 = calendarService.inferTermStartDateFromTermName('2025-2026-1');
			expect(term1).not.toBeNull();
			expect(term1?.getUTCFullYear()).toBe(2025);
			expect(term1?.getUTCMonth()).toBe(8); // September (month index 8 in JS Date)

			const term2 = calendarService.inferTermStartDateFromTermName('2025-2026-2');
			expect(term2).not.toBeNull();
			expect(term2?.getUTCFullYear()).toBe(2026);
		});

		it('calculates academic week accurately', () => {
			const config = {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			};

			// First week
			expect(calendarService.calculateAcademicWeek('2026-03-04', config)).toBe(1);
			// Week 3
			expect(calendarService.calculateAcademicWeek('2026-03-18', config)).toBe(3);
			// Before term start clamps to startWeek
			expect(calendarService.calculateAcademicWeek('2026-02-15', config)).toBe(1);
			// Beyond endWeek clamps to endWeek
			expect(calendarService.calculateAcademicWeek('2026-09-01', config)).toBe(20);
		});

		it('resolves week start and course dates', () => {
			const config = {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			};

			expect(calendarService.resolveWeekStart(config, 2, '2026-03-02')).toBe('2026-03-09');
			// Tuesday of Week 2
			expect(calendarService.resolveCourseDate(config, 2, 2, '2026-03-02')).toBe('2026-03-10');
		});
	});
});
