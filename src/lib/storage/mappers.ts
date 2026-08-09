import type { Course } from '$lib/models/course';
import { normalizeTimetableName, type Timetable } from '$lib/models/timetable';
import type { TimetableSummary } from '$lib/models/app-state';
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
		color: course.color,
		textColor: course.textColor,
		weeksCsv: course.weeks.join(','),
		remark: course.remark
	};
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
		weeks: row.weeksCsv
			.split(',')
			.map((value) => Number.parseInt(value, 10))
			.filter((value) => !Number.isNaN(value)),
		remark: row.remark
	};
}

export function timetableToRow(timetable: Timetable): TimetableRow {
	return {
		id: timetable.id,
		name: normalizeTimetableName(timetable.name),
		createdAt: timetable.createdAt,
		updatedAt: timetable.updatedAt,
		configJson: encodeTimetableConfig(
			timetable.academicConfig,
			timetable.importMetadata,
			timetable.viewPrefs
		)
	};
}

export function timetableFromRow(row: TimetableRow, courses: CourseRow[]): Timetable {
	const config = decodeTimetableConfig(row.configJson, row.id);
	return {
		id: row.id,
		name: normalizeTimetableName(row.name),
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		courses: courses.map(courseFromRow),
		academicConfig: config.academicConfig,
		importMetadata: config.importMetadata,
		viewPrefs: config.viewPrefs
	};
}

export function summaryFromRow(row: TimetableRow, courseCount: number): TimetableSummary {
	return {
		id: row.id,
		name: normalizeTimetableName(row.name),
		courseCount,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	};
}

export function copyForStateBoundary(timetable: Timetable): Timetable {
	return {
		...timetable,
		name: normalizeTimetableName(timetable.name),
		courses: timetable.courses.map((course) => ({ ...course, weeks: [...course.weeks] })),
		academicConfig: {
			...timetable.academicConfig,
			periodTimes: timetable.academicConfig.periodTimes.map((period) => ({ ...period }))
		},
		importMetadata: {
			...timetable.importMetadata,
			campusPeriodTimes: timetable.importMetadata.campusPeriodTimes
				? (Object.fromEntries(
						Object.entries(timetable.importMetadata.campusPeriodTimes).map(([campus, periods]) => [
							campus,
							periods.map((period) => ({ ...period }))
						])
					) as import('$lib/models/timetable').TimetableImportMetadata['campusPeriodTimes'])
				: undefined
		},
		viewPrefs: { ...timetable.viewPrefs }
	};
}
