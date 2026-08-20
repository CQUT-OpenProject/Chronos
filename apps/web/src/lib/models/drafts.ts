import type { CqutCampusId } from './cqut-campus';
import type { PeriodTime, TimetableImportSource } from './timetable';

export interface PeriodTimeDraft {
	index: number;
	startTime: string;
	endTime: string;
}

export interface AcademicConfigDraft {
	termStartDate: string;
	startWeek: number;
	endWeek: number;
	periodTimes: PeriodTimeDraft[];
}

export interface TimetableImportMetadataDraft {
	source: TimetableImportSource | string;
	campusId?: CqutCampusId;
	campusPeriodTimes?: Partial<Record<CqutCampusId, PeriodTime[]>>;
}

export interface TimetableViewPrefsDraft {
	showSaturday: boolean;
	showSunday: boolean;
	showNonCurrentWeekCourses: boolean;
}

export interface TimetableSettingsDraft {
	name: string;
	academicConfig: AcademicConfigDraft;
	importMetadata: TimetableImportMetadataDraft;
	viewPrefs: TimetableViewPrefsDraft;
}

export interface CourseDraft {
	id?: string | null;
	name: string;
	teacher: string;
	location: string;
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	color: string;
	textColor: string;
	weeks: number[];
	remark: string;
}
