import type { Course } from '$lib/models/course';
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
			source: timetable.importMetadata.source
		},
		viewPrefs: {
			showSaturday: timetable.viewPrefs.showSaturday,
			showSunday: timetable.viewPrefs.showSunday,
			showNonCurrentWeekCourses: timetable.viewPrefs.showNonCurrentWeekCourses
		}
	};
}

export function shouldShowNonCurrentWeekCourseSetting(
	importSource: TimetableImportSource
): boolean {
	return importSource !== TimetableImportSource.ONLINE_EDU;
}

export function shouldShowTermStartDateSetting(importSource: TimetableImportSource): boolean {
	return importSource !== TimetableImportSource.ONLINE_EDU;
}

export function shouldShowAcademicWeekRangeSettings(importSource: TimetableImportSource): boolean {
	return importSource !== TimetableImportSource.ONLINE_EDU;
}

export function replacePeriodAt(
	periodTimes: PeriodTimeDraft[],
	index: number,
	item: PeriodTimeDraft
): PeriodTimeDraft[] {
	return periodTimes.map((current, currentIndex) => (currentIndex === index ? item : current));
}

export function removePeriodAt(periodTimes: PeriodTimeDraft[], index: number): PeriodTimeDraft[] {
	return periodTimes.filter((_, currentIndex) => currentIndex !== index);
}

export function reindexPeriodTimes(periodTimes: PeriodTimeDraft[]): PeriodTimeDraft[] {
	return periodTimes.map((period, index) => ({ ...period, index: index + 1 }));
}
