import type { OfficialPluginCatalog, PluginManifest } from '@chronos/core';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';

export const DEFAULT_OFFICIAL_CATALOG_URL = '/official-plugins/catalog.json';

export interface CatalogManifestEntry {
	manifest: PluginManifest;
	manifestUrl: string;
}

/** True when the manifest URL is served from the built-in official plugin catalog. */
export function isOfficialCatalogManifestUrl(url?: string): boolean {
	return typeof url === 'string' && url.startsWith('/official-plugins/manifests/');
}

/** True when the manifest URL points to an external http(s) host. */
export function isExternalManifestUrl(url?: string): boolean {
	return typeof url === 'string' && /^https?:\/\//i.test(url);
}

/** Returns true when a cached install should be refreshed from the official catalog. */
export function shouldSyncInstalledPlugin(
	record: InstalledOfficialPluginRecord,
	hostVersion: string
): boolean {
	if (record.manifest.version === hostVersion) return false;
	if (isExternalManifestUrl(record.manifestUrl)) return false;
	return true;
}

export async function buildCatalogManifestMap(
	catalog: OfficialPluginCatalog,
	fetchManifest: (manifestUrl: string) => Promise<PluginManifest>
): Promise<Map<string, CatalogManifestEntry>> {
	const entries = await Promise.all(
		catalog.manifests.map(async (manifestUrl) => {
			try {
				const manifest = await fetchManifest(manifestUrl);
				return { manifest, manifestUrl };
			} catch (err) {
				console.error(
					`[sync-installed-plugins] Failed to fetch catalog manifest ${manifestUrl}:`,
					err
				);
				return null;
			}
		})
	);

	const map = new Map<string, CatalogManifestEntry>();
	for (const entry of entries) {
		if (entry) map.set(entry.manifest.id, entry);
	}
	return map;
}
