import { describe, expect, it } from 'vite-plus/test';
import {
	createTimetable,
	DEFAULT_TIMETABLE_NAME,
	normalizeTimetableName,
	TIMETABLE_NAME_MAX_LENGTH
} from './timetable';

describe('timetable name normalization', () => {
	it('uses default name when empty', () => {
		expect(normalizeTimetableName('')).toBe(DEFAULT_TIMETABLE_NAME);
		expect(normalizeTimetableName('   ')).toBe(DEFAULT_TIMETABLE_NAME);
	});

	it('trims non-empty names', () => {
		expect(normalizeTimetableName(' 知行理工 ')).toBe('知行理工');
	});

	it('truncates names longer than TIMETABLE_NAME_MAX_LENGTH', () => {
		const longName = '课'.repeat(TIMETABLE_NAME_MAX_LENGTH + 5);
		expect(normalizeTimetableName(longName)).toBe('课'.repeat(TIMETABLE_NAME_MAX_LENGTH));
	});

	it('normalizes names in createTimetable', () => {
		const timetable = createTimetable({
			id: 't1',
			name: '   ',
			courses: [],
			createdAt: 1,
			updatedAt: 1,
			importMetadata: { source: 'UNKNOWN' }
		});
		expect(timetable.name).toBe(DEFAULT_TIMETABLE_NAME);
	});
});
