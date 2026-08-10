import type { Course } from '$lib/models/course';
import {
	DEFAULT_CQUT_CAMPUS_ID,
	resolveCampusIdFromApiName,
	type CqutCampusId
} from '$lib/models/cqut-campus';
import type { CourseDraft, PeriodTimeDraft, TimetableSettingsDraft } from '$lib/models/drafts';
import type { Timetable } from '$lib/models/timetable';
import { TimetableImportSource } from '$lib/models/timetable';
import { AcademicCalendarService } from '$lib/domain/services/academic-calendar';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';

const academicCalendarService = new AcademicCalendarService();
const timeProvider = new SystemTimeProvider();

export function courseToDraft(course: Course): CourseDraft {
	return {
		id: course.id,
		name: course.name,
		teacher: course.teacher,
		location: course.location,
		dayOfWeek: course.dayOfWeek,
		startPeriod: course.startPeriod,
		endPeriod: course.endPeriod,
		color: course.color,
		textColor: course.textColor,
		weeks: [...course.weeks],
		remark: course.remark
	};
}

export function toSettingsDraft(timetable: Timetable): TimetableSettingsDraft {
	return {
		name: timetable.name,
		academicConfig: {
			termStartDate: academicCalendarService.normalizeTermStartDate(
				timetable.academicConfig.termStartDate,
				timeProvider.today()
			),
			startWeek: timetable.academicConfig.startWeek,
			endWeek: timetable.academicConfig.endWeek,
			periodTimes: timetable.academicConfig.periodTimes.map((period) => ({
				index: period.index,
				startTime: period.startTime,
				endTime: period.endTime
			}))
		},
		importMetadata: {
			source: timetable.importMetadata.source,
			campusId: timetable.importMetadata.campusId,
			campusPeriodTimes: timetable.importMetadata.campusPeriodTimes
				? { ...timetable.importMetadata.campusPeriodTimes }
				: undefined
		},
		viewPrefs: {
			showSaturday: timetable.viewPrefs.showSaturday,
			showSunday: timetable.viewPrefs.showSunday,
			showNonCurrentWeekCourses: timetable.viewPrefs.showNonCurrentWeekCourses
		}
	};
}

export function shouldUseOnlineCampusPeriodTimes(importSource: TimetableImportSource): boolean {
	return importSource === TimetableImportSource.ONLINE_EDU;
}

export interface CampusTimeInfoRow {
	campusName: string;
	sessionNum: number;
	startTime: string;
	endTime: string;
}

export function mapCampusTimeInfoToPeriodTimes(rows: CampusTimeInfoRow[]): PeriodTimeDraft[] {
	return [...rows]
		.sort((left, right) => left.sessionNum - right.sessionNum)
		.map((row) => ({
			index: row.sessionNum,
			startTime: row.startTime,
			endTime: row.endTime
		}));
}

export function applyCampusPeriodTimes(
	draft: TimetableSettingsDraft,
	campusId: CqutCampusId
): boolean {
	const periods = draft.importMetadata.campusPeriodTimes?.[campusId];
	if (!periods?.length) return false;

	draft.importMetadata.campusId = campusId;
	draft.academicConfig.periodTimes = periods.map((period) => ({ ...period }));
	return true;
}

export function ensureOnlineCampusMetadata(draft: TimetableSettingsDraft): void {
	if (!shouldUseOnlineCampusPeriodTimes(draft.importMetadata.source)) return;

	const campusId = draft.importMetadata.campusId ?? DEFAULT_CQUT_CAMPUS_ID;
	draft.importMetadata.campusId = campusId;

	if (!draft.importMetadata.campusPeriodTimes && draft.academicConfig.periodTimes.length > 0) {
		draft.importMetadata.campusPeriodTimes = {
			[campusId]: draft.academicConfig.periodTimes.map((period) => ({ ...period }))
		};
	}
}

export function resolveUserCampusId(value: string | null | undefined): CqutCampusId {
	return resolveCampusIdFromApiName(value);
}

export function shouldShowNonCurrentWeekCourseSetting(
	_importSource: TimetableImportSource
): boolean {
	return true;
}

export function shouldShowTermStartDateSetting(importSource: TimetableImportSource): boolean {
	return importSource !== TimetableImportSource.ONLINE_EDU;
}

export function shouldShowAcademicWeekRangeSettings(importSource: TimetableImportSource): boolean {
	return importSource !== TimetableImportSource.ONLINE_EDU;
}

export function removePeriodAt(periodTimes: PeriodTimeDraft[], index: number): PeriodTimeDraft[] {
	return periodTimes.filter((_, currentIndex) => currentIndex !== index);
}

export function reindexPeriodTimes(periodTimes: PeriodTimeDraft[]): PeriodTimeDraft[] {
	return periodTimes.map((period, index) => ({ ...period, index: index + 1 }));
}
