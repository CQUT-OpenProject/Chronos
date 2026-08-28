import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '@chronos/core';
import { createTimetable } from '$lib/models/timetable';
import {
	courseToDraft,
	reindexPeriodTimes,
	removePeriodAt,
	toSettingsDraft
} from './timetable-mappers';

describe('timetable-mappers', () => {
	it('toSettingsDraft omits plugin-managed holidayCalendar', () => {
		const draft = toSettingsDraft(
			sampleTimetable({
				academicConfig: {
					termStartDate: '2026-03-02',
					startWeek: 1,
					endWeek: 20,
					periodTimes: [],
					holidayCalendar: {
						holidays: [{ date: '2026-10-01', label: '国庆节' }],
						syncedAt: 1,
						syncedYears: [2026]
					}
				}
			})
		);
		expect(draft.academicConfig.holidayCalendar).toBeUndefined();
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

	it('converts course to draft and manages period items', () => {
		const course = createCourse({
			id: 'c1',
			name: '高等数学',
			teacher: '张老师',
			location: 'A101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 2, 3]
		});
		const draft = courseToDraft(course);
		expect(draft.name).toBe('高等数学');
		expect(draft.teacher).toBe('张老师');
		expect(draft.weeks).toEqual([1, 2, 3]);

		const periods = [
			{ index: 1, startTime: '08:00', endTime: '08:45' },
			{ index: 2, startTime: '08:55', endTime: '09:40' },
			{ index: 3, startTime: '10:00', endTime: '10:45' }
		];
		const removed = removePeriodAt(periods, 1);
		expect(removed).toHaveLength(2);
		const reindexed = reindexPeriodTimes(removed);
		expect(reindexed[0]?.index).toBe(1);
		expect(reindexed[1]?.index).toBe(2);
	});
});

function sampleTimetable({
	termStartDate = '2026-03-02',
	courses = [],
	academicConfig
}: {
	termStartDate?: string;
	courses?: ReturnType<typeof createCourse>[];
	academicConfig?: Parameters<typeof createTimetable>[0]['academicConfig'];
}) {
	return createTimetable({
		id: 'timetable',
		name: '课表',
		courses,
		createdAt: 0,
		updatedAt: 0,
		academicConfig: academicConfig ?? {
			termStartDate,
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: 'UNKNOWN' },
		viewPrefs: {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		}
	});
}
