import {
	createIconThemeFromJson,
	createThemeFromColorJson,
	parseColorThemeJson,
	parseIconThemeJson
} from '@chronos/core';
import colorsJson from '../theme-yumemita.colors.json';
import iconsJson from '../theme-yumemita.icons.json';

export const YUMEMITA_THEME_ID = 'yumemita';
export const YUMEMITA_PLUGIN_ID = 'theme-yumemita';

export const yumemitaThemeContribution = createThemeFromColorJson(parseColorThemeJson(colorsJson));
export const yumemitaIconThemeContribution = createIconThemeFromJson(parseIconThemeJson(iconsJson));

export const YUMEMITA_PALETTE_ENTRIES = colorsJson.coursePalette.light;
