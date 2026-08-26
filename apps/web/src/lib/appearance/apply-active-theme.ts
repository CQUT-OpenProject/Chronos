import type { ChronosEngine, PaletteMode } from '@chronos/core';
import { PALETTE_MODE_VIBRANT, resolveThemeWorkbenchColors } from '@chronos/core';
import { applyWorkbenchColors } from '@chronos/core';
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
			prop.startsWith('--leading-') ||
			prop.startsWith('--shell-')
		) {
			target.style.removeProperty(prop);
		}
	}
}

export function resolveEffectiveThemeId(
	engine: ChronosEngine,
	activeThemeId: string,
	paletteMode?: PaletteMode
): string {
	const currentTheme = engine.themes.getTheme(activeThemeId);
	const effectiveThemeId =
		(paletteMode !== undefined && paletteMode !== PALETTE_MODE_VIBRANT && paletteMode !== '') ||
		currentTheme?.supportsDynamicColor
			? M3_DEFAULT_THEME_ID
			: activeThemeId;
	return effectiveThemeId;
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

	const effectiveThemeId = resolveEffectiveThemeId(engine, activeThemeId, options?.paletteMode);

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
	const workbenchColors = resolveThemeWorkbenchColors(theme, mode);
	previouslyAppliedCustomVarKeys = applyWorkbenchColors(el, workbenchColors);
}
