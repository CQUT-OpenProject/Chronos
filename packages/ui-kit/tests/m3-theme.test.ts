import { describe, it, expect } from 'vite-plus/test';
import {
	m3DefaultTheme,
	buildM3Tokens,
	buildGeneratedThemeCss,
	CHRONOS_HOST_COLORS,
	CHRONOS_HOST_COLOR_KEYS
} from '../src/theme/m3-theme';
import { createCourse } from '@chronos/core';

describe('M3DefaultTheme', () => {
	it('has valid theme id and flags', () => {
		expect(m3DefaultTheme.id).toBe('m3-default');
		expect(m3DefaultTheme.supportsDynamicColor).toBe(true);
	});

	it('generates light and dark design tokens', () => {
		const lightTokens = m3DefaultTheme.getTokens('light');
		expect(lightTokens.surface).toBeDefined();
		expect(lightTokens.primary).toBeDefined();

		const darkTokens = m3DefaultTheme.getTokens('dark');
		expect(darkTokens.surface).toBeDefined();
		expect(darkTokens.primary).toBeDefined();
		expect(darkTokens.surface).not.toEqual(lightTokens.surface);
	});

	it('supports seedColor dynamic color token generation', () => {
		const defaultTokens = buildM3Tokens('light');
		const customTokens = buildM3Tokens('light', '#ff5722');
		expect(customTokens.primary).not.toEqual(defaultTokens.primary);
	});

	it('resolves course paint from palette index', () => {
		const course = createCourse({
			id: 'c1',
			name: '高等数学',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});

		const paint = m3DefaultTheme.resolveCoursePaint!(course, 1, 'light');
		expect(paint.background).toBeDefined();
		expect(paint.foreground).toBeDefined();
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
