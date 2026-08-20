import type { ChronosEngine, PaletteMode } from '@chronos/core';
import {
	YUMEMITA_THEME_ID,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY
} from '@chronos/plugin-theme-yumemita';
import { applyThemeTokens } from '@chronos/ui-kit';
import { M3_DEFAULT_THEME_ID } from '$lib/appearance/color-scheme';

function clearThemeInlineVars(target: HTMLElement) {
	for (const prop of target.style) {
		if (prop.startsWith('--color-') || prop === '--ee-primary' || prop === '--ee-secondary') {
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

	const effectiveThemeId =
		options?.paletteMode === 'wallpaper' ? M3_DEFAULT_THEME_ID : activeThemeId;

	el.classList.toggle('theme-yumemita', effectiveThemeId === YUMEMITA_THEME_ID);

	if (effectiveThemeId === M3_DEFAULT_THEME_ID) {
		clearThemeInlineVars(el);
		return;
	}

	const theme = engine.themes.getTheme(effectiveThemeId);
	if (!theme) {
		clearThemeInlineVars(el);
		return;
	}

	applyThemeTokens(theme.getTokens(isDark ? 'dark' : 'light'), el);

	if (effectiveThemeId === YUMEMITA_THEME_ID) {
		el.style.setProperty('--ee-primary', YUMEMITA_PRIMARY);
		el.style.setProperty('--ee-secondary', YUMEMITA_SECONDARY);
	} else {
		el.style.removeProperty('--ee-primary');
		el.style.removeProperty('--ee-secondary');
	}
}
