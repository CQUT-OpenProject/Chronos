import { PaletteMode } from '$lib/models/app-state';
import { resolveCoursePalette, type CoursePaletteEntry } from '@chronos/core';

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
	const { paletteMode, isDark, wallpaperUri } = input;
	const { wallpaper, signal } = options;

	if (target) {
		target.classList.toggle('dark', isDark);
		target.classList.toggle('theme-random', paletteMode === PaletteMode.RANDOM);
		target.style.colorScheme = isDark ? 'dark' : 'light';
	}

	abortIfNeeded(signal);

	if (paletteMode === PaletteMode.WALLPAPER && wallpaperUri && wallpaper) {
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
			return { coursePalette: resolveCoursePalette(PaletteMode.DEFAULT, null) };
		}
	}

	wallpaper?.clearWallpaperTheme(target);
	return { coursePalette: resolveCoursePalette(paletteMode, null) };
}
