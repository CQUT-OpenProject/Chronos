import type { PeriodTime, Timetable } from '../domain/timetable';
import { AcademicCalendarService } from './calendar';
import { addDays, formatIsoDate, parseIsoDate } from './date';

export interface TimetableDayModel {
	dayOfWeek: number;
	date: string;
	isToday: boolean;
}

export interface TimetableGridModel {
	monthLabel: string;
	visibleDays: TimetableDayModel[];
	periods: PeriodTime[];
	displayedPeriodCount: number;
}

export function buildVisibleDayIndices(timetable: Pick<Timetable, 'viewPrefs'>): number[] {
	const days = [1, 2, 3, 4, 5];
	if (timetable.viewPrefs.showSaturday) days.push(6);
	if (timetable.viewPrefs.showSunday) days.push(7);
	return days;
}

export function weekMonthLabel(weekDates: string[]): string {
	const firstMonth = weekDates[0] ? Number(weekDates[0].slice(5, 7)) : 0;
	const lastMonth = weekDates[weekDates.length - 1]
		? Number(weekDates[weekDates.length - 1].slice(5, 7))
		: 0;
	if (!firstMonth) return '';
	return firstMonth === lastMonth ? String(firstMonth) : `${firstMonth}/${lastMonth}`;
}

export function buildDisplayPeriods(
	configuredPeriods: PeriodTime[],
	count: number,
	defaultPeriods: PeriodTime[] = []
): PeriodTime[] {
	const configured = new Map<number, PeriodTime>();
	for (const period of configuredPeriods) {
		configured.set(period.index, period);
	}

	return Array.from({ length: count }, (_, index) => {
		const periodIndex = index + 1;
		return (
			configured.get(periodIndex) ??
			defaultPeriods[index] ?? {
				index: periodIndex,
				startTime: '--:--',
				endTime: '--:--'
			}
		);
	});
}

export function calculateTimetableGrid(
	today: string,
	displayedWeek: number,
	timetable: Timetable,
	options?: {
		academicCalendarService?: AcademicCalendarService;
		defaultPeriods?: PeriodTime[];
	}
): TimetableGridModel {
	const calendarService = options?.academicCalendarService ?? new AcademicCalendarService();
	const visibleDays = buildVisibleDayIndices(timetable);
	const startOfWeek = parseIsoDate(
		calendarService.resolveWeekStart(timetable.academicConfig, displayedWeek, today)
	);

	const weekDays: TimetableDayModel[] = visibleDays.map((dayIndex) => {
		const date = addDays(startOfWeek, dayIndex - 1);
		const dateString = formatIsoDate(date);
		return {
			dayOfWeek: dayIndex,
			date: dateString,
			isToday: dateString === today
		};
	});

	const displayedPeriodCount = Math.max(
		10,
		timetable.academicConfig.periodTimes.length,
		...timetable.courses.map((course) => course.endPeriod),
		0
	);

	return {
		monthLabel: weekMonthLabel(weekDays.map((day) => day.date)),
		visibleDays: weekDays,
		periods: buildDisplayPeriods(
			timetable.academicConfig.periodTimes,
			displayedPeriodCount,
			options?.defaultPeriods
		),
		displayedPeriodCount
	};
}
