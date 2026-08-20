import { z } from 'zod';
import {
	CURRENT_TIMETABLE_SCHEMA_VERSION,
	DEFAULT_TIMETABLE_NAME,
	normalizeTimetableName,
	createTimetable,
	type AcademicConfig,
	type ImportMetadata,
	type PeriodTime,
	type Timetable,
	type TimetableViewPrefs
} from '@chronos/core';
import { defaultPeriodTimes } from './defaults';

export {
	CURRENT_TIMETABLE_SCHEMA_VERSION,
	DEFAULT_TIMETABLE_NAME,
	normalizeTimetableName,
	createTimetable
};
export type { AcademicConfig, PeriodTime, Timetable, TimetableViewPrefs };
export type TimetableImportMetadata = ImportMetadata;

export enum TimetableImportSource {
	UNKNOWN = 'UNKNOWN',
	ONLINE_EDU = 'ONLINE_EDU',
	FILE_HTML = 'FILE_HTML',
	SHARED_JSON = 'SHARED_JSON'
}

export const periodTimeSchema = z.object({
	index: z.number().int(),
	startTime: z.string(),
	endTime: z.string()
});

export const academicConfigSchema = z.object({
	termStartDate: z.string().default(''),
	startWeek: z.number().int().default(1),
	endWeek: z.number().int().default(20),
	periodTimes: z.array(periodTimeSchema).default(defaultPeriodTimes())
});

export const timetableViewPrefsSchema = z.object({
	showSaturday: z.boolean().default(true),
	showSunday: z.boolean().default(true),
	showNonCurrentWeekCourses: z.boolean().default(false)
});

const campusPeriodTimesSchema = z.record(z.string(), z.array(periodTimeSchema)).optional();

export const timetableImportMetadataSchema = z.object({
	source: z.string().default(TimetableImportSource.UNKNOWN),
	campusId: z.string().optional(),
	campusPeriodTimes: campusPeriodTimesSchema
});

export const timetableConfigSchema = z.object({
	schemaVersion: z.number().int().default(1),
	academicConfig: academicConfigSchema.optional().default(() => academicConfigSchema.parse({})),
	importMetadata: timetableImportMetadataSchema
		.optional()
		.default(() => timetableImportMetadataSchema.parse({})),
	viewPrefs: timetableViewPrefsSchema.optional().default(() => timetableViewPrefsSchema.parse({})),
	customMetadata: z.record(z.unknown()).optional()
});

export type StoredTimetableImportMetadata = z.infer<typeof timetableImportMetadataSchema>;

export type TimetableConfig = {
	schemaVersion: number;
	academicConfig: AcademicConfig;
	importMetadata: ImportMetadata;
	viewPrefs: TimetableViewPrefs;
	customMetadata?: Record<string, unknown>;
};

export function slimImportMetadata(raw: StoredTimetableImportMetadata): ImportMetadata {
	const source = raw.source.trim() || TimetableImportSource.UNKNOWN;
	const campusId = raw.campusId?.trim();
	return campusId ? { source, campusId } : { source };
}
