import type { AcademicConfig, ImportMetadata, PeriodTime, TimetableViewPrefs } from '@chronos/core';

export type PeriodTimeDraft = PeriodTime;

export interface TimetableSettingsDraft {
	name: string;
	academicConfig: AcademicConfig;
	importMetadata: ImportMetadata;
	viewPrefs: TimetableViewPrefs;
}

export interface CourseDraft {
	id?: string | null;
	name: string;
	teacher: string;
	location: string;
	dayOfWeek: number;
	startPeriod: number;
	endPeriod: number;
	weeks: number[];
	remark: string;
}
