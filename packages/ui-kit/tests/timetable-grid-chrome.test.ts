import { describe, expect, it } from 'vite-plus/test';
import {
	timetableBodyTintClass,
	timetableDayColumnDateClass,
	timetableDayColumnDateShellClass,
	timetableHolidayColumnOverlayClass,
	timetablePeriodIndexClass,
	timetableSidebarTintClass,
	timetableSolidBgClass
} from '../src/timetable-preview/timetable-grid-chrome';

describe('timetable-grid-chrome', () => {
	it('returns surface classes based on dynamic background state', () => {
		expect(timetableSolidBgClass(false)).toBe('bg-surface');
		expect(timetableSolidBgClass(true)).toBe('');
		expect(timetableSidebarTintClass(true)).toContain('dynamic-tint-sidebar');
		expect(timetableBodyTintClass(true)).toBe('timetable-dynamic-tint-body');
	});

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

	it('uses heavier weights for date and period numbers', () => {
		expect(timetableDayColumnDateShellClass()).toContain('font-extrabold');
		expect(timetablePeriodIndexClass()).toBe('text-body-medium font-extrabold');
	});

	it('matches column header tint instead of gray wash', () => {
		expect(timetableHolidayColumnOverlayClass(false)).toBe('bg-on-surface-variant/5');
		expect(timetableHolidayColumnOverlayClass(true)).toBe(
			'bg-[var(--dynamic-tint-holiday-overlay)]'
		);
	});
});
