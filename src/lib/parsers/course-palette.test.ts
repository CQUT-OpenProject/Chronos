import { describe, expect, it } from 'vite-plus/test';
import { PaletteMode } from '$lib/models/app-state';
import {
	COURSE_PALETTE_ENTRIES,
	EASTER_EGG_PALETTE_ENTRIES,
	assignCourseDisplayColors,
	displaySwatchBackground,
	resolveCoursePalette
} from './course-palette';

describe('resolveCoursePalette', () => {
	it('uses the easter-egg palette for RANDOM', () => {
		expect(resolveCoursePalette(PaletteMode.RANDOM, null)).toBe(EASTER_EGG_PALETTE_ENTRIES);
	});

	it('uses the wallpaper palette when present', () => {
		const custom = [{ background: '#abcdef', foreground: '#000' }];
		expect(resolveCoursePalette(PaletteMode.WALLPAPER, custom)).toBe(custom);
	});

	it('falls back to default when wallpaper palette is missing', () => {
		expect(resolveCoursePalette(PaletteMode.WALLPAPER, null)).toBe(COURSE_PALETTE_ENTRIES);
	});
});

describe('displaySwatchBackground', () => {
	it('maps a default-palette color onto the same index of the display palette', () => {
		expect(displaySwatchBackground('#EADDFF', EASTER_EGG_PALETTE_ENTRIES)).toBe('#FFEE55');
		expect(displaySwatchBackground('#f6e1b0', EASTER_EGG_PALETTE_ENTRIES)).toBe('#4D5B4C');
	});

	it('leaves custom colors unchanged', () => {
		expect(displaySwatchBackground('#123456', EASTER_EGG_PALETTE_ENTRIES)).toBe('#123456');
	});
});

describe('assignCourseDisplayColors', () => {
	it('remaps default-palette courses onto a custom palette', () => {
		const custom = [{ background: '#123456', foreground: '#fff' }];
		const mapped = assignCourseDisplayColors([{ name: '编译原理', color: '#EADDFF' }], custom);
		expect(mapped.get('编译原理')).toEqual(custom[0]);
	});
});
