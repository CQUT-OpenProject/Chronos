import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { createTimetable, TimetableImportSource } from '$lib/models/timetable';
import {
	applyCampusPeriodTimes,
	mapCampusTimeInfoToPeriodTimes,
	shouldUseOnlineCampusPeriodTimes,
	toSettingsDraft
} from './timetable-mappers';
import type { TimetableSettingsDraft } from '$lib/models/drafts';

describe('timetable-mappers', () => {
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
					liangjiang: [{ index: 1, startTime: '08:30', endTime: '09:15' }],
					huaxi: [{ index: 1, startTime: '08:20', endTime: '09:05' }]
				}
			},
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		};

		expect(applyCampusPeriodTimes(draft, 'huaxi')).toBe(true);
		expect(draft.importMetadata.campusId).toBe('huaxi');
		expect(draft.academicConfig.periodTimes[0]?.startTime).toBe('08:20');
	});

	it('toSettingsDraft reads campus period times from source-cqut metadata', () => {
		const draft = toSettingsDraft(
			sampleTimetable({
				termStartDate: '2026-03-02',
				courses: []
			})
		);
		expect(draft.importMetadata.campusPeriodTimes).toBeUndefined();

		const withMeta = createTimetable({
			id: 'timetable',
			name: '课表',
			courses: [],
			createdAt: 0,
			updatedAt: 0,
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			importMetadata: { source: TimetableImportSource.ONLINE_EDU, campusId: 'huaxi' },
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: true
			},
			customMetadata: {
				'source-cqut': {
					campusPeriodTimes: {
						huaxi: [{ index: 1, startTime: '08:20', endTime: '09:05' }]
					}
				}
			}
		});
		expect(toSettingsDraft(withMeta).importMetadata.campusPeriodTimes?.huaxi?.[0]?.startTime).toBe(
			'08:20'
		);
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
