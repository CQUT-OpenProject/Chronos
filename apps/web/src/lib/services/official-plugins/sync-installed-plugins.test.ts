import { describe, expect, it } from 'vite-plus/test';
import type { PluginManifest } from '@chronos/core';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';
import {
	buildCatalogManifestMap,
	isOfficialCatalogManifestUrl,
	shouldSyncInstalledPlugin
} from './sync-installed-plugins';

function record(
	overrides: Partial<InstalledOfficialPluginRecord> & { manifest: PluginManifest }
): InstalledOfficialPluginRecord {
	return {
		code: null,
		enabled: true,
		installedAt: 1,
		...overrides
	};
}

const BASE_MANIFEST: PluginManifest = {
	id: 'test-plugin',
	name: { 'zh-CN': 'Test' },
	version: '0.4.0',
	description: { 'zh-CN': 'Test' },
	author: 'Chronos',
	type: 'tool',
	bundleFormat: 'esm',
	bundleUrl: '/official-plugins/bundles/test-plugin/bundle.js',
	sha256: 'abc'
};

describe('isOfficialCatalogManifestUrl', () => {
	it('matches built-in official manifest paths', () => {
		expect(
			isOfficialCatalogManifestUrl('/official-plugins/manifests/tool-today.manifest.json')
		).toBe(true);
	});

	it('rejects external URLs', () => {
		expect(isOfficialCatalogManifestUrl('https://cdn.example.com/manifest.json')).toBe(false);
	});
});

describe('shouldSyncInstalledPlugin', () => {
	it('skips when versions already match', () => {
		expect(
			shouldSyncInstalledPlugin(
				record({
					manifest: { ...BASE_MANIFEST, version: '0.4.1' },
					manifestUrl: '/official-plugins/manifests/test-plugin.manifest.json'
				}),
				'0.4.1'
			)
		).toBe(false);
	});

	it('syncs stale official plugins', () => {
		expect(
			shouldSyncInstalledPlugin(
				record({
					manifest: BASE_MANIFEST,
					manifestUrl: '/official-plugins/manifests/test-plugin.manifest.json'
				}),
				'0.4.1'
			)
		).toBe(true);
	});

	it('skips external link installs even when versions differ', () => {
		expect(
			shouldSyncInstalledPlugin(
				record({
					manifest: BASE_MANIFEST,
					manifestUrl: 'https://cdn.example.com/plugins/test/manifest.json'
				}),
				'0.4.1'
			)
		).toBe(false);
	});
});

describe('buildCatalogManifestMap', () => {
	it('indexes manifests by plugin id', async () => {
		const manifest: PluginManifest = { ...BASE_MANIFEST, version: '0.4.1' };
		const map = await buildCatalogManifestMap(
			{
				version: 2,
				updatedAt: 1,
				manifests: ['/official-plugins/manifests/test-plugin.manifest.json']
			},
			async () => manifest
		);

		expect(map.get('test-plugin')).toEqual({
			manifest,
			manifestUrl: '/official-plugins/manifests/test-plugin.manifest.json'
		});
	});
});
