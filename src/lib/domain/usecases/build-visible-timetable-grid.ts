import { defaultPeriodTimes } from '$lib/models/defaults';
import type { PeriodTime, Timetable } from '$lib/models/timetable';
import type { TimetableDayModel, TimetableGridModel } from '$lib/models/presentation';
import { AcademicCalendarService } from '../services/academic-calendar';
import { addDays, parseIsoDate } from '../date';

export class BuildVisibleTimetableGridUseCase {
	constructor(private readonly academicCalendarService = new AcademicCalendarService()) {}

	invoke(today: string, displayedWeek: number, timetable: Timetable): TimetableGridModel {
		const visibleDays = buildVisibleDayIndices(timetable);
		const startOfWeek = parseIsoDate(
			this.academicCalendarService.resolveWeekStart(timetable.academicConfig, displayedWeek, today)
		);

		const weekDays: TimetableDayModel[] = visibleDays.map((dayIndex) => {
			const date = addDays(startOfWeek, dayIndex - 1);
			const dateString = formatDate(date);
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
			periods: buildDisplayPeriods(timetable.academicConfig.periodTimes, displayedPeriodCount),
			displayedPeriodCount
		};
	}
}

function buildVisibleDayIndices(timetable: Timetable): number[] {
	const days = [1, 2, 3, 4, 5];
	if (timetable.viewPrefs.showSaturday) days.push(6);
	if (timetable.viewPrefs.showSunday) days.push(7);
	return days;
}

function buildDisplayPeriods(configuredPeriods: PeriodTime[], count: number): PeriodTime[] {
	const configured = new Map(
		[...configuredPeriods]
			.sort((left, right) => left.index - right.index)
			.map((period) => [period.index, period])
	);
	const defaults = defaultPeriodTimes();

	return Array.from({ length: count }, (_, index) => {
		const periodIndex = index + 1;
		return (
			configured.get(periodIndex) ??
			defaults[index] ?? {
				index: periodIndex,
				startTime: '--:--',
				endTime: '--:--'
			}
		);
	});
}

function weekMonthLabel(weekDates: string[]): string {
	const firstMonth = weekDates[0] ? Number(weekDates[0].slice(5, 7)) : 0;
	const lastMonth = weekDates[weekDates.length - 1]
		? Number(weekDates[weekDates.length - 1].slice(5, 7))
		: 0;
	if (!firstMonth) return '';
	return firstMonth === lastMonth ? String(firstMonth) : `${firstMonth}/${lastMonth}`;
}

function formatDate(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, '0');
	const day = String(date.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
