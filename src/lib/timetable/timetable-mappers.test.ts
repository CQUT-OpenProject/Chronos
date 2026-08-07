import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '$lib/models/course';
import { createTimetable, TimetableImportSource } from '$lib/models/timetable';
import {
	shouldShowAcademicWeekRangeSettings,
	shouldShowNonCurrentWeekCourseSetting,
	shouldShowTermStartDateSetting,
	toSettingsDraft
} from './timetable-mappers';

describe('timetable-mappers', () => {
	it('settings visibility depends on import source', () => {
		expect(shouldShowNonCurrentWeekCourseSetting(TimetableImportSource.ONLINE_EDU)).toBe(false);
		expect(shouldShowTermStartDateSetting(TimetableImportSource.FILE_HTML)).toBe(true);
		expect(shouldShowAcademicWeekRangeSettings(TimetableImportSource.SHARED_JSON)).toBe(true);
	});

	it('toSettingsDraft normalizes non monday term start date', () => {
		const draft = toSettingsDraft(
			sampleTimetable({
				termStartDate: '2026-03-03',
				courses: []
			})
		);
		expect(draft.academicConfig.termStartDate).toBe('2026-03-02');
	});
});

function sampleTimetable({
	termStartDate = '2026-03-02',
	courses = []
}: {
	termStartDate?: string;
	courses?: ReturnType<typeof createCourse>[];
}) {
	return createTimetable({
		id: 'timetable',
		name: '课表',
		courses,
		createdAt: 0,
		updatedAt: 0,
		academicConfig: {
			termStartDate,
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: TimetableImportSource.UNKNOWN },
		viewPrefs: {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		}
	});
}
