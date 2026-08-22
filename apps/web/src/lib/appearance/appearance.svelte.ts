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

	function resolveDynamicAdapter(
		activeThemeId: string,
		paletteMode: string
	): WallpaperThemeAdapter | null {
		const engine = getAppEngine();
		const theme = engine.themes.getTheme(activeThemeId) ?? engine.themes.getTheme(paletteMode);
		const adapter = (theme as unknown as { dynamicColorAdapter?: WallpaperThemeAdapter })
			?.dynamicColorAdapter;
		if (adapter) return adapter;
		return null;
	}

	async function resolveWallpaperModule(
		activeThemeId: string,
		paletteMode: string
	): Promise<WallpaperThemeAdapter | null> {
		const adapter = resolveDynamicAdapter(activeThemeId, paletteMode);
		if (adapter) return adapter;
		// 回退：旧版字符串特判，仅当主题仍为 'wallpaper' 但 adapter 未注册时
		const engine = getAppEngine();
		if (!engine.themes.getTheme('wallpaper')) return null;
		wallpaperModule ??= await import('@chronos/plugin-wallpaper/wallpaper-theme');
		return wallpaperModule;
	}

	async function apply(input: ApplyAppearanceInput, signal?: AbortSignal) {
		if (typeof document === 'undefined') return;

		const wallpaper = await resolveWallpaperModule(input.activeThemeId, input.paletteMode);

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
