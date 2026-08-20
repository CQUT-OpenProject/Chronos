import { describe, expect, it } from 'vite-plus/test';
import {
	createTimetable,
	DEFAULT_TIMETABLE_NAME,
	normalizeTimetableName,
	TimetableImportSource
} from './timetable';

describe('timetable name normalization', () => {
	it('uses default name when empty', () => {
		expect(normalizeTimetableName('')).toBe(DEFAULT_TIMETABLE_NAME);
		expect(normalizeTimetableName('   ')).toBe(DEFAULT_TIMETABLE_NAME);
	});

	it('trims non-empty names', () => {
		expect(normalizeTimetableName(' 知行理工 ')).toBe('知行理工');
	});

	it('normalizes names in createTimetable', () => {
		const timetable = createTimetable({
			id: 't1',
			name: '   ',
			courses: [],
			createdAt: 1,
			updatedAt: 1,
			importMetadata: { source: TimetableImportSource.UNKNOWN }
		});
		expect(timetable.name).toBe(DEFAULT_TIMETABLE_NAME);
	});
});
