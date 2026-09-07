import {
	DEFAULT_TIMETABLE_NAME,
	normalizeTimetableName,
	createTimetable,
	type AcademicConfig,
	type ImportMetadata,
	type Timetable,
	type TimetableViewPrefs
} from '@chronos/core';

export { DEFAULT_TIMETABLE_NAME, normalizeTimetableName, createTimetable };
export type { AcademicConfig, Timetable, TimetableViewPrefs };
export type TimetableImportMetadata = ImportMetadata;

export type TimetableConfig = {
	schemaVersion: number;
	academicConfig: AcademicConfig;
	importMetadata: ImportMetadata;
	viewPrefs: TimetableViewPrefs;
	customMetadata?: Record<string, unknown>;
};
