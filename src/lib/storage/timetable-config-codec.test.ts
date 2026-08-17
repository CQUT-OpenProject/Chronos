import { describe, expect, it } from 'vite-plus/test';
import { TimetableImportSource } from '$lib/models/timetable';
import { encodeTimetableConfig, decodeTimetableConfig } from './timetable-config-codec';

describe('TimetableConfigJsonCodec', () => {
	it('decodes current config shape', () => {
		const academicConfig = {
			termStartDate: '2026-02-23',
			startWeek: 2,
			endWeek: 18,
			periodTimes: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
		};
		const importMetadata = { source: TimetableImportSource.FILE_HTML };
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
});
