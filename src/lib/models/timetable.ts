import { z } from 'zod';
import { CQUT_CAMPUS_IDS } from './cqut-campus';
import { defaultPeriodTimes } from './defaults';

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

export type PeriodTime = z.infer<typeof periodTimeSchema>;

export const academicConfigSchema = z.object({
	termStartDate: z.string().default(''),
	startWeek: z.number().int().default(1),
	endWeek: z.number().int().default(20),
	periodTimes: z.array(periodTimeSchema).default(defaultPeriodTimes())
});

export type AcademicConfig = z.infer<typeof academicConfigSchema>;

const cqutCampusIdSchema = z.enum(CQUT_CAMPUS_IDS);

export const timetableImportMetadataSchema = z.object({
	source: z.nativeEnum(TimetableImportSource).default(TimetableImportSource.UNKNOWN),
	campusId: cqutCampusIdSchema.optional(),
	campusPeriodTimes: z.record(cqutCampusIdSchema, z.array(periodTimeSchema)).optional()
});

export type TimetableImportMetadata = z.infer<typeof timetableImportMetadataSchema>;

export const timetableViewPrefsSchema = z.object({
	showSaturday: z.boolean().default(true),
	showSunday: z.boolean().default(true),
	showNonCurrentWeekCourses: z.boolean().default(false)
});

export type TimetableViewPrefs = z.infer<typeof timetableViewPrefsSchema>;

export const timetableConfigSchema = z.object({
	schemaVersion: z.number().int().default(1),
	academicConfig: academicConfigSchema.optional().default(() => academicConfigSchema.parse({})),
	importMetadata: timetableImportMetadataSchema
		.optional()
		.default(() => timetableImportMetadataSchema.parse({})),
	viewPrefs: timetableViewPrefsSchema.optional().default(() => timetableViewPrefsSchema.parse({}))
});

export type TimetableConfig = z.infer<typeof timetableConfigSchema>;

import {
	CURRENT_TIMETABLE_SCHEMA_VERSION,
	DEFAULT_TIMETABLE_NAME,
	normalizeTimetableName
} from '@chronos/core';

export { CURRENT_TIMETABLE_SCHEMA_VERSION, DEFAULT_TIMETABLE_NAME, normalizeTimetableName };

export interface Timetable {
	schemaVersion: number;
	id: string;
	name: string;
	courses: import('@chronos/core').Course[];
	createdAt: number;
	updatedAt: number;
	academicConfig: AcademicConfig;
	importMetadata: TimetableImportMetadata;
	viewPrefs: TimetableViewPrefs;
	customMetadata?: Record<string, unknown>;
}

export function createTimetable(
	partial: Omit<Timetable, 'schemaVersion' | 'academicConfig' | 'importMetadata' | 'viewPrefs'> &
		Partial<Pick<Timetable, 'schemaVersion' | 'academicConfig' | 'importMetadata' | 'viewPrefs'>>
): Timetable {
	const timetable = {
		schemaVersion: CURRENT_TIMETABLE_SCHEMA_VERSION,
		academicConfig: academicConfigSchema.parse({}),
		importMetadata: timetableImportMetadataSchema.parse({}),
		viewPrefs: timetableViewPrefsSchema.parse({}),
		...partial
	};
	return {
		...timetable,
		name: normalizeTimetableName(timetable.name)
	};
}
