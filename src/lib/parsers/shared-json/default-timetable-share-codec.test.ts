import { describe, expect, it } from 'vite-plus/test';
import { TimetableImportSource } from '$lib/models/timetable';
import { createTimetable } from '$lib/models/timetable';
import { DefaultTimetableShareCodec } from './default-timetable-share-codec';
import type { TimeProvider } from '$lib/domain/services/time-provider';

const fixedTimeProvider: TimeProvider = {
	today: () => '2026-03-18',
	currentTime: () => '09:00',
	currentTimeMillis: () => 100
};

describe('DefaultTimetableShareCodec', () => {
	const codec = new DefaultTimetableShareCodec(undefined, fixedTimeProvider);

	it('encode and decode preserve key timetable semantics', () => {
		const timetable = sampleTimetable(TimetableImportSource.SHARED_JSON);
		const encoded = codec.encode(timetable);
		expect(encoded.ok).toBe(true);
		if (!encoded.ok) return;

		const payload = codec.decode(encoded.value);
		expect(payload.ok).toBe(true);
		if (!payload.ok) return;

		const imported = codec.toTimetable(payload.value);
		expect(imported.ok).toBe(true);
		if (!imported.ok) return;

		expect(payload.value.yearTerm).toBe(timetable.name);
		expect(payload.value.importSource).toBe(TimetableImportSource.SHARED_JSON);
		expect(payload.value.termStartDate).toBe('2026-03-02');
		expect(imported.value.importMetadata.source).toBe(TimetableImportSource.SHARED_JSON);
		expect(imported.value.academicConfig.termStartDate).toBe('2026-03-02');
		expect(imported.value.viewPrefs.showSaturday).toBe(true);
		expect(imported.value.courses[0]?.remark).toBe('带教材第 3 版');
		expect(encoded.value).toContain('"yt"');
		expect(encoded.value).toContain('"el"');
	});

	it('online import export omits term start date', () => {
		const timetable = sampleTimetable(TimetableImportSource.ONLINE_EDU);
		const encoded = codec.encode(timetable);
		expect(encoded.ok).toBe(true);
		if (!encoded.ok) return;

		const payload = codec.decode(encoded.value);
		expect(payload.ok).toBe(true);
		if (!payload.ok) return;

		expect(payload.value.importSource).toBe(TimetableImportSource.ONLINE_EDU);
		expect(payload.value.termStartDate).toBeNull();
		expect(encoded.value).not.toContain('"ts"');
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
});

function sampleTimetable(importSource: TimetableImportSource) {
	return createTimetable({
		id: 't1',
		name: '2025-2026学年第2学期',
		courses: [
			{
				id: 'c1',
				name: '编译原理',
				teacher: '张老师',
				location: 'B201',
				dayOfWeek: 6,
				startPeriod: 1,
				endPeriod: 2,
				color: '#EADDFF',
				textColor: '#21005D',
				weeks: [1, 2, 3],
				remark: '带教材第 3 版'
			}
		],
		createdAt: 1,
		updatedAt: 1,
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: []
		},
		importMetadata: { source: importSource },
		viewPrefs: {
			showSaturday: true,
			showSunday: false,
			showNonCurrentWeekCourses: false
		}
	});
}
