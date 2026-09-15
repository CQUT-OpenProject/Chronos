import { describe, expect, it } from 'vite-plus/test';
import { getPluginCategoryMeta, isPluginCategoryTagId } from './plugin-tags';

describe('plugin-tags', () => {
	it('maps category ids to localized labels', () => {
		expect(getPluginCategoryMeta('theme').label).toBe('主题');
		expect(getPluginCategoryMeta('tool').label).toBe('工具');
		expect(getPluginCategoryMeta('source').label).toBe('数据源');
	});

	it('validates preset category ids', () => {
		expect(isPluginCategoryTagId('theme')).toBe(true);
		expect(isPluginCategoryTagId('community')).toBe(false);
	});
});
