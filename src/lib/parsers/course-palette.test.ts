import { describe, expect, it } from 'vite-plus/test';
import { PaletteMode } from '$lib/models/app-state';
import {
	COURSE_PALETTE_ENTRIES,
	EASTER_EGG_PALETTE_ENTRIES,
	defaultPaletteSlot,
	displaySwatchBackground,
	persistSwatchSelection,
	resolveCoursePaint,
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

describe('defaultPaletteSlot', () => {
	it('returns the default-palette index, case-insensitively', () => {
		expect(defaultPaletteSlot('#EADDFF')).toBe(0);
		expect(defaultPaletteSlot('#f6e1b0')).toBe(5);
	});

	it('returns null for a custom hex', () => {
		expect(defaultPaletteSlot('#123456')).toBeNull();
	});
});

describe('persistSwatchSelection', () => {
	it('stores the identity hex for a display-palette index, never the display hex', () => {
		expect(persistSwatchSelection(0)).toEqual(COURSE_PALETTE_ENTRIES[0]);
		expect(persistSwatchSelection(5)).toEqual(COURSE_PALETTE_ENTRIES[5]);
		expect(persistSwatchSelection(0).background).not.toBe(
			EASTER_EGG_PALETTE_ENTRIES[0]?.background
		);
	});
});

describe('resolveCoursePaint', () => {
	it('maps a default-palette slot onto the same index of the display palette', () => {
		expect(
			resolveCoursePaint({ color: '#EADDFF', textColor: '#21005D' }, EASTER_EGG_PALETTE_ENTRIES)
		).toEqual(EASTER_EGG_PALETTE_ENTRIES[0]);
		expect(
			resolveCoursePaint({ color: '#f6e1b0', textColor: '#241A00' }, EASTER_EGG_PALETTE_ENTRIES)
		).toEqual(EASTER_EGG_PALETTE_ENTRIES[5]);
	});

	it('leaves custom colors unchanged', () => {
		expect(
			resolveCoursePaint({ color: '#123456', textColor: '#fff' }, EASTER_EGG_PALETTE_ENTRIES)
		).toEqual({ background: '#123456', foreground: '#fff' });
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
