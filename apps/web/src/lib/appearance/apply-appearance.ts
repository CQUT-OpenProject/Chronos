import type { DynamicColorAdapter, PaletteMode, CoursePaletteEntry } from '@chronos/core';
import { PALETTE_MODE_VIBRANT, resolveCoursePalette } from '@chronos/core';

export type ApplyAppearanceInput = {
	paletteMode: PaletteMode;
	isDark: boolean;
	dynamicColorUri: string | null;
	activeThemeId: string;
	themePaletteEntries?: readonly CoursePaletteEntry[] | null;
};

function abortIfNeeded(signal: AbortSignal | undefined) {
	if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
}

export async function applyAppearance(
	input: ApplyAppearanceInput,
	options: {
		target?: HTMLElement;
		dynamicColorAdapter?: DynamicColorAdapter;
		signal?: AbortSignal;
	} = {}
): Promise<{ coursePalette: readonly CoursePaletteEntry[] }> {
	const target =
		options.target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	const { paletteMode, isDark, dynamicColorUri, themePaletteEntries } = input;
	const { dynamicColorAdapter, signal } = options;

	if (target) {
		target.classList.toggle('dark', isDark);
		target.style.colorScheme = isDark ? 'dark' : 'light';
	}

	abortIfNeeded(signal);

	if (paletteMode !== PALETTE_MODE_VIBRANT && dynamicColorUri && dynamicColorAdapter) {
		try {
			const { seed, coursePalette: wallpaperPalette } =
				await dynamicColorAdapter.extractWallpaperSeed(dynamicColorUri);
			abortIfNeeded(signal);
			dynamicColorAdapter.paintWallpaperTheme(seed, isDark, target ?? document.documentElement);
			abortIfNeeded(signal);
			return { coursePalette: resolveCoursePalette(paletteMode, wallpaperPalette) };
		} catch (error) {
			if (signal?.aborted) throw error;
			dynamicColorAdapter.clearWallpaperTheme(target);
			return { coursePalette: resolveCoursePalette(PALETTE_MODE_VIBRANT, null) };
		}
	}

	if (themePaletteEntries && themePaletteEntries.length > 0) {
		dynamicColorAdapter?.clearWallpaperTheme(target);
		return { coursePalette: themePaletteEntries };
	}

	dynamicColorAdapter?.clearWallpaperTheme(target);
	return { coursePalette: resolveCoursePalette(paletteMode, null) };
}
