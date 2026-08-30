import { resolveLocaleMapText, type PluginManifest } from '@chronos/core';
import { PLUGIN_CATEGORY_TAG_IDS } from './plugin-tags';

/** Category display order for official plugin catalog grouping. */
const PLUGIN_CATEGORY_SORT_ORDER = PLUGIN_CATEGORY_TAG_IDS;

export function getPluginCategorySortIndex(categoryOrType?: string): number {
	const index = PLUGIN_CATEGORY_SORT_ORDER.indexOf(
		categoryOrType as (typeof PLUGIN_CATEGORY_SORT_ORDER)[number]
	);
	return index >= 0 ? index : PLUGIN_CATEGORY_SORT_ORDER.length;
}

export function comparePluginDisplayNames(
	left: string | Record<string, string>,
	right: string | Record<string, string>,
	locale: string
): number {
	const leftText = typeof left === 'string' ? left : resolveLocaleMapText(left, locale);
	const rightText = typeof right === 'string' ? right : resolveLocaleMapText(right, locale);
	return leftText.localeCompare(rightText, locale, { sensitivity: 'base' });
}

export function compareCatalogManifests(
	left: Pick<PluginManifest, 'name' | 'type'>,
	right: Pick<PluginManifest, 'name' | 'type'>,
	locale: string
): number {
	const categoryDelta =
		getPluginCategorySortIndex(left.type) - getPluginCategorySortIndex(right.type);
	if (categoryDelta !== 0) return categoryDelta;
	return comparePluginDisplayNames(left.name, right.name, locale);
}

export function groupCatalogManifestsByCategory<T extends { manifest: PluginManifest }>(
	entries: readonly T[],
	locale: string
): Array<{ category: string; entries: T[] }> {
	const sorted = [...entries].sort((left, right) =>
		compareCatalogManifests(left.manifest, right.manifest, locale)
	);

	const groups: Array<{ category: string; entries: T[] }> = [];
	for (const entry of sorted) {
		const category = entry.manifest.type;
		const last = groups.at(-1);
		if (last?.category === category) {
			last.entries.push(entry);
		} else {
			groups.push({ category, entries: [entry] });
		}
	}
	return groups;
}
