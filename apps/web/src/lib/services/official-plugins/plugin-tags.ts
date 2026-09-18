import { hostT } from '$lib/i18n/host-i18n.svelte';
import type { PluginManifest, ToolGroup } from '@chronos/core';

/** Preset plugin category tags shown in official plugin UI. */
export const PLUGIN_CATEGORY_TAG_IDS = [
	'theme',
	'source',
	'tool-utility',
	'tool-dev',
	'exporter',
	'codec'
] as const;

export type PluginCategoryTagId = (typeof PLUGIN_CATEGORY_TAG_IDS)[number];

export function resolvePluginCatalogCategory(input: {
	type?: string;
	category?: string;
	toolGroup?: ToolGroup;
}): string {
	const baseType = input.type ?? input.category;
	if (baseType !== 'tool') return baseType ?? 'extension';

	if (input.toolGroup === 'dev') return 'tool-dev';
	return 'tool-utility';
}

export function resolveManifestCatalogCategory(
	manifest: Pick<PluginManifest, 'type' | 'toolGroup'>
): string {
	return resolvePluginCatalogCategory(manifest);
}

export function getPluginCategoryMeta(categoryOrType?: string): {
	label: string;
	badgeClass: string;
} {
	switch (categoryOrType) {
		case 'theme':
			return {
				label: hostT('pluginTags.theme'),
				badgeClass: 'bg-tertiary-container/80 text-on-tertiary-container'
			};
		case 'source':
			return {
				label: hostT('pluginTags.source'),
				badgeClass: 'bg-primary-container/80 text-on-primary-container'
			};
		case 'codec':
			return {
				label: hostT('pluginTags.codec'),
				badgeClass: 'bg-secondary-container/80 text-on-secondary-container'
			};
		case 'exporter':
			return {
				label: hostT('pluginTags.exporter'),
				badgeClass: 'bg-secondary-container/80 text-on-secondary-container'
			};
		case 'tool-utility':
			return {
				label: hostT('pluginTags.toolUtility'),
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
		case 'tool-dev':
			return {
				label: hostT('pluginTags.toolDev'),
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
		default:
			return {
				label: hostT('pluginTags.extension'),
				badgeClass: 'bg-surface-variant/80 text-on-surface-variant'
			};
	}
}
