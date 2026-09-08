import { describe, expect, it } from 'vite-plus/test';
import { timetableWallpaperBackdropClass } from '../src/timetable-preview/timetable-wallpaper-layer';

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

	it('includes anti-bleed inset and motion-safe transitions', () => {
		const classes = timetableWallpaperBackdropClass(false);
		expect(classes).toContain('inset-[-24px]');
		expect(classes).toContain('motion-reduce:transition-none');
		expect(classes).toContain('will-change-[filter]');
		expect(classes).not.toContain('ease-[');
		expect(classes).not.toContain('transform');
	});
});
