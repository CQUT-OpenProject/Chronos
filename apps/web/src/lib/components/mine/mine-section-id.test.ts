import { describe, expect, it } from 'vite-plus/test';
import { DEFAULT_MINE_SECTION_ID } from '@chronos/core';
import { MINE_FALLBACK_SECTION_ID, resolveMineSectionId } from './mine-section-id';

describe('resolveMineSectionId', () => {
	const registered = new Set(['timetable-management', DEFAULT_MINE_SECTION_ID]);

	it('keeps a registered host section', () => {
		expect(resolveMineSectionId('timetable-management', registered)).toBe('timetable-management');
	});

	it('uses app-support when sectionId is omitted', () => {
		expect(resolveMineSectionId(undefined, registered)).toBe(DEFAULT_MINE_SECTION_ID);
	});

	it('buckets unmatched plugin section ids into one fallback', () => {
		expect(resolveMineSectionId('tool-error-log', registered)).toBe(MINE_FALLBACK_SECTION_ID);
		expect(resolveMineSectionId('tool-clock', registered)).toBe(MINE_FALLBACK_SECTION_ID);
	});
});
