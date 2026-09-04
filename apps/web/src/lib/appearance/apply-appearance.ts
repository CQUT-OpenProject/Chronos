import type { DynamicColorAdapter, PaletteMode, CoursePaletteEntry } from '@chronos/core';
import { PALETTE_MODE_VIBRANT, resolveCoursePalette } from '@chronos/core';

/** Keep in sync with app.html boot IIFE theme-color literals. */
export const THEME_COLOR_LIGHT = '#0068B7';
export const THEME_COLOR_DARK = '#1a1c1e';

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

function syncThemeColorMeta(isDark: boolean) {
	if (typeof document === 'undefined') return;
	const meta = document.querySelector('meta[name="theme-color"]');
	if (meta) {
		meta.setAttribute('content', isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
	}
}

/** Keep in sync with app.html boot IIFE status-bar-style literals. */
function syncAppleStatusBarStyle(isDark: boolean) {
	if (typeof document === 'undefined') return;
	const meta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
	if (meta) {
		// Dark: black-translucent (light icons + content under status bar; --topbar-safe
		// already pads chrome). Light: default (dark icons on light top bar). Android no-op.
		meta.setAttribute('content', isDark ? 'black-translucent' : 'default');
	}
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
		if (typeof document !== 'undefined' && target === document.documentElement) {
			syncThemeColorMeta(isDark);
			syncAppleStatusBarStyle(isDark);
		}
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
