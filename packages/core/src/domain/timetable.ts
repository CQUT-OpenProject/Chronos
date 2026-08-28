import type { Course } from './course';

export const CURRENT_TIMETABLE_SCHEMA_VERSION = 1;

export interface PeriodTime {
	index: number;
	startTime: string; // HH:mm (24-hour)
	endTime: string; // HH:mm
}

export interface CalendarHoliday {
	date: string; // YYYY-MM-DD
	label: string;
}

export interface HolidayCalendarConfig {
	holidays: CalendarHoliday[];
	syncedAt?: number;
	syncedYears?: number[];
}

export interface AcademicConfig {
	termStartDate: string; // YYYY-MM-DD
	startWeek: number; // default: 1
	endWeek: number; // default: 20
	periodTimes: PeriodTime[]; // Active period timetable schedule
	holidayCalendar?: HolidayCalendarConfig;
}

export interface TimetableViewPrefs {
	showSaturday: boolean;
	showSunday: boolean;
	showNonCurrentWeekCourses: boolean;
}

/**
 * Derive initial weekend-column visibility from actual course occupancy.
 * Single source for import-constructing plugins (source/codec); users may
 * still override both flags afterwards via timetable details editing.
 */
export function deriveWeekendViewPrefs(
	courses: ReadonlyArray<Pick<Course, 'dayOfWeek'>>
): Pick<TimetableViewPrefs, 'showSaturday' | 'showSunday'> {
	return {
		showSaturday: courses.some((course) => course.dayOfWeek === 6),
		showSunday: courses.some((course) => course.dayOfWeek === 7)
	};
}

export interface ImportMetadata {
	source: string;
	campusId?: string;
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
	importMetadata?: ImportMetadata;
	/** Timetable-level plugin metadata keyed by plugin ID or core system ID */
	customMetadata?: Record<string, unknown>;
}

export const DEFAULT_TIMETABLE_NAME = '未命名课表';

export function normalizeTimetableName(name: string): string {
	const trimmed = name.trim();
	return trimmed.length > 0 ? trimmed : DEFAULT_TIMETABLE_NAME;
}

export function normalizeImportMetadata(meta?: ImportMetadata | null): ImportMetadata | undefined {
	if (!meta) return undefined;
	const source = meta.source.trim() || 'UNKNOWN';
	const campusId = meta.campusId?.trim();
	return campusId ? { source, campusId } : { source };
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
	const importMetadata = normalizeImportMetadata(partial.importMetadata);
	const courses = partial.courses ?? [];
	return {
		schemaVersion: partial.schemaVersion ?? CURRENT_TIMETABLE_SCHEMA_VERSION,
		id: partial.id,
		name: normalizeTimetableName(partial.name),
		courses,
		academicConfig: {
			termStartDate: partial.academicConfig?.termStartDate ?? '',
			startWeek: partial.academicConfig?.startWeek ?? 1,
			endWeek: partial.academicConfig?.endWeek ?? 20,
			periodTimes: partial.academicConfig?.periodTimes ?? [],
			...(partial.academicConfig?.holidayCalendar
				? {
						holidayCalendar: {
							...partial.academicConfig.holidayCalendar,
							holidays: [...partial.academicConfig.holidayCalendar.holidays]
						}
					}
				: {})
		},
		viewPrefs: {
			showSaturday: partial.viewPrefs?.showSaturday ?? true,
			showSunday: partial.viewPrefs?.showSunday ?? true,
			showNonCurrentWeekCourses: partial.viewPrefs?.showNonCurrentWeekCourses ?? false
		},
		createdAt: partial.createdAt ?? now,
		updatedAt: partial.updatedAt ?? now,
		...(importMetadata ? { importMetadata } : {}),
		...(partial.customMetadata ? { customMetadata: { ...partial.customMetadata } } : {})
	};
}
