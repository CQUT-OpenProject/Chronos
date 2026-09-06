import type { AcademicConfig, ImportMetadata, PeriodTime, TimetableViewPrefs } from '@chronos/core';
import { defaultPeriodTimes } from '$lib/models/defaults';
import type { TimetableConfig, TimetableImportMetadata } from '$lib/models/timetable';

const SCHEMA_VERSION = 1;

export function encodeTimetableConfig(
	academicConfig: AcademicConfig,
	importMetadata: TimetableImportMetadata,
	viewPrefs: TimetableViewPrefs,
	customMetadata?: Record<string, unknown>
): string {
	const config = {
		schemaVersion: SCHEMA_VERSION,
		academicConfig,
		importMetadata,
		viewPrefs,
		...(customMetadata ? { customMetadata } : {})
	};
	return JSON.stringify(config);
}

export function decodeTimetableConfig(configJson: string, timetableId?: string): TimetableConfig {
	try {
		return decodeParsedConfig(JSON.parse(configJson));
	} catch (error) {
		if (timetableId) {
			console.warn(
				`Failed to decode timetable config (id=${timetableId}, schema=${SCHEMA_VERSION})`,
				error
			);
		}
		return decodeParsedConfig({});
	}
}

function decodeParsedConfig(raw: unknown): TimetableConfig {
	const record = asRecord(raw);
	const importMetadata = slimImportMetadata(decodeImportMetadata(record.importMetadata));
	const customMetadata = decodeCustomMetadata(record.customMetadata);
	return {
		schemaVersion: asInt(record.schemaVersion, SCHEMA_VERSION),
		academicConfig: decodeAcademicConfig(record.academicConfig),
		importMetadata,
		viewPrefs: decodeViewPrefs(record.viewPrefs),
		...(customMetadata ? { customMetadata } : {})
	};
}

function decodeAcademicConfig(raw: unknown): AcademicConfig {
	const record = raw === undefined ? {} : asRecord(raw);
	const holidayCalendar = decodeHolidayCalendar(record.holidayCalendar);
	return {
		termStartDate: asString(record.termStartDate, ''),
		startWeek: asInt(record.startWeek, 1),
		endWeek: asInt(record.endWeek, 20),
		periodTimes:
			record.periodTimes === undefined
				? defaultPeriodTimes()
				: asArray(record.periodTimes).map(decodePeriodTime),
		...(holidayCalendar ? { holidayCalendar } : {})
	};
}

function decodePeriodTime(raw: unknown): PeriodTime {
	const record = asRecord(raw);
	return {
		index: asInt(record.index),
		startTime: asString(record.startTime),
		endTime: asString(record.endTime)
	};
}

function decodeHolidayCalendar(raw: unknown): AcademicConfig['holidayCalendar'] {
	if (raw === undefined) return undefined;
	const record = asRecord(raw);
	const holidays =
		record.holidays === undefined
			? []
			: asArray(record.holidays).map((item) => {
					const holiday = asRecord(item);
					return { date: asString(holiday.date), label: asString(holiday.label) };
				});
	const syncedAt = optionalNumber(record.syncedAt);
	const syncedYears =
		record.syncedYears === undefined
			? undefined
			: asArray(record.syncedYears).map((year) => asInt(year));
	return {
		holidays,
		...(syncedAt === undefined ? {} : { syncedAt }),
		...(syncedYears === undefined ? {} : { syncedYears })
	};
}

function decodeViewPrefs(raw: unknown): TimetableViewPrefs {
	const record = raw === undefined ? {} : asRecord(raw);
	return {
		showSaturday: asBoolean(record.showSaturday, true),
		showSunday: asBoolean(record.showSunday, true),
		showNonCurrentWeekCourses: asBoolean(record.showNonCurrentWeekCourses, false)
	};
}

function decodeImportMetadata(raw: unknown): { source: string; campusId?: string } {
	const record = raw === undefined ? {} : asRecord(raw);
	const campusId = optionalString(record.campusId);
	return {
		source: asString(record.source, 'UNKNOWN'),
		...(campusId === undefined ? {} : { campusId })
	};
}

function decodeCustomMetadata(raw: unknown): Record<string, unknown> | undefined {
	if (raw === undefined) return undefined;
	return asRecord(raw);
}

function slimImportMetadata(raw: { source: string; campusId?: string }): ImportMetadata {
	const source = raw.source.trim() || 'UNKNOWN';
	const campusId = raw.campusId?.trim();
	return campusId ? { source, campusId } : { source };
}

function asRecord(value: unknown): Record<string, unknown> {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		throw new Error('expected object');
	}
	return value as Record<string, unknown>;
}

function asArray(value: unknown): unknown[] {
	if (!Array.isArray(value)) throw new Error('expected array');
	return value;
}

function asInt(value: unknown, fallback?: number): number {
	if (value === undefined && fallback !== undefined) return fallback;
	if (typeof value === 'number' && Number.isInteger(value)) return value;
	throw new Error('expected integer');
}

function asString(value: unknown, fallback?: string): string {
	if (value === undefined && fallback !== undefined) return fallback;
	if (typeof value === 'string') return value;
	throw new Error('expected string');
}

function asBoolean(value: unknown, fallback: boolean): boolean {
	if (value === undefined) return fallback;
	if (typeof value === 'boolean') return value;
	throw new Error('expected boolean');
}

function optionalString(value: unknown): string | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'string') return value;
	throw new Error('expected string');
}

function optionalNumber(value: unknown): number | undefined {
	if (value === undefined) return undefined;
	if (typeof value === 'number' && !Number.isNaN(value)) return value;
	throw new Error('expected number');
}
