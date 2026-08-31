import { describe, it, expect } from 'vite-plus/test';
import { timetableDayShortLabel } from '../src/timetable-preview/day-labels';

describe('timetable-preview', () => {
	it('maps day of week to short labels', () => {
		const t = (key: string) =>
			(
				({
					'timetable.dayShort.mon': '一',
					'timetable.dayShort.sun': '日'
				}) as Record<string, string>
			)[key] ?? key;
		expect(timetableDayShortLabel(1, t)).toBe('一');
		expect(timetableDayShortLabel(7, t)).toBe('日');
		expect(timetableDayShortLabel(99, t)).toBe('?');
	});
});
