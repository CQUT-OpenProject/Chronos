import { describe, expect, it } from 'vite-plus/test';
import { resolveLocaleMapText } from '../src/i18n/i18n-catalog';
import { createThemeFromColorJson, parseColorThemeJson } from '../src/theme/color-theme-json';
import { resolveLocalizedText } from '../src/types/slots';

describe('resolveLocalizedText locale maps', () => {
	const name = { 'zh-CN': '迈阿密', en: 'Miami' };

	it('resolves manifest-style maps for the requested locale', () => {
		expect(resolveLocalizedText(name, '', 'en')).toBe('Miami');
		expect(resolveLocalizedText(name, '', 'zh-cn')).toBe('迈阿密');
	});

	it('falls back through resolveLocaleMapText when locale is missing', () => {
		expect(resolveLocaleMapText({ 'zh-CN': '迈阿密' }, 'en')).toBe('迈阿密');
	});
});

describe('createThemeFromColorJson localized metadata', () => {
	const theme = createThemeFromColorJson(
		parseColorThemeJson({
			id: 'miami',
			name: { 'zh-CN': '迈阿密', en: 'Miami' },
			variants: {
				light: { colors: { 'color.primary': '#006D6F' } },
				dark: { colors: { 'color.primary': '#3DBCA8' } }
			}
		})
	);

	it('keeps locale maps on the contribution for runtime resolution', () => {
		expect(theme.name).toEqual({ 'zh-CN': '迈阿密', en: 'Miami' });
		expect(resolveLocalizedText(theme.name, 'miami', 'en')).toBe('Miami');
		expect(resolveLocalizedText(theme.name, 'miami', 'zh-cn')).toBe('迈阿密');
	});
});
