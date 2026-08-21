import type { Course } from '@chronos/core';
import {
	normalizeTimetableName,
	TimetableImportSource,
	type Timetable
} from '$lib/models/timetable';
import type { CourseRow, TimetableRow } from './db';
import { encodeTimetableConfig, decodeTimetableConfig } from './timetable-config-codec';

export function courseToRow(course: Course, timetableId: string): CourseRow {
	return {
		id: course.id,
		timetableId,
		name: course.name,
		teacher: course.teacher,
		location: course.location,
		dayOfWeek: course.dayOfWeek,
		startPeriod: course.startPeriod,
		endPeriod: course.endPeriod,
		color: course.color ?? '',
		textColor: course.textColor ?? '',
		weeksCsv: course.weeks.join(','),
		remark: course.remark ?? ''
	};
}

function parseWeeksCsv(weeksCsv: string): number[] {
	if (!weeksCsv) return [];
	const parts = weeksCsv.split(',');
	const result: number[] = [];
	for (let i = 0; i < parts.length; i += 1) {
		const parsed = Number.parseInt(parts[i]!, 10);
		if (!Number.isNaN(parsed)) {
			result.push(parsed);
		}
	}
	return result;
}

export function courseFromRow(row: CourseRow): Course {
	return {
		id: row.id,
		name: row.name,
		teacher: row.teacher,
		location: row.location,
		dayOfWeek: row.dayOfWeek,
		startPeriod: row.startPeriod,
		endPeriod: row.endPeriod,
		color: row.color,
		textColor: row.textColor,
		weeks: parseWeeksCsv(row.weeksCsv),
		remark: row.remark
	};
}

export function timetableToRow(
	timetable: Timetable | import('@chronos/core').Timetable
): TimetableRow {
	const importMetadata =
		'importMetadata' in timetable && timetable.importMetadata
			? timetable.importMetadata
			: { source: TimetableImportSource.UNKNOWN };

	return {
		id: timetable.id,
		name: normalizeTimetableName(timetable.name),
		createdAt: timetable.createdAt,
		updatedAt: timetable.updatedAt,
		configJson: encodeTimetableConfig(
			timetable.academicConfig,
			importMetadata,
			timetable.viewPrefs,
			timetable.customMetadata
		)
	};
}

export function timetableFromRow(row: TimetableRow, courses: CourseRow[]): Timetable {
	const config = decodeTimetableConfig(row.configJson, row.id);
	return {
		schemaVersion: config.schemaVersion,
		id: row.id,
		name: normalizeTimetableName(row.name),
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		courses: courses.map(courseFromRow),
		academicConfig: config.academicConfig,
		importMetadata: config.importMetadata,
		viewPrefs: config.viewPrefs,
		...(config.customMetadata ? { customMetadata: config.customMetadata } : {})
	};
}
