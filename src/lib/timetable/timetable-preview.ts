import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
import type { AcademicConfig } from '$lib/models/timetable';
import { BuildVisibleTimetableGridUseCase } from '$lib/domain/usecases/build-visible-timetable-grid';
import { BuildTimetableCourseDisplayModelsUseCase } from '$lib/domain/usecases/build-timetable-course-display-models';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';

const buildVisibleTimetableGrid = new BuildVisibleTimetableGridUseCase();
const buildTimetableCourseDisplayModels = new BuildTimetableCourseDisplayModelsUseCase();
const academicCalendarService = new AcademicCalendarService();

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
