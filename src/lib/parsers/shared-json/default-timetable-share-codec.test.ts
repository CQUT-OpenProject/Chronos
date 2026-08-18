import { describe, expect, it } from 'vite-plus/test';
import { emptyOnlineSchedulePayload } from '$lib/models/online-schedule';
import { TimetableImportSource } from '$lib/models/timetable';
import { DefaultTimetableShareCodec } from './default-timetable-share-codec';
import type { TimeProvider } from '$lib/domain/services/time-provider';

const fixedTimeProvider: TimeProvider = {
	today: () => '2026-03-18',
	currentTime: () => '09:00',
	currentTimeMillis: () => 100
};

describe('DefaultTimetableShareCodec', () => {
	const codec = new DefaultTimetableShareCodec(undefined, fixedTimeProvider);

	it('toTimetable preserves key timetable semantics and course data', () => {
		const payload = {
			...emptyOnlineSchedulePayload(),
			yearTerm: '2025-2026学年第2学期',
			weekNum: '3',
			nowMonth: '3',
			importSource: TimetableImportSource.ONLINE_EDU,
			termStartDate: '2026-03-02',
			yearTermList: ['2025-2026学年第2学期'],
			weekList: ['1', '2', '3'],
			weekDayList: [{ weekDay: '六', weekDate: '03/21', today: false }],
			eventList: [
				{
					weekNum: '3',
					weekDay: '6',
					weekList: ['1', '2', '3'],
					weekCover: '1-3周',
					sessionList: ['1', '2'],
					sessionStart: '1',
					sessionLast: '2',
					eventName: '编译原理',
					address: 'B201',
					memberName: '张老师',
					remark: '带教材第 3 版',
					duplicateGroupType: 'none',
					duplicateGroup: 0,
					eventType: 'course',
					eventID: 'c1'
				}
			]
		};

		const imported = codec.toTimetable(payload);
		expect(imported.ok).toBe(true);
		if (!imported.ok) return;

		expect(imported.value.name).toBe('2025-2026学年第2学期');
		expect(imported.value.importMetadata.source).toBe(TimetableImportSource.ONLINE_EDU);
		expect(imported.value.academicConfig.termStartDate).toBe('2026-03-02');
		expect(imported.value.viewPrefs.showSaturday).toBe(true);
		expect(imported.value.courses[0]?.name).toBe('编译原理');
		expect(imported.value.courses[0]?.remark).toBe('带教材第 3 版');
	});

	it('toTimetable infers term start date when not explicitly provided', () => {
		const payload = {
			...emptyOnlineSchedulePayload(),
			yearTerm: '2025-2026-2',
			weekNum: '1',
			nowMonth: '3',
			importSource: TimetableImportSource.ONLINE_EDU,
			termStartDate: null,
			yearTermList: ['2025-2026-2'],
			weekList: ['1'],
			weekDayList: [{ weekDay: '一', weekDate: '03/02', today: true }],
			eventList: [
				{
					weekNum: '1',
					weekDay: '1',
					weekList: ['1'],
					weekCover: '1周',
					sessionList: ['1'],
					sessionStart: '1',
					sessionLast: '1',
					eventName: '编译原理',
					address: 'B201',
					memberName: '张老师',
					remark: '',
					duplicateGroupType: '',
					duplicateGroup: 0,
					eventType: 'course',
					eventID: '1'
				}
			]
		};

		const imported = codec.toTimetable(payload);
		expect(imported.ok).toBe(true);
		if (!imported.ok) return;

		expect(imported.value.academicConfig.termStartDate).toBe('2026-03-02');
	});

	it('toTimetable rejects payload without courses', () => {
		const result = codec.toTimetable({
			yearTerm: '',
			weekNum: '',
			nowMonth: '',
			importSource: '',
			termStartDate: null,
			yearTermList: [],
			weekList: [],
			weekDayList: [],
			eventList: []
		});
		expect(result.ok).toBe(false);
	});

	it('toTimetable applies campus period times from fetch context', () => {
		const payload = {
			...emptyOnlineSchedulePayload(),
			yearTerm: '2025-2026-2',
			importSource: TimetableImportSource.ONLINE_EDU,
			weekList: ['1'],
			eventList: [
				{
					weekNum: '1',
					weekDay: '一',
					weekList: ['1'],
					weekCover: '',
					sessionList: ['1'],
					sessionStart: '1',
					sessionLast: '1',
					eventName: '编译原理',
					address: 'B201',
					memberName: '张老师',
					remark: '',
					duplicateGroupType: '',
					duplicateGroup: 0,
					eventType: 'course',
					eventID: '1'
				}
			]
		};

		const imported = codec.toTimetable(payload, {
			campusId: 'huaxi',
			campusPeriodTimes: {
				liangjiang: [{ index: 1, startTime: '08:30', endTime: '09:15' }],
				huaxi: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
			}
		});
		expect(imported.ok).toBe(true);
		if (!imported.ok) return;

		expect(imported.value.importMetadata.campusId).toBe('huaxi');
		expect(imported.value.academicConfig.periodTimes).toEqual([
			{ index: 1, startTime: '08:00', endTime: '08:45' }
		]);
	});
});
