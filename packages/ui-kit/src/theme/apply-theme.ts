import type { DesignTokens } from '@chronos/core';

export function tokensToCssVars(
	tokens: Partial<DesignTokens> | Record<string, string>
): Record<string, string> {
	const vars: Record<string, string> = {};
	for (const [key, value] of Object.entries(tokens)) {
		if (typeof value === 'string' && value.length > 0) {
			vars[`--color-${key}`] = value;
		}
	}
	return vars;
}

export function applyThemeTokens(
	tokens: Partial<DesignTokens> | Record<string, string>,
	targetElement?: HTMLElement | null
): void {
	if (typeof document === 'undefined') return;
	const el = targetElement ?? document.documentElement;
	if (!el) return;

	const cssVars = tokensToCssVars(tokens);
	for (const [key, value] of Object.entries(cssVars)) {
		el.style.setProperty(key, value);
	}
}
