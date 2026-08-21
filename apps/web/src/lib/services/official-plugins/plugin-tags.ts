import type { PluginCategory } from '@chronos/core';

/** Preset plugin category tags shown in official plugin UI. */
export const PLUGIN_CATEGORY_TAG_IDS = ['theme', 'source', 'tool', 'exporter', 'codec'] as const;

export type PluginCategoryTagId = (typeof PLUGIN_CATEGORY_TAG_IDS)[number];

const PLUGIN_CATEGORY_TAG_SET = new Set<string>(PLUGIN_CATEGORY_TAG_IDS);

export function isPluginCategoryTagId(value: string): value is PluginCategoryTagId {
	return PLUGIN_CATEGORY_TAG_SET.has(value);
}

export function getPluginCategoryMeta(categoryOrType?: PluginCategory | string): {
	label: string;
	badgeClass: string;
} {
	switch (categoryOrType) {
		case 'theme':
			return {
				label: '主题',
				badgeClass: 'bg-tertiary-container/80 text-on-tertiary-container'
			};
		case 'source':
			return {
				label: '数据源',
				badgeClass: 'bg-primary-container/80 text-on-primary-container'
			};
		case 'codec':
			return {
				label: '编解码',
				badgeClass: 'bg-secondary-container/80 text-on-secondary-container'
			};
		case 'exporter':
			return {
				label: '导出器',
				badgeClass: 'bg-secondary-container/80 text-on-secondary-container'
			};
		case 'tool':
			return {
				label: '工具',
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
		default:
			return {
				label: '扩展',
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
	}
}
