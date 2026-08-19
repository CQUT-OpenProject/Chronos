import { describe, it, expect } from 'vite-plus/test';
import { m3DefaultTheme, buildM3Tokens } from '../src/theme/m3-theme';
import { tokensToCssVars } from '../src/theme/apply-theme';
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

	it('resolves course paint with course colors or palette index', () => {
		const customCourse = createCourse({
			id: 'c1',
			name: '高等数学',
			color: '#123456',
			textColor: '#ffffff',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});

		const paint1 = m3DefaultTheme.resolveCoursePaint!(customCourse, 0, 'light');
		expect(paint1).toEqual({ background: '#123456', foreground: '#ffffff' });

		const autoCourse = createCourse({
			id: 'c2',
			name: '大学物理',
			dayOfWeek: 2,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});
		const paint2 = m3DefaultTheme.resolveCoursePaint!(autoCourse, 1, 'light');
		expect(paint2.background).toBeDefined();
		expect(paint2.foreground).toBeDefined();
	});

	it('converts design tokens to CSS custom variables', () => {
		const tokens = {
			surface: '#ffffff',
			primary: '#0068b7',
			onPrimary: '#ffffff'
		};
		const cssVars = tokensToCssVars(tokens);
		expect(cssVars['--color-surface']).toBe('#ffffff');
		expect(cssVars['--color-primary']).toBe('#0068b7');
	});
});
