import { describe, it, expect } from 'vite-plus/test';
import { timetableDayShortLabel } from '../src/timetable-preview/day-labels';

describe('timetable-preview', () => {
	it('maps day of week to short labels', () => {
		expect(timetableDayShortLabel(1)).toBe('一');
		expect(timetableDayShortLabel(7)).toBe('日');
		expect(timetableDayShortLabel(99)).toBe('?');
	});
});
