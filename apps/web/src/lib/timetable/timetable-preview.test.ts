import { describe, expect, it } from 'vite-plus/test';
import { formatShortDate, formatWeekDateRange } from './timetable-preview';
import type { AcademicConfig } from '$lib/models/timetable';

describe('timetable-preview', () => {
	it('formats short date correctly', () => {
		expect(formatShortDate('2026-03-02')).toBe('3/2');
		expect(formatShortDate('2026-11-09')).toBe('11/9');
	});

	it('formats week date range correctly for 5 weekdays', () => {
		const academicConfig: AcademicConfig = {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		};
		expect(
			formatWeekDateRange(academicConfig, 1, '2026-03-02', {
				showSaturday: false,
				showSunday: false
			})
		).toBe('3/2 - 3/6');
		expect(
			formatWeekDateRange(academicConfig, 2, '2026-03-02', {
				showSaturday: false,
				showSunday: false
			})
		).toBe('3/9 - 3/13');
	});

	it('formats week date range correctly when weekends are enabled', () => {
		const academicConfig: AcademicConfig = {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		};
		expect(
			formatWeekDateRange(academicConfig, 1, '2026-03-02', { showSaturday: true, showSunday: true })
		).toBe('3/2 - 3/8');
		expect(
			formatWeekDateRange(academicConfig, 1, '2026-03-02', {
				showSaturday: true,
				showSunday: false
			})
		).toBe('3/2 - 3/7');
	});

	it('handles null/undefined academic config safely', () => {
		const range = formatWeekDateRange(null, 1, '2026-03-02');
		expect(range).toMatch(/^\d+\/\d+ - \d+\/\d+$/);
	});
});
