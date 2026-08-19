import { defaultPeriodTimes } from '$lib/models/defaults';
import type { Timetable } from '$lib/models/timetable';
import type { TimetableGridModel } from '$lib/models/presentation';
import { AcademicCalendarService } from '../services/academic-calendar';
import { calculateTimetableGrid } from '@chronos/core';

export class BuildVisibleTimetableGridUseCase {
	constructor(private readonly academicCalendarService = new AcademicCalendarService()) {}

	invoke(today: string, displayedWeek: number, timetable: Timetable): TimetableGridModel {
		return calculateTimetableGrid(today, displayedWeek, timetable, {
			academicCalendarService: this.academicCalendarService,
			defaultPeriods: defaultPeriodTimes()
		});
	}
}
