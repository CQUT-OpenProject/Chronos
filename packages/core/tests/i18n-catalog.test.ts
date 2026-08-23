import { describe, it, expect } from 'vite-plus/test';
import { I18nCatalog, interpolateMessage } from '../src/i18n/i18n-catalog';

describe('I18nCatalog', () => {
	it('registers and resolves plugin messages by locale', () => {
		const catalog = new I18nCatalog();
		catalog.register('codec-share', {
			'zh-cn': { 'import.tab.title': '分享口令' },
			en: { 'import.tab.title': 'Share link' }
		});

		expect(catalog.t('codec-share', 'import.tab.title', 'zh-cn')).toBe('分享口令');
		expect(catalog.t('codec-share', 'import.tab.title', 'en')).toBe('Share link');
	});

	it('normalizes locale ids and disposes per plugin', () => {
		const catalog = new I18nCatalog();
		const handle = catalog.register('core-shell', {
			'zh-CN': { 'tab.mine': '我的' }
		});
		expect(catalog.t('core-shell', 'tab.mine', 'zh-cn')).toBe('我的');
		handle.dispose();
		expect(catalog.t('core-shell', 'tab.mine', 'zh-cn')).toBeUndefined();
	});

	it('interpolates message params', () => {
		expect(interpolateMessage('Hello {name}', { name: 'Chronos' })).toBe('Hello Chronos');
	});
});
