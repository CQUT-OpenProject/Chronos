import { describe, expect, it } from 'vite-plus/test';
import {
	timetableWallpaperBackdropClass,
	timetableWallpaperBackgroundSize
} from '../src/timetable-preview/timetable-wallpaper-layer';

describe('timetable-wallpaper-layer', () => {
	it('returns clear backdrop classes when not blurred', () => {
		const classes = timetableWallpaperBackdropClass(false);
		expect(classes).toContain('blur-none');
		expect(classes).toContain('duration-300');
		expect(classes).not.toContain('blur-lg');
		expect(classes).not.toContain('scale-');
	});

	it('returns blurred backdrop classes when editing', () => {
		const classes = timetableWallpaperBackdropClass(true);
		expect(classes).toContain('blur-lg');
		expect(classes).toContain('duration-150');
		expect(classes).not.toContain('blur-none');
		expect(classes).not.toContain('scale-');
	});

	it('uses anti-bleed inset for cover fit', () => {
		const classes = timetableWallpaperBackdropClass(false, 'cover');
		expect(classes).toContain('inset-[-24px]');
	});

	it('uses exact-fit inset for fill fit', () => {
		const classes = timetableWallpaperBackdropClass(false, 'fill');
		expect(classes).toContain('inset-0');
		expect(timetableWallpaperBackgroundSize('fill')).toBe('100% 100%');
	});
});
