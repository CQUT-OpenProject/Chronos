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

	it('decode and toTimetable preserve key timetable semantics', () => {
		const json = JSON.stringify({
			yt: '2025-2026学年第2学期',
			wn: '3',
			nm: '3',
			is: TimetableImportSource.SHARED_JSON,
			ts: '2026-03-02',
			yl: ['2025-2026学年第2学期'],
			wl: ['1', '2', '3'],
			wd: [{ wd: '六', dt: '03/21', td: false }],
			el: [
				{
					wn: '3',
					wd: '6',
					wl: ['1', '2', '3'],
					wc: '1-3周',
					sl: ['1', '2'],
					ss: '1',
					se: '2',
					en: '编译原理',
					ad: 'B201',
					mn: '张老师',
					rm: '带教材第 3 版',
					gt: 'none',
					dg: 0,
					et: 'course',
					id: 'c1'
				}
			]
		});

		const payload = codec.decode(json);
		expect(payload.ok).toBe(true);
		if (!payload.ok) return;

		const imported = codec.toTimetable(payload.value);
		expect(imported.ok).toBe(true);
		if (!imported.ok) return;

		expect(payload.value.yearTerm).toBe('2025-2026学年第2学期');
		expect(payload.value.importSource).toBe(TimetableImportSource.SHARED_JSON);
		expect(payload.value.termStartDate).toBe('2026-03-02');
		expect(imported.value.importMetadata.source).toBe(TimetableImportSource.SHARED_JSON);
		expect(imported.value.academicConfig.termStartDate).toBe('2026-03-02');
		expect(imported.value.viewPrefs.showSaturday).toBe(true);
		expect(imported.value.courses[0]?.remark).toBe('带教材第 3 版');
	});

	it('online import decodes payload without term start date', () => {
		const json = JSON.stringify({
			yt: '2025-2026-2',
			wn: '1',
			nm: '3',
			is: TimetableImportSource.ONLINE_EDU,
			yl: ['2025-2026-2'],
			wl: ['1'],
			wd: [{ wd: '一', dt: '03/02', td: true }],
			el: [
				{
					wn: '1',
					wd: '1',
					wl: ['1'],
					wc: '1周',
					sl: ['1'],
					ss: '1',
					se: '1',
					en: '编译原理',
					ad: 'B201',
					mn: '张老师',
					rm: '',
					gt: '',
					dg: 0,
					et: 'course',
					id: '1'
				}
			]
		});

		const payload = codec.decode(json);
		expect(payload.ok).toBe(true);
		if (!payload.ok) return;

		expect(payload.value.importSource).toBe(TimetableImportSource.ONLINE_EDU);
		expect(payload.value.termStartDate).toBeNull();
	});

	it('decode rejects payload without courses', () => {
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

	it('online import applies campus period times from fetch context', () => {
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
