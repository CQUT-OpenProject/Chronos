import type { Timetable } from '$lib/models/timetable';
import type { TimetableCourseDisplayModel } from '$lib/models/presentation';
import { AcademicCalendarService } from '../services/academic-calendar';
import { buildTimetableCourseDisplayModels } from '@chronos/core';

export class BuildTimetableCourseDisplayModelsUseCase {
	constructor(private readonly _academicCalendarService = new AcademicCalendarService()) {}

	invoke(
		timetable: Timetable,
		visibleDayOfWeeks: Set<number>,
		displayedWeek: number,
		_today: string
	): TimetableCourseDisplayModel[] {
		return buildTimetableCourseDisplayModels(timetable, visibleDayOfWeeks, displayedWeek);
	}
}
