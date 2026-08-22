import { COURSE_PALETTE_ENTRIES, type CoursePaletteEntry } from '@chronos/core';
import { getAppEngine } from '$lib/services/app-engine';
import {
	applyAppearance,
	type ApplyAppearanceInput,
	type WallpaperThemeAdapter
} from './apply-appearance';
import { isDynamicColorPaletteMode } from './color-scheme';

export function createAppearance() {
	let coursePalette = $state.raw<readonly CoursePaletteEntry[]>(COURSE_PALETTE_ENTRIES);

	function resolveDynamicAdapter(
		activeThemeId: string,
		paletteMode: string
	): WallpaperThemeAdapter | null {
		const engine = getAppEngine();
		const readAdapter = (themeId: string) =>
			(
				engine.themes.getTheme(themeId) as unknown as
					| { dynamicColorAdapter?: WallpaperThemeAdapter }
					| undefined
			)?.dynamicColorAdapter ?? null;

		if (isDynamicColorPaletteMode(paletteMode)) {
			const fromPalette = readAdapter(paletteMode);
			if (fromPalette) return fromPalette;
		}

		return readAdapter(activeThemeId);
	}

	async function apply(input: ApplyAppearanceInput, signal?: AbortSignal) {
		if (typeof document === 'undefined') return;

		const adapter = resolveDynamicAdapter(input.activeThemeId, input.paletteMode);

		try {
			const result = await applyAppearance(input, {
				target: document.documentElement,
				wallpaper: adapter ?? undefined,
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
		if (typeof document === 'undefined') return;
		const engine = getAppEngine();
		const paletteMode = engine.state.userPreferences?.paletteMode ?? 'vibrant';
		const adapter = resolveDynamicAdapter(engine.state.activeThemeId, paletteMode);
		adapter?.clearWallpaperTheme(document.documentElement);
	}

	return {
		get coursePalette() {
			return coursePalette;
		},
		apply,
		destroy
	};
}
