import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
import type { AcademicConfig } from '$lib/models/timetable';
import { BuildVisibleTimetableGridUseCase } from '$lib/domain/usecases/build-visible-timetable-grid';
import { BuildTimetableCourseDisplayModelsUseCase } from '$lib/domain/usecases/build-timetable-course-display-models';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';

import { addDays, formatIsoDate, parseIsoDate } from '$lib/domain/date';

const buildVisibleTimetableGrid = new BuildVisibleTimetableGridUseCase();
const buildTimetableCourseDisplayModels = new BuildTimetableCourseDisplayModelsUseCase();
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
	return buildVisibleTimetableGrid.invoke(today, week, timetable);
}

export function invokeBuildTimetableCourseDisplayModels(
	timetable: Timetable,
	visibleDayOfWeeks: Set<number>,
	displayedWeek: number,
	today: string
): TimetableCourseDisplayModel[] {
	return buildTimetableCourseDisplayModels.invoke(
		timetable,
		visibleDayOfWeeks,
		displayedWeek,
		today
	);
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
