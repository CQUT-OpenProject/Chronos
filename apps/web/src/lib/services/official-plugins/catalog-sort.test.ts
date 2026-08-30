import { describe, expect, it } from 'vite-plus/test';
import type { PluginManifest } from '@chronos/core';
import {
	compareCatalogManifests,
	comparePluginDisplayNames,
	getPluginCategorySortIndex,
	groupCatalogManifestsByCategory
} from './catalog-sort';

const officialPluginNames = {
	'theme-yumemita': { 'zh-CN': 'YUMEMITA', en: 'YUMEMITA', type: 'theme' as const },
	'tool-wallpaper': {
		'zh-CN': '自定义壁纸',
		en: 'Custom Wallpaper',
		type: 'tool' as const
	},
	'tool-qrcode': { 'zh-CN': '二维码', en: 'QR Code', type: 'tool' as const },
	'tool-calendar-holidays': {
		'zh-CN': '法定节假日',
		en: 'Public Holidays',
		type: 'tool' as const
	},
	'tool-today': { 'zh-CN': '今日', en: 'Today', type: 'tool' as const }
} as const;

function toCatalogEntries(): Array<{ url: string; manifest: PluginManifest }> {
	return Object.entries(officialPluginNames).map(([id, plugin]) => ({
		url: `/official-plugins/manifests/${id}.manifest.json`,
		manifest: {
			id,
			name: { 'zh-CN': plugin['zh-CN'], en: plugin.en },
			version: '1.0.0',
			description: { 'zh-CN': plugin['zh-CN'], en: plugin.en },
			author: 'Chronos',
			type: plugin.type,
			bundleFormat: 'esm',
			minEngineVersion: '0.4.0'
		}
	}));
}

function sortByLocale(locale: string): string[] {
	return toCatalogEntries()
		.sort((left, right) => compareCatalogManifests(left.manifest, right.manifest, locale))
		.map((entry) => entry.manifest.id);
}

function groupByLocale(locale: string): string[][] {
	return groupCatalogManifestsByCategory(toCatalogEntries(), locale).map((group) =>
		group.entries.map((entry) => entry.manifest.id)
	);
}

describe('catalog-sort', () => {
	it('orders categories theme before tool before unknown', () => {
		expect(getPluginCategorySortIndex('theme')).toBeLessThan(getPluginCategorySortIndex('tool'));
		expect(getPluginCategorySortIndex('tool')).toBeLessThan(getPluginCategorySortIndex('codec'));
		expect(getPluginCategorySortIndex('unknown')).toBeGreaterThan(
			getPluginCategorySortIndex('codec')
		);
	});

	it('sorts official plugins by category then zh-CN pinyin order', () => {
		expect(sortByLocale('zh-CN')).toEqual([
			'theme-yumemita',
			'tool-qrcode',
			'tool-calendar-holidays',
			'tool-today',
			'tool-wallpaper'
		]);
	});

	it('sorts official plugins by category then en alphabetical order', () => {
		expect(sortByLocale('en')).toEqual([
			'theme-yumemita',
			'tool-wallpaper',
			'tool-calendar-holidays',
			'tool-qrcode',
			'tool-today'
		]);
	});

	it('groups official plugins by category with sorted entries inside each group', () => {
		expect(groupByLocale('zh-CN')).toEqual([
			['theme-yumemita'],
			['tool-qrcode', 'tool-calendar-holidays', 'tool-today', 'tool-wallpaper']
		]);
		expect(groupByLocale('en')).toEqual([
			['theme-yumemita'],
			['tool-wallpaper', 'tool-calendar-holidays', 'tool-qrcode', 'tool-today']
		]);
	});

	it('is case-insensitive for plain string names', () => {
		expect(comparePluginDisplayNames('alpha', 'Beta', 'en')).toBeLessThan(0);
		expect(comparePluginDisplayNames('Beta', 'alpha', 'en')).toBeGreaterThan(0);
	});
});
