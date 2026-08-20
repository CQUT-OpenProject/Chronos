import { COURSE_PALETTE_ENTRIES, type CoursePaletteEntry } from '@chronos/core';
import {
	applyAppearance,
	type ApplyAppearanceInput,
	type WallpaperThemeAdapter
} from './apply-appearance';

export function createAppearance() {
	let coursePalette = $state.raw<readonly CoursePaletteEntry[]>(COURSE_PALETTE_ENTRIES);
	let wallpaperModule: WallpaperThemeAdapter | null = null;

	async function apply(input: ApplyAppearanceInput, signal?: AbortSignal) {
		if (typeof document === 'undefined') return;

		if (input.paletteMode === 'wallpaper') {
			wallpaperModule ??= await import('$lib/m3/apply-wallpaper-theme');
		}

		try {
			const result = await applyAppearance(input, {
				target: document.documentElement,
				wallpaper: wallpaperModule ?? undefined,
				signal
			});
			if (signal?.aborted) return;
			coursePalette = result.coursePalette;
		} catch (error) {
			if (signal?.aborted) return;
			throw error;
		}
	}

	function reset() {
		coursePalette = COURSE_PALETTE_ENTRIES;
		if (typeof document !== 'undefined') {
			wallpaperModule?.clearWallpaperTheme(document.documentElement);
		}
	}

	return {
		get coursePalette() {
			return coursePalette;
		},
		apply,
		reset
	};
}

export type AppearanceController = ReturnType<typeof createAppearance>;
