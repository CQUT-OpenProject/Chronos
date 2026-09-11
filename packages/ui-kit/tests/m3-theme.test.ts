import { describe, it, expect } from 'vite-plus/test';
import { createWorkbenchColorsFromTokens } from '@chronos/core/theme/workbench-colors';
import { m3DefaultTheme } from '../src/theme/m3-default-theme';
import { m3DefaultWorkbenchColors } from '../src/theme/m3-default-workbench.generated';
import {
	buildM3Tokens,
	buildGeneratedThemeCss,
	buildGeneratedThemeInlineCss,
	CHRONOS_HOST_COLORS,
	CHRONOS_HOST_COLOR_KEYS
} from '../src/theme/m3-theme';

describe('M3DefaultTheme', () => {
	it('has valid theme id and flags', () => {
		expect(m3DefaultTheme.id).toBe('m3-default');
		expect(m3DefaultTheme.supportsDynamicColor).toBe(true);
	});

	it('generates light and dark workbench colors', () => {
		const light = m3DefaultTheme.workbenchColors.light;
		expect(light['color.surface']).toBeDefined();
		expect(light['color.primary']).toBeDefined();

		const dark = m3DefaultTheme.workbenchColors.dark;
		expect(dark['color.surface']).toBeDefined();
		expect(dark['color.primary']).toBeDefined();
		expect(dark['color.surface']).not.toEqual(light['color.surface']);
	});

	it('supports seedColor dynamic color token generation', () => {
		const defaultTokens = buildM3Tokens('light');
		const customTokens = buildM3Tokens('light', '#ff5722');
		expect(customTokens.primary).not.toEqual(defaultTokens.primary);
	});

	it('generated CSS includes host color overrides', () => {
		const css = buildGeneratedThemeCss();
		for (const key of CHRONOS_HOST_COLOR_KEYS) {
			const value = CHRONOS_HOST_COLORS.light[key];
			expect(css).toContain(`--color-${key}: ${value}`);
		}
	});

	it('theme inline CSS maps tokens without hex :root values', () => {
		const css = buildGeneratedThemeInlineCss();
		expect(css).toContain('--color-border: var(--color-border-subtle)');
		expect(css).toContain('--color-secondary-container: var(--color-secondary-container)');
		expect(css).not.toMatch(/--color-surface:\s*#/);
		expect(css).not.toContain('@layer tokens');
	});

	it('m3-default workbench colors match host surface overrides', () => {
		const light = m3DefaultTheme.workbenchColors.light;
		expect(light['color.surface']).toBe(CHRONOS_HOST_COLORS.light.surface);
		expect(light['color.canvas']).toBe(CHRONOS_HOST_COLORS.light.canvas);
		expect(light['color.danger']).toBe(CHRONOS_HOST_COLORS.light.danger);
	});

	it('generated workbench snapshot matches live buildM3Tokens', () => {
		expect(m3DefaultWorkbenchColors).toEqual(
			createWorkbenchColorsFromTokens(buildM3Tokens('light'), buildM3Tokens('dark'))
		);
	});
});
