import { COURSE_PALETTE_ENTRIES, type CoursePaletteEntry } from '@chronos/core';
import { getAppEngine } from '$lib/services/app-engine';
import {
	applyAppearance,
	type ApplyAppearanceInput,
	type WallpaperThemeAdapter
} from './apply-appearance';

export function createAppearance() {
	let coursePalette = $state.raw<readonly CoursePaletteEntry[]>(COURSE_PALETTE_ENTRIES);
	let wallpaperModule: WallpaperThemeAdapter | null = null;

	async function resolveWallpaperModule(): Promise<WallpaperThemeAdapter | null> {
		const engine = getAppEngine();
		if (!engine.themes.getTheme('wallpaper')) {
			return null;
		}
		wallpaperModule ??= await import('@chronos/plugin-wallpaper/wallpaper-theme');
		return wallpaperModule;
	}

	async function apply(input: ApplyAppearanceInput, signal?: AbortSignal) {
		if (typeof document === 'undefined') return;

		const wallpaper =
			input.paletteMode === 'wallpaper' || input.activeThemeId === 'wallpaper'
				? await resolveWallpaperModule()
				: null;

		try {
			const result = await applyAppearance(input, {
				target: document.documentElement,
				wallpaper: wallpaper ?? undefined,
				signal
			});
			if (signal?.aborted) return;
			coursePalette = result.coursePalette;
		} catch (error) {
			if (signal?.aborted) return;
			throw error;
		}
	}

	function destroy() {
		if (typeof document !== 'undefined') {
			wallpaperModule?.clearWallpaperTheme(document.documentElement);
		}
	}

	return {
		get coursePalette() {
			return coursePalette;
		},
		apply,
		destroy
	};
}
