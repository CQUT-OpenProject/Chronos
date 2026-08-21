import type { AcademicConfig, ImportMetadata, PeriodTime, TimetableViewPrefs } from '@chronos/core';

export type PeriodTimeDraft = PeriodTime;
export type AcademicConfigDraft = AcademicConfig;
export type TimetableImportMetadataDraft = ImportMetadata;
export type TimetableViewPrefsDraft = TimetableViewPrefs;

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
	color: string;
	textColor: string;
	weeks: number[];
	remark: string;
}
