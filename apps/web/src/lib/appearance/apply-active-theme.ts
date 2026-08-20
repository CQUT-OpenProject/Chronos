import type { ChronosEngine } from '@chronos/core';
import {
	YUMEMITA_THEME_ID,
	YUMEMITA_PRIMARY,
	YUMEMITA_SECONDARY
} from '@chronos/plugin-theme-yumemita';
import { applyThemeTokens } from '@chronos/ui-kit';

const M3_DEFAULT_THEME_ID = 'm3-default';

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
	target?: HTMLElement
): void {
	const el = target ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
	if (!el) return;

	el.classList.toggle('theme-yumemita', activeThemeId === YUMEMITA_THEME_ID);

	if (activeThemeId === M3_DEFAULT_THEME_ID) {
		clearThemeInlineVars(el);
		return;
	}

	const theme = engine.themes.getTheme(activeThemeId);
	if (!theme) {
		clearThemeInlineVars(el);
		return;
	}

	applyThemeTokens(theme.getTokens(isDark ? 'dark' : 'light'), el);

	if (activeThemeId === YUMEMITA_THEME_ID) {
		el.style.setProperty('--ee-primary', YUMEMITA_PRIMARY);
		el.style.setProperty('--ee-secondary', YUMEMITA_SECONDARY);
	} else {
		el.style.removeProperty('--ee-primary');
		el.style.removeProperty('--ee-secondary');
	}
}
