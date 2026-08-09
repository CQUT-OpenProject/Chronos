import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '$lib/models/course';
import { createTimetable, TimetableImportSource } from '$lib/models/timetable';
import {
	applyCampusPeriodTimes,
	ensureOnlineCampusMetadata,
	mapCampusTimeInfoToPeriodTimes,
	shouldUseOnlineCampusPeriodTimes,
	shouldShowAcademicWeekRangeSettings,
	shouldShowNonCurrentWeekCourseSetting,
	shouldShowTermStartDateSetting,
	toSettingsDraft
} from './timetable-mappers';
import type { TimetableSettingsDraft } from '$lib/models/drafts';

describe('timetable-mappers', () => {
	it('settings visibility depends on import source', () => {
		expect(shouldShowNonCurrentWeekCourseSetting(TimetableImportSource.ONLINE_EDU)).toBe(true);
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

	it('online campus helpers apply cached period times', () => {
		expect(shouldUseOnlineCampusPeriodTimes(TimetableImportSource.ONLINE_EDU)).toBe(true);
		expect(shouldUseOnlineCampusPeriodTimes(TimetableImportSource.FILE_HTML)).toBe(false);

		const rows = mapCampusTimeInfoToPeriodTimes([
			{
				campusName: '两江校区',
				sessionNum: 2,
				startTime: '09:25',
				endTime: '10:10'
			},
			{
				campusName: '两江校区',
				sessionNum: 1,
				startTime: '08:30',
				endTime: '09:15'
			}
		]);
		expect(rows).toEqual([
			{ index: 1, startTime: '08:30', endTime: '09:15' },
			{ index: 2, startTime: '09:25', endTime: '10:10' }
		]);

		const draft: TimetableSettingsDraft = {
			name: '课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			importMetadata: {
				source: TimetableImportSource.ONLINE_EDU,
				campusPeriodTimes: {
					两江校区: [{ index: 1, startTime: '08:30', endTime: '09:15' }],
					花溪校区: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
				}
			},
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		};

		expect(applyCampusPeriodTimes(draft, '花溪校区')).toBe(true);
		expect(draft.importMetadata.campusName).toBe('花溪校区');
		expect(draft.academicConfig.periodTimes[0]?.startTime).toBe('08:00');

		const legacyDraft: TimetableSettingsDraft = {
			...draft,
			importMetadata: { source: TimetableImportSource.ONLINE_EDU },
			academicConfig: {
				...draft.academicConfig,
				periodTimes: [{ index: 1, startTime: '08:30', endTime: '09:15' }]
			}
		};
		ensureOnlineCampusMetadata(legacyDraft);
		expect(legacyDraft.importMetadata.campusName).toBe('两江校区');
		expect(legacyDraft.importMetadata.campusPeriodTimes?.两江校区).toEqual([
			{ index: 1, startTime: '08:30', endTime: '09:15' }
		]);
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
