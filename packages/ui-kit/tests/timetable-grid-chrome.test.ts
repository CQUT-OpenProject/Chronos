import { describe, expect, it } from 'vite-plus/test';
import { timetableDayColumnDateClass } from '../src/timetable-preview/timetable-grid-chrome';

describe('timetable-grid-chrome', () => {
	it('returns day column date classes with holiday taking priority over today', () => {
		expect(timetableDayColumnDateClass({})).toBe('text-on-surface');
		expect(timetableDayColumnDateClass({ isToday: true })).toBe(
			'bg-[var(--timetable-today-date-bg)] text-[var(--timetable-today-date-fg)]'
		);
		expect(timetableDayColumnDateClass({ holiday: { label: '国庆节' } })).toBe(
			'bg-[var(--timetable-holiday-date-bg)] text-[var(--timetable-holiday-date-fg)]'
		);
		expect(timetableDayColumnDateClass({ isToday: true, holiday: { label: '国庆节' } })).toBe(
			'bg-[var(--timetable-holiday-date-bg)] text-[var(--timetable-holiday-date-fg)]'
		);
	});
});
