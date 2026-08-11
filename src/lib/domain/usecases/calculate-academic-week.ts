import type { AcademicConfig } from '$lib/models/timetable';
import { AcademicCalendarService } from '../services/academic-calendar';

export class CalculateAcademicWeekUseCase {
	constructor(private readonly academicCalendarService = new AcademicCalendarService()) {}

	invoke(today: string, academicConfig?: AcademicConfig | null): number {
		return this.academicCalendarService.calculateAcademicWeek(today, academicConfig);
	}
}
