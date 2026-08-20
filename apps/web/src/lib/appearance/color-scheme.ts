import type { PaletteMode } from '@chronos/core';

export const BUILTIN_COLOR_SCHEME_VIBRANT = 'vibrant';
export const BUILTIN_COLOR_SCHEME_WALLPAPER = 'wallpaper';
export const M3_DEFAULT_THEME_ID = 'm3-default';

export interface ColorSchemePreferences {
	paletteMode: PaletteMode;
	visualThemeId?: string;
}

export interface ColorSchemePatch {
	paletteMode: PaletteMode;
	visualThemeId: string;
	themeId: string;
}

export function resolveColorSchemeId(
	paletteMode: PaletteMode,
	visualThemeId: string | undefined
): string {
	if (paletteMode === 'wallpaper') return BUILTIN_COLOR_SCHEME_WALLPAPER;
	const themeId = visualThemeId ?? M3_DEFAULT_THEME_ID;
	if (themeId !== M3_DEFAULT_THEME_ID) return themeId;
	return BUILTIN_COLOR_SCHEME_VIBRANT;
}

export function buildColorSchemePatch(schemeId: string): ColorSchemePatch {
	if (schemeId === BUILTIN_COLOR_SCHEME_WALLPAPER) {
		return {
			paletteMode: 'wallpaper',
			visualThemeId: M3_DEFAULT_THEME_ID,
			themeId: M3_DEFAULT_THEME_ID
		};
	}
	if (schemeId === BUILTIN_COLOR_SCHEME_VIBRANT) {
		return {
			paletteMode: 'vibrant',
			visualThemeId: M3_DEFAULT_THEME_ID,
			themeId: M3_DEFAULT_THEME_ID
		};
	}
	return {
		paletteMode: 'vibrant',
		visualThemeId: schemeId,
		themeId: schemeId
	};
}
