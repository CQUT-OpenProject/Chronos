import type { Timetable } from '$lib/models/timetable';
import type { AcademicConfig } from '$lib/models/timetable';
import {
	AcademicCalendarService,
	addDays,
	buildTimetableCourseDisplayModels,
	calculateTimetableGrid,
	formatIsoDate,
	parseIsoDate,
	type TimetableCourseDisplayModel,
	type TimetableGridModel
} from '@chronos/core';

const academicCalendarService = new AcademicCalendarService();

const fallbackAcademicConfig: AcademicConfig = {
	termStartDate: '',
	startWeek: 1,
	endWeek: 20,
	periodTimes: []
};

export function formatShortDate(iso: string): string {
	const [, month, day] = iso.split('-');
	return `${Number(month)}/${Number(day)}`;
}

export function formatWeekDateRange(
	academicConfig: AcademicConfig | undefined | null,
	week: number,
	today: string,
	viewPrefs?: { showSaturday?: boolean; showSunday?: boolean } | null
): string {
	const config = academicConfig ?? fallbackAcademicConfig;
	const startIso = academicCalendarService.resolveWeekStart(config, week, today);
	let days = 5;
	if (viewPrefs?.showSunday) days = 7;
	else if (viewPrefs?.showSaturday) days = 6;
	const startDate = parseIsoDate(startIso);
	const endDate = addDays(startDate, days - 1);
	return `${formatShortDate(startIso)} - ${formatShortDate(formatIsoDate(endDate))}`;
}

export function invokeCalculateAcademicWeek(
	today: string,
	academicConfig?: AcademicConfig | null
): number {
	return academicCalendarService.calculateAcademicWeek(today, academicConfig);
}

export function invokeBuildVisibleTimetableGrid(
	today: string,
	week: number,
	timetable: Timetable
): TimetableGridModel {
	return calculateTimetableGrid(today, week, timetable);
}

export function invokeBuildTimetableCourseDisplayModels(
	timetable: Timetable,
	visibleDayOfWeeks: Set<number>,
	displayedWeek: number,
	_today: string
): TimetableCourseDisplayModel[] {
	return buildTimetableCourseDisplayModels(timetable, visibleDayOfWeeks, displayedWeek);
}

export function buildTimetableWeekPreview(
	timetable: Timetable,
	today: string,
	displayedWeek: number
): { gridModel: TimetableGridModel; courseDisplayModels: TimetableCourseDisplayModel[] } {
	const gridModel = invokeBuildVisibleTimetableGrid(today, displayedWeek, timetable);
	const courseDisplayModels = invokeBuildTimetableCourseDisplayModels(
		timetable,
		new Set(gridModel.visibleDays.map((day) => day.dayOfWeek)),
		displayedWeek,
		today
	);
	return { gridModel, courseDisplayModels };
}
