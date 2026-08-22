import { describe, expect, it } from 'vite-plus/test';
import {
	timetableBodyTintClass,
	timetableSidebarTintClass,
	timetableSolidBgClass
} from '../src/timetable-preview/timetable-grid-chrome';

describe('timetable-grid-chrome', () => {
	it('returns surface classes based on dynamic background state', () => {
		expect(timetableSolidBgClass(false)).toBe('bg-surface');
		expect(timetableSolidBgClass(true)).toBe('');
		expect(timetableSidebarTintClass(true)).toContain('wallpaper-tint-sidebar');
		expect(timetableBodyTintClass(true)).toBe('timetable-wallpaper-body');
	});
});
