import type { AcademicConfig, CalendarHoliday, HolidayCalendarConfig } from '../domain/timetable';
import { AcademicCalendarService } from './calendar';
import { addDays, formatIsoDate, parseIsoDate, todayIsoDate } from './date';

export function buildHolidayLookup(
	config: HolidayCalendarConfig | undefined | null
): Map<string, CalendarHoliday> {
	const lookup = new Map<string, CalendarHoliday>();
	if (!config?.holidays?.length) return lookup;
	for (const holiday of config.holidays) {
		lookup.set(holiday.date, holiday);
	}
	return lookup;
}

function resolveTermDateRange(
	academicConfig: AcademicConfig,
	referenceDate: string = todayIsoDate()
): { startDate: string; endDate: string } {
	const calendarService = new AcademicCalendarService();
	const weekStart = parseIsoDate(
		calendarService.resolveWeekStart(academicConfig, academicConfig.startWeek, referenceDate)
	);
	const lastWeekStart = parseIsoDate(
		calendarService.resolveWeekStart(academicConfig, academicConfig.endWeek, referenceDate)
	);
	const endDate = addDays(lastWeekStart, 6);
	return {
		startDate: formatIsoDate(weekStart),
		endDate: formatIsoDate(endDate)
	};
}

export function filterHolidaysInTermRange(
	holidays: readonly CalendarHoliday[],
	academicConfig: AcademicConfig,
	referenceDate: string = todayIsoDate()
): CalendarHoliday[] {
	const { startDate, endDate } = resolveTermDateRange(academicConfig, referenceDate);
	return holidays.filter((holiday) => holiday.date >= startDate && holiday.date <= endDate);
}

export function inferYearsFromAcademicConfig(
	academicConfig: AcademicConfig,
	referenceDate: string = todayIsoDate()
): number[] {
	const { startDate, endDate } = resolveTermDateRange(academicConfig, referenceDate);
	const startYear = Number.parseInt(startDate.slice(0, 4), 10);
	const endYear = Number.parseInt(endDate.slice(0, 4), 10);
	const years = new Set<number>();
	for (let year = startYear; year <= endYear; year += 1) {
		years.add(year);
	}
	if (years.size === 0) {
		years.add(Number.parseInt(referenceDate.slice(0, 4), 10));
	}
	return [...years].sort((left, right) => left - right);
}

export function truncateHolidayLabel(label: string, maxLength = 4): string {
	const trimmed = label.trim();
	if (trimmed.length <= maxLength) return trimmed;
	return trimmed.slice(0, maxLength);
}
