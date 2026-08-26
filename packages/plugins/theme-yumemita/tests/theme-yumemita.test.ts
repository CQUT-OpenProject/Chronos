import { describe, it, expect } from 'vite-plus/test';
import {
	createIconThemeFromJson,
	createThemeFromColorJson,
	parseColorThemeJson,
	parseIconThemeJson
} from '@chronos/core';
import colorsJson from '../theme-yumemita.colors.json';
import iconsJson from '../theme-yumemita.icons.json';

const THEME_ID = 'yumemita';
const themeContribution = createThemeFromColorJson(parseColorThemeJson(colorsJson));
const iconThemeContribution = createIconThemeFromJson(parseIconThemeJson(iconsJson));
const paletteEntries = colorsJson.coursePalette.light;

describe('@chronos/plugin-theme-yumemita', () => {
	it('builds light/dark workbench colors from JSON', () => {
		const light = themeContribution.workbenchColors.light;
		const dark = themeContribution.workbenchColors.dark;
		expect(light['color.primary']).toBe('#2288dd');
		expect(light['shell.bottomTab.activeForeground']).toBe('#2288dd');
		expect(light['timetable.period.activeBackgroundImage']).toContain('linear-gradient');
		expect(dark['color.surface']).toBe('#1e2026');
	});

	it('resolveCoursePaint uses palette entries', () => {
		const paint = themeContribution.resolveCoursePaint!(
			{
				id: '1',
				name: 'Math',
				teacher: '',
				location: '',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				weeks: [1]
			},
			0,
			'light'
		);
		expect(paint.background).toBe(paletteEntries[0]!.background);
	});

	it('icon theme overrides mine tab with svg descriptor', () => {
		const mineIcons = iconThemeContribution.bottomTabIcons?.mine;
		expect(mineIcons?.icon?.type).toBe('svg');
		expect(mineIcons?.icon?.size).toBe('large');
		expect(mineIcons?.icon?.rotation).toBe(25);
		expect(mineIcons?.iconFill?.opacity).toBe(1);
	});

	it('recommends matching icon theme', () => {
		expect(themeContribution.recommendedIconTheme).toBe(THEME_ID);
		expect(iconThemeContribution.id).toBe(THEME_ID);
	});
});
