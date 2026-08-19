import type { Course } from './course';

export const CURRENT_TIMETABLE_SCHEMA_VERSION = 1;

export interface PeriodTime {
	index: number;
	startTime: string; // HH:mm (24-hour)
	endTime: string; // HH:mm
}

export interface AcademicConfig {
	termStartDate: string; // YYYY-MM-DD
	startWeek: number; // default: 1
	endWeek: number; // default: 20
	periodTimes: PeriodTime[]; // Active period timetable schedule
}

export interface TimetableViewPrefs {
	showSaturday: boolean;
	showSunday: boolean;
	showNonCurrentWeekCourses: boolean;
}

export interface Timetable {
	schemaVersion: number; // Explicit schema version identifier (currently 1)
	id: string;
	name: string;
	courses: Course[];
	academicConfig: AcademicConfig;
	viewPrefs: TimetableViewPrefs;
	createdAt: number;
	updatedAt: number;
	/** Timetable-level plugin metadata keyed by plugin ID or core system ID */
	customMetadata?: Record<string, unknown>;
}

export const DEFAULT_TIMETABLE_NAME = 'Untitled Timetable';

export function normalizeTimetableName(name: string): string {
	const trimmed = name.trim();
	return trimmed.length > 0 ? trimmed : DEFAULT_TIMETABLE_NAME;
}

export function createTimetable(
	partial: Omit<
		Timetable,
		'schemaVersion' | 'academicConfig' | 'viewPrefs' | 'createdAt' | 'updatedAt' | 'courses'
	> &
		Partial<
			Pick<
				Timetable,
				'schemaVersion' | 'academicConfig' | 'viewPrefs' | 'createdAt' | 'updatedAt' | 'courses'
			>
		>
): Timetable {
	const now = Date.now();
	return {
		schemaVersion: partial.schemaVersion ?? CURRENT_TIMETABLE_SCHEMA_VERSION,
		id: partial.id,
		name: normalizeTimetableName(partial.name),
		courses: partial.courses ?? [],
		academicConfig: {
			termStartDate: partial.academicConfig?.termStartDate ?? '',
			startWeek: partial.academicConfig?.startWeek ?? 1,
			endWeek: partial.academicConfig?.endWeek ?? 20,
			periodTimes: partial.academicConfig?.periodTimes ?? []
		},
		viewPrefs: {
			showSaturday: partial.viewPrefs?.showSaturday ?? true,
			showSunday: partial.viewPrefs?.showSunday ?? true,
			showNonCurrentWeekCourses: partial.viewPrefs?.showNonCurrentWeekCourses ?? false
		},
		createdAt: partial.createdAt ?? now,
		updatedAt: partial.updatedAt ?? now,
		...(partial.customMetadata ? { customMetadata: { ...partial.customMetadata } } : {})
	};
}
