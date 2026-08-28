import { z } from 'zod';
import {
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

export { DEFAULT_TIMETABLE_NAME, normalizeTimetableName, createTimetable };
export type { AcademicConfig, PeriodTime, Timetable, TimetableViewPrefs };
export type TimetableImportMetadata = ImportMetadata;

const periodTimeSchema = z.object({
	index: z.number().int(),
	startTime: z.string(),
	endTime: z.string()
});

const calendarHolidaySchema = z.object({
	date: z.string(),
	label: z.string()
});

const holidayCalendarConfigSchema = z.object({
	holidays: z.array(calendarHolidaySchema).default([]),
	syncedAt: z.number().optional(),
	syncedYears: z.array(z.number().int()).optional()
});

export const academicConfigSchema = z.object({
	termStartDate: z.string().default(''),
	startWeek: z.number().int().default(1),
	endWeek: z.number().int().default(20),
	periodTimes: z.array(periodTimeSchema).default(defaultPeriodTimes()),
	holidayCalendar: holidayCalendarConfigSchema.optional()
});

export const timetableViewPrefsSchema = z.object({
	showSaturday: z.boolean().default(true),
	showSunday: z.boolean().default(true),
	showNonCurrentWeekCourses: z.boolean().default(false)
});

export const timetableImportMetadataSchema = z.object({
	source: z.string().default('UNKNOWN'),
	campusId: z.string().optional()
});

export const timetableConfigSchema = z.object({
	schemaVersion: z.number().int().default(1),
	academicConfig: academicConfigSchema.optional().default(() => academicConfigSchema.parse({})),
	importMetadata: timetableImportMetadataSchema
		.optional()
		.default(() => timetableImportMetadataSchema.parse({})),
	viewPrefs: timetableViewPrefsSchema.optional().default(() => timetableViewPrefsSchema.parse({})),
	customMetadata: z.record(z.string(), z.unknown()).optional()
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
	const source = raw.source.trim() || 'UNKNOWN';
	const campusId = raw.campusId?.trim();
	return campusId ? { source, campusId } : { source };
}
