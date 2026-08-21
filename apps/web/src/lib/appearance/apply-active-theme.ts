import type { ChronosEngine, PaletteMode } from '@chronos/core';
import { applyThemeTokens } from '@chronos/ui-kit';
import { M3_DEFAULT_THEME_ID } from '$lib/appearance/color-scheme';

let previouslyAppliedThemeClass: string | null = null;
let previouslyAppliedCustomVarKeys: string[] = [];

function clearCustomThemeStyles(target: HTMLElement) {
	for (const key of previouslyAppliedCustomVarKeys) {
		target.style.removeProperty(key);
	}
	previouslyAppliedCustomVarKeys = [];

	if (previouslyAppliedThemeClass) {
		target.classList.remove(previouslyAppliedThemeClass);
		previouslyAppliedThemeClass = null;
	}

	for (const prop of Array.from(target.style)) {
		if (
			prop.startsWith('--color-') ||
			prop.startsWith('--period-') ||
			prop.startsWith('--leading-')
		) {
			target.style.removeProperty(prop);
		}
	}
}

export function applyActiveTheme(
	engine: ChronosEngine,
	activeThemeId: string,
	isDark: boolean,
	options?: { paletteMode?: PaletteMode; target?: HTMLElement }
): void {
	const el =
		options?.target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	if (!el) return;

	const currentTheme = engine.themes.getTheme(activeThemeId);
	const effectiveThemeId =
		options?.paletteMode === 'wallpaper' || currentTheme?.supportsDynamicColor
			? M3_DEFAULT_THEME_ID
			: activeThemeId;

	clearCustomThemeStyles(el);

	if (effectiveThemeId === M3_DEFAULT_THEME_ID) {
		return;
	}

	const theme = engine.themes.getTheme(effectiveThemeId);
	if (!theme) {
		return;
	}

	if (theme.className) {
		el.classList.add(theme.className);
		previouslyAppliedThemeClass = theme.className;
	}

	const mode = isDark ? 'dark' : 'light';
	applyThemeTokens(theme.getTokens(mode), el);

	if (theme.customCssVars) {
		const vars =
			typeof theme.customCssVars === 'function' ? theme.customCssVars(mode) : theme.customCssVars;
		for (const [key, value] of Object.entries(vars)) {
			el.style.setProperty(key, value);
			previouslyAppliedCustomVarKeys.push(key);
		}
	}
}
