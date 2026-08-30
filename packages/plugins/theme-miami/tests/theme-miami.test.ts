import { describe, it, expect } from 'vite-plus/test';
import {
	createIconThemeFromJson,
	createThemeFromColorJson,
	parseColorThemeJson,
	parseIconThemeJson,
	resolveCoursePaint
} from '@chronos/core';
import colorsJson from '../theme-miami.colors.json';
import iconsJson from '../theme-miami.icons.json';

const THEME_ID = 'miami';
const themeContribution = createThemeFromColorJson(parseColorThemeJson(colorsJson));
const iconThemeContribution = createIconThemeFromJson(parseIconThemeJson(iconsJson));
const paletteEntries = colorsJson.coursePalette.light;

describe('@chronos/plugin-theme-miami', () => {
	it('builds light/dark workbench colors from JSON', () => {
		const light = themeContribution.workbenchColors.light;
		const dark = themeContribution.workbenchColors.dark;
		expect(light['color.primary']).toBe('#006D6F');
		expect(light['shell.bottomTab.activeForeground']).toBe('#006D6F');
		expect(light['timetable.period.activeBackgroundImage']).toContain('linear-gradient');
		expect(light['color.warning']).toBe('#FFC857');
		expect(dark['color.surface']).toBe('#0A1C1D');
		expect(dark['color.primary']).toBe('#3DBCA8');
		expect(dark['color.secondary']).toBe('#FF4D8D');
		expect(dark['shell.bottomTab.activeForeground']).toBe('#3DBCA8');
		expect(dark['timetable.period.activeBackgroundImage']).toContain('#FF4D8D');
	});

	it('exposes palette entries for course paint resolution', () => {
		const entries =
			typeof themeContribution.paletteEntries === 'function'
				? themeContribution.paletteEntries('light')
				: themeContribution.paletteEntries;
		expect(entries).toEqual(paletteEntries);

		const paint = resolveCoursePaint({ name: 'Math' }, entries);
		expect(paint.background).toBe(paletteEntries[0]!.background);
	});

	it('icon theme overrides mine tab with svg descriptor', () => {
		const mineIcons = iconThemeContribution.bottomTabIcons?.mine;
		expect(mineIcons?.icon?.type).toBe('svg');
		expect(mineIcons?.icon?.size).toBe('large');
		expect(mineIcons?.iconFill?.opacity).toBe(1);
	});

	it('recommends matching icon theme', () => {
		expect(themeContribution.recommendedIconTheme).toBe(THEME_ID);
		expect(iconThemeContribution.id).toBe(THEME_ID);
	});
});
