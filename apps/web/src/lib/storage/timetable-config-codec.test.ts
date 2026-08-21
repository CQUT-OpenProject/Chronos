import { describe, expect, it } from 'vite-plus/test';
import { encodeTimetableConfig, decodeTimetableConfig } from './timetable-config-codec';

describe('TimetableConfigJsonCodec', () => {
	it('decodes current config shape', () => {
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

		const encoded = encodeTimetableConfig(academicConfig, importMetadata, viewPrefs);
		const decoded = decodeTimetableConfig(encoded);

		expect(decoded.academicConfig).toEqual(academicConfig);
		expect(decoded.importMetadata).toEqual(importMetadata);
		expect(decoded.viewPrefs).toEqual(viewPrefs);
		expect(decoded.schemaVersion).toBe(1);
	});

	it('migrates legacy campusPeriodTimes off importMetadata', () => {
		const encoded = JSON.stringify({
			schemaVersion: 1,
			academicConfig: {
				termStartDate: '2026-02-23',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [{ index: 1, startTime: '08:20', endTime: '09:05' }]
			},
			importMetadata: {
				source: 'ONLINE_EDU',
				campusId: 'huaxi',
				campusPeriodTimes: {
					huaxi: [{ index: 1, startTime: '08:20', endTime: '09:05' }]
				}
			},
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		});
		const decoded = decodeTimetableConfig(encoded);
		expect(decoded.importMetadata).toEqual({
			source: 'ONLINE_EDU',
			campusId: 'huaxi'
		});
		expect(
			(decoded.customMetadata?.['source-cqut'] as { campusPeriodTimes?: { huaxi?: unknown } })
				?.campusPeriodTimes?.huaxi
		).toEqual([{ index: 1, startTime: '08:20', endTime: '09:05' }]);
	});
});
