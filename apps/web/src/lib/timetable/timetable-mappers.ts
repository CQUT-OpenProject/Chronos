import { AcademicCalendarService, type Course } from '@chronos/core';
import { resolveCampusIdFromApiName, type CqutCampusId } from '$lib/models/cqut-campus';
import type { CourseDraft, PeriodTimeDraft, TimetableSettingsDraft } from '$lib/models/drafts';
import type { Timetable } from '$lib/models/timetable';
import { TimetableImportSource } from '$lib/models/timetable';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';

const academicCalendarService = new AcademicCalendarService();
const timeProvider = new SystemTimeProvider();

function readCampusPeriodTimes(
	timetable: Timetable
): Partial<Record<CqutCampusId, PeriodTimeDraft[]>> | undefined {
	const cqut = timetable.customMetadata?.['source-cqut'] as
		| { campusPeriodTimes?: Record<string, PeriodTimeDraft[]> }
		| undefined;
	if (!cqut?.campusPeriodTimes) return undefined;
	return { ...cqut.campusPeriodTimes } as Partial<Record<CqutCampusId, PeriodTimeDraft[]>>;
}

export function courseToDraft(course: Course): CourseDraft {
	return {
		id: course.id,
		name: course.name,
		teacher: course.teacher,
		location: course.location,
		dayOfWeek: course.dayOfWeek,
		startPeriod: course.startPeriod,
		endPeriod: course.endPeriod,
		color: course.color ?? '',
		textColor: course.textColor ?? '',
		weeks: [...course.weeks],
		remark: course.remark ?? ''
	};
}

export function toSettingsDraft(timetable: Timetable): TimetableSettingsDraft {
	return {
		name: timetable.name,
		academicConfig: {
			termStartDate: academicCalendarService.normalizeTermStartDate(
				timetable.academicConfig?.termStartDate ?? '',
				timeProvider.today()
			),
			startWeek: timetable.academicConfig?.startWeek ?? 1,
			endWeek: timetable.academicConfig?.endWeek ?? 20,
			periodTimes: (timetable.academicConfig?.periodTimes ?? []).map((period) => ({
				index: period.index,
				startTime: period.startTime,
				endTime: period.endTime
			}))
		},
		importMetadata: {
			source: timetable.importMetadata?.source ?? TimetableImportSource.UNKNOWN,
			campusId: timetable.importMetadata?.campusId as CqutCampusId | undefined,
			campusPeriodTimes: readCampusPeriodTimes(timetable)
		},
		viewPrefs: {
			showSaturday: timetable.viewPrefs?.showSaturday ?? true,
			showSunday: timetable.viewPrefs?.showSunday ?? true,
			showNonCurrentWeekCourses: timetable.viewPrefs?.showNonCurrentWeekCourses ?? false
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

export function resolveUserCampusId(value: string | null | undefined): CqutCampusId {
	return resolveCampusIdFromApiName(value);
}

export function shouldShowNonCurrentWeekCourseSetting(
	_importSource?: TimetableImportSource
): boolean {
	return true;
}

export function shouldShowTermStartDateSetting(_importSource?: TimetableImportSource): boolean {
	return true;
}

export function shouldShowAcademicWeekRangeSettings(
	_importSource?: TimetableImportSource
): boolean {
	return true;
}

export function removePeriodAt(periodTimes: PeriodTimeDraft[], index: number): PeriodTimeDraft[] {
	return periodTimes.filter((_, currentIndex) => currentIndex !== index);
}

export function reindexPeriodTimes(periodTimes: PeriodTimeDraft[]): PeriodTimeDraft[] {
	return periodTimes.map((period, index) => ({ ...period, index: index + 1 }));
}
