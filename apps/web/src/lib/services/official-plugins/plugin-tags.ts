import { hostText } from '$lib/i18n/host-text';

/** Preset plugin category tags shown in official plugin UI. */
export const PLUGIN_CATEGORY_TAG_IDS = ['theme', 'source', 'tool', 'exporter', 'codec'] as const;

export type PluginCategoryTagId = (typeof PLUGIN_CATEGORY_TAG_IDS)[number];

const PLUGIN_CATEGORY_TAG_SET = new Set<string>(PLUGIN_CATEGORY_TAG_IDS);

export function isPluginCategoryTagId(value: string): value is PluginCategoryTagId {
	return PLUGIN_CATEGORY_TAG_SET.has(value);
}

export function getPluginCategoryMeta(categoryOrType?: string): {
	label: string;
	badgeClass: string;
} {
	switch (categoryOrType) {
		case 'theme':
			return {
				label: hostText('pluginTags.theme'),
				badgeClass: 'bg-tertiary-container/80 text-on-tertiary-container'
			};
		case 'source':
			return {
				label: hostText('pluginTags.source'),
				badgeClass: 'bg-primary-container/80 text-on-primary-container'
			};
		case 'codec':
			return {
				label: hostText('pluginTags.codec'),
				badgeClass: 'bg-secondary-container/80 text-on-secondary-container'
			};
		case 'exporter':
			return {
				label: hostText('pluginTags.exporter'),
				badgeClass: 'bg-secondary-container/80 text-on-secondary-container'
			};
		case 'tool':
			return {
				label: hostText('pluginTags.tool'),
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
		default:
			return {
				label: hostText('pluginTags.extension'),
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
	}
}
