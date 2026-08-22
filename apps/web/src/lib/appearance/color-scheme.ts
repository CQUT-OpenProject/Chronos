import type { PaletteMode } from '@chronos/core';
import { LEGACY_PALETTE_MODE_DYNAMIC, PALETTE_MODE_VIBRANT } from '@chronos/core';

export const BUILTIN_COLOR_SCHEME_VIBRANT = 'vibrant';
/** 壁纸主题在配色方案层的 scheme id（与 theme.definition id 对齐） */
export const DYNAMIC_COLOR_SCHEME_ID = 'wallpaper';
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

export function isDynamicColorPaletteMode(paletteMode: PaletteMode | undefined): boolean {
	return Boolean(paletteMode && paletteMode !== PALETTE_MODE_VIBRANT);
}

export function resolveColorSchemeId(
	paletteMode: PaletteMode | undefined,
	visualThemeId: string | undefined
): string {
	if (isDynamicColorPaletteMode(paletteMode) || visualThemeId === DYNAMIC_COLOR_SCHEME_ID) {
		return DYNAMIC_COLOR_SCHEME_ID;
	}
	const themeId = visualThemeId ?? M3_DEFAULT_THEME_ID;
	if (themeId !== M3_DEFAULT_THEME_ID) return themeId;
	return BUILTIN_COLOR_SCHEME_VIBRANT;
}

export function buildColorSchemePatch(schemeId: string): ColorSchemePatch {
	if (schemeId === DYNAMIC_COLOR_SCHEME_ID) {
		return {
			paletteMode: LEGACY_PALETTE_MODE_DYNAMIC,
			visualThemeId: M3_DEFAULT_THEME_ID,
			themeId: M3_DEFAULT_THEME_ID
		};
	}
	if (schemeId === BUILTIN_COLOR_SCHEME_VIBRANT || schemeId === M3_DEFAULT_THEME_ID) {
		return {
			paletteMode: PALETTE_MODE_VIBRANT,
			visualThemeId: M3_DEFAULT_THEME_ID,
			themeId: M3_DEFAULT_THEME_ID
		};
	}
	return {
		paletteMode: PALETTE_MODE_VIBRANT,
		visualThemeId: schemeId,
		themeId: schemeId
	};
}
