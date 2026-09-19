import { describe, expect, it, vi } from 'vite-plus/test';
import {
	attachWallpaperImageDecode,
	timetableWallpaperBackdropClass,
	timetableWallpaperPreblurredClass
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

	it('prewarms a fixed blur and only transitions its opacity', () => {
		const beforeEdit = timetableWallpaperPreblurredClass(false);
		const duringEdit = timetableWallpaperPreblurredClass(true);

		expect(beforeEdit).toContain('blur-lg');
		expect(beforeEdit).toContain('opacity-[0.001]');
		expect(beforeEdit).toContain('duration-[240ms]');
		expect(duringEdit).toContain('opacity-100');
		expect(duringEdit).toContain('duration-[120ms]');
		expect(duringEdit).toContain('motion-reduce:transition-none');
		expect(duringEdit).toContain('transition-opacity');
		expect(duringEdit).not.toContain('transition-[filter]');
	});
});

describe('attachWallpaperImageDecode', () => {
	it('decodes the bound image without resetting an unchanged source', () => {
		const uri = 'blob:http://localhost/wallpaper';
		const img = {
			getAttribute: vi.fn().mockReturnValue(uri),
			decode: vi.fn().mockResolvedValue(undefined)
		};

		attachWallpaperImageDecode(uri)(img as unknown as HTMLImageElement);

		expect(img).not.toHaveProperty('src');
		expect(img.decode).toHaveBeenCalledOnce();
	});
});
