import { describe, expect, it } from 'vite-plus/test';
import { timetableDayLabel, timetableDayShortLabel } from './day-labels';

describe('day-labels', () => {
	it('maps day of week to Chinese labels', () => {
		expect(timetableDayLabel(1)).toBe('周一');
		expect(timetableDayLabel(7)).toBe('周日');
		expect(timetableDayLabel(0)).toBe('');
		expect(timetableDayLabel(99)).toBe('未知');
		expect(timetableDayShortLabel(3)).toBe('三');
		expect(timetableDayShortLabel(99)).toBe('?');
	});
});
