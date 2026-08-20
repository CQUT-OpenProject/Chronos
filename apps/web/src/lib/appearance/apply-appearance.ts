import type { PaletteMode } from '@chronos/core';
import { resolveCoursePalette, type CoursePaletteEntry } from '@chronos/core';
import { EASTER_EGG_PALETTE_ENTRIES, YUMEMITA_THEME_ID } from '@chronos/plugin-theme-yumemita';

export interface WallpaperThemeAdapter {
	extractWallpaperSeed(uri: string): Promise<{
		seed: number;
		coursePalette: readonly CoursePaletteEntry[];
	}>;
	paintWallpaperTheme(seed: number, isDark: boolean, target: HTMLElement): void;
	clearWallpaperTheme(target?: HTMLElement): void;
}

export type ApplyAppearanceInput = {
	paletteMode: PaletteMode;
	isDark: boolean;
	wallpaperUri: string | null;
	activeThemeId: string;
};

function abortIfNeeded(signal: AbortSignal | undefined) {
	if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}

export async function applyAppearance(
	input: ApplyAppearanceInput,
	options: {
		target?: HTMLElement;
		wallpaper?: WallpaperThemeAdapter;
		signal?: AbortSignal;
	} = {}
): Promise<{ coursePalette: readonly CoursePaletteEntry[] }> {
	const target =
		options.target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	const { paletteMode, isDark, wallpaperUri, activeThemeId } = input;
	const { wallpaper, signal } = options;

	if (target) {
		target.classList.toggle('dark', isDark);
		target.style.colorScheme = isDark ? 'dark' : 'light';
	}

	abortIfNeeded(signal);

	if (activeThemeId === YUMEMITA_THEME_ID) {
		wallpaper?.clearWallpaperTheme(target);
		return { coursePalette: EASTER_EGG_PALETTE_ENTRIES };
	}

	if (paletteMode === 'wallpaper' && wallpaperUri && wallpaper) {
		try {
			const { seed, coursePalette: wallpaperPalette } =
				await wallpaper.extractWallpaperSeed(wallpaperUri);
			abortIfNeeded(signal);
			wallpaper.paintWallpaperTheme(seed, isDark, target ?? document.documentElement);
			abortIfNeeded(signal);
			return { coursePalette: resolveCoursePalette(paletteMode, wallpaperPalette) };
		} catch (error) {
			if (signal?.aborted) throw error;
			wallpaper.clearWallpaperTheme(target);
			return { coursePalette: resolveCoursePalette('vibrant', null) };
		}
	}

	wallpaper?.clearWallpaperTheme(target);
	return { coursePalette: resolveCoursePalette(paletteMode, null) };
}
