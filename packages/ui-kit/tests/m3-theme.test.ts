import { describe, it, expect } from 'vite-plus/test';
import {
	m3DefaultTheme,
	buildM3Tokens,
	buildGeneratedThemeCss,
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

	it('m3-default workbench colors match host surface overrides', () => {
		const light = m3DefaultTheme.workbenchColors.light;
		expect(light['color.surface']).toBe(CHRONOS_HOST_COLORS.light.surface);
		expect(light['color.canvas']).toBe(CHRONOS_HOST_COLORS.light.canvas);
		expect(light['color.danger']).toBe(CHRONOS_HOST_COLORS.light.danger);
	});
});
