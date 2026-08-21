import { AcademicCalendarService, todayIsoDate, type Course, type Timetable } from '@chronos/core';
import type { CourseDraft, PeriodTimeDraft, TimetableSettingsDraft } from '$lib/models/drafts';

const academicCalendarService = new AcademicCalendarService();

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
				todayIsoDate()
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
			source: timetable.importMetadata?.source ?? 'UNKNOWN',
			campusId: timetable.importMetadata?.campusId
		},
		viewPrefs: {
			showSaturday: timetable.viewPrefs?.showSaturday ?? true,
			showSunday: timetable.viewPrefs?.showSunday ?? true,
			showNonCurrentWeekCourses: timetable.viewPrefs?.showNonCurrentWeekCourses ?? false
		}
	};
}

export function removePeriodAt(periodTimes: PeriodTimeDraft[], index: number): PeriodTimeDraft[] {
	return periodTimes.filter((_, currentIndex) => currentIndex !== index);
}

export function reindexPeriodTimes(periodTimes: PeriodTimeDraft[]): PeriodTimeDraft[] {
	return periodTimes.map((period, index) => ({ ...period, index: index + 1 }));
}
