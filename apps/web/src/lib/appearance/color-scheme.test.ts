import { describe, expect, it } from 'vite-plus/test';
import {
	BUILTIN_COLOR_SCHEME_VIBRANT,
	DYNAMIC_COLOR_SCHEME_ID,
	M3_DEFAULT_THEME_ID,
	buildColorSchemePatch,
	resolveColorSchemeId
} from './color-scheme';

describe('color-scheme', () => {
	it('resolves wallpaper before visual theme id', () => {
		expect(resolveColorSchemeId('wallpaper', 'yumemita')).toBe(DYNAMIC_COLOR_SCHEME_ID);
	});

	it('resolves visual theme when not wallpaper', () => {
		expect(resolveColorSchemeId('vibrant', 'yumemita')).toBe('yumemita');
	});

	it('falls back to vibrant for default theme', () => {
		expect(resolveColorSchemeId('vibrant', M3_DEFAULT_THEME_ID)).toBe(BUILTIN_COLOR_SCHEME_VIBRANT);
	});

	it('builds wallpaper patch with default theme', () => {
		expect(buildColorSchemePatch(DYNAMIC_COLOR_SCHEME_ID)).toEqual({
			paletteMode: 'wallpaper',
			visualThemeId: M3_DEFAULT_THEME_ID,
			themeId: M3_DEFAULT_THEME_ID
		});
	});

	it('builds vibrant patch with default theme', () => {
		expect(buildColorSchemePatch(BUILTIN_COLOR_SCHEME_VIBRANT)).toEqual({
			paletteMode: 'vibrant',
			visualThemeId: M3_DEFAULT_THEME_ID,
			themeId: M3_DEFAULT_THEME_ID
		});
	});

	it('builds plugin theme patch', () => {
		expect(buildColorSchemePatch('yumemita')).toEqual({
			paletteMode: 'vibrant',
			visualThemeId: 'yumemita',
			themeId: 'yumemita'
		});
	});
});
