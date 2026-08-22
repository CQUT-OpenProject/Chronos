import { COURSE_PALETTE_ENTRIES, type DynamicColorAdapter } from '@chronos/core';
import { getAppEngine } from '$lib/services/app-engine';
import { applyAppearance, type ApplyAppearanceInput } from './apply-appearance';
import { isDynamicColorPaletteMode } from './color-scheme';

export function createAppearance() {
	let coursePalette =
		$state.raw<readonly import('@chronos/core').CoursePaletteEntry[]>(COURSE_PALETTE_ENTRIES);

	function resolveDynamicAdapter(
		activeThemeId: string,
		paletteMode: string
	): DynamicColorAdapter | null {
		const engine = getAppEngine();
		const readAdapter = (themeId: string) =>
			engine.themes.getTheme(themeId)?.dynamicColorAdapter ?? null;

		if (isDynamicColorPaletteMode(paletteMode)) {
			const fromPalette = readAdapter(paletteMode);
			if (fromPalette) return fromPalette;
		}

		return readAdapter(activeThemeId);
	}

	async function apply(input: ApplyAppearanceInput, signal?: AbortSignal) {
		if (typeof document === 'undefined') return;

		const dynamicColorAdapter = resolveDynamicAdapter(input.activeThemeId, input.paletteMode);

		try {
			const result = await applyAppearance(input, {
				target: document.documentElement,
				dynamicColorAdapter: dynamicColorAdapter ?? undefined,
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
