import { describe, expect, it } from 'vite-plus/test';
import {
	getPluginCategoryMeta,
	isPluginCategoryTagId,
	resolvePluginCatalogCategory
} from './plugin-tags';

describe('plugin-tags', () => {
	it('maps category ids to localized labels', () => {
		expect(getPluginCategoryMeta('theme').label).toBe('主题');
		expect(getPluginCategoryMeta('tool-utility').label).toBe('实用工具');
		expect(getPluginCategoryMeta('tool-dev').label).toBe('开发工具');
		expect(getPluginCategoryMeta('source').label).toBe('数据源');
	});

	it('validates preset category ids', () => {
		expect(isPluginCategoryTagId('theme')).toBe(true);
		expect(isPluginCategoryTagId('tool-utility')).toBe(true);
		expect(isPluginCategoryTagId('tool')).toBe(false);
		expect(isPluginCategoryTagId('community')).toBe(false);
	});

	it('resolves tool plugins into utility or dev catalog categories', () => {
		expect(resolvePluginCatalogCategory({ type: 'tool', toolGroup: 'utility' })).toBe(
			'tool-utility'
		);
		expect(resolvePluginCatalogCategory({ type: 'tool', toolGroup: 'dev' })).toBe('tool-dev');
		expect(resolvePluginCatalogCategory({ type: 'theme' })).toBe('theme');
	});

	it('defaults tool plugins without toolGroup to utility', () => {
		expect(resolvePluginCatalogCategory({ type: 'tool' })).toBe('tool-utility');
	});
});
