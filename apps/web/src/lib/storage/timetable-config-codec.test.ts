import { describe, expect, it } from 'vite-plus/test';
import { encodeTimetableConfig, decodeTimetableConfig } from './timetable-config-codec';
import { defaultPeriodTimes } from '$lib/models/defaults';

const academicConfig = {
	termStartDate: '2026-02-23',
	startWeek: 2,
	endWeek: 18,
	periodTimes: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
};
const importMetadata = { source: 'FILE_HTML' };
const viewPrefs = {
	showSaturday: false,
	showSunday: true,
	showNonCurrentWeekCourses: true
};

function defaultDecoded() {
	return {
		schemaVersion: 1,
		academicConfig: {
			termStartDate: '',
			startWeek: 1,
			endWeek: 20,
			periodTimes: defaultPeriodTimes()
		},
		importMetadata: { source: 'UNKNOWN' },
		viewPrefs: {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: false
		}
	};
}

describe('TimetableConfigJsonCodec', () => {
	it('decodes current config shape', () => {
		const encoded = encodeTimetableConfig(academicConfig, importMetadata, viewPrefs);
		const decoded = decodeTimetableConfig(encoded);

		expect(decoded.academicConfig).toEqual(academicConfig);
		expect(decoded.importMetadata).toEqual(importMetadata);
		expect(decoded.viewPrefs).toEqual(viewPrefs);
		expect(decoded.schemaVersion).toBe(1);
	});

	it('fills missing fields with defaults', () => {
		const decoded = decodeTimetableConfig('{}');
		expect(decoded).toEqual(defaultDecoded());
	});

	it('fills nested academic defaults when only some fields are present', () => {
		const decoded = decodeTimetableConfig(
			JSON.stringify({ academicConfig: { termStartDate: '2026-02-23' } })
		);
		expect(decoded.academicConfig.termStartDate).toBe('2026-02-23');
		expect(decoded.academicConfig.startWeek).toBe(1);
		expect(decoded.academicConfig.endWeek).toBe(20);
		expect(decoded.academicConfig.periodTimes).toEqual(defaultPeriodTimes());
	});

	it('strips unknown keys and keeps empty periodTimes', () => {
		const decoded = decodeTimetableConfig(
			JSON.stringify({
				schemaVersion: 1,
				extra: true,
				academicConfig: { ...academicConfig, leftover: 'x' },
				importMetadata,
				viewPrefs
			})
		);
		expect(decoded).toEqual({
			schemaVersion: 1,
			academicConfig,
			importMetadata,
			viewPrefs
		});
		expect(decoded).not.toHaveProperty('extra');

		const emptyPeriods = decodeTimetableConfig(
			JSON.stringify({ academicConfig: { periodTimes: [] } })
		);
		expect(emptyPeriods.academicConfig.periodTimes).toEqual([]);
	});

	it('decodes holiday calendar and custom metadata', () => {
		const decoded = decodeTimetableConfig(
			JSON.stringify({
				academicConfig: {
					holidayCalendar: {
						holidays: [{ date: '2026-10-01', label: '国庆' }],
						syncedAt: 1,
						syncedYears: [2026]
					}
				},
				importMetadata: { source: '  FILE_HTML  ', campusId: '  a  ' },
				customMetadata: { plugin: { on: true } }
			})
		);
		expect(decoded.academicConfig.holidayCalendar).toEqual({
			holidays: [{ date: '2026-10-01', label: '国庆' }],
			syncedAt: 1,
			syncedYears: [2026]
		});
		expect(decoded.importMetadata).toEqual({ source: 'FILE_HTML', campusId: 'a' });
		expect(decoded.customMetadata).toEqual({ plugin: { on: true } });
	});

	it('falls back to defaults for invalid JSON or wrong types', () => {
		expect(decodeTimetableConfig('not-json')).toEqual(defaultDecoded());
		expect(decodeTimetableConfig(JSON.stringify({ schemaVersion: '1' }))).toEqual(defaultDecoded());
		expect(decodeTimetableConfig(JSON.stringify({ viewPrefs: { showSaturday: 1 } }))).toEqual(
			defaultDecoded()
		);
	});
});
