import type { Course } from './course';
import type { PeriodTime } from './timetable';

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

export interface TimetableCourseDisplayModel {
	course: Course;
	isInDisplayedWeek: boolean;
}
