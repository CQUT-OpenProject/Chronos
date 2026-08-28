import { hostT } from '$lib/i18n/host-i18n.svelte';
import type { ChronosEngine, Disposable, PluginManifest } from '@chronos/core';
import { PLUGIN_CONFIG_STORAGE_KEY } from '@chronos/core';
import { OfficialPluginAssetPipeline } from './asset-pipeline';
import { OfficialPluginCatalogClient } from './catalog-client';
import { OfficialPluginInstalledStore } from './installed-store';
import type { InstalledOfficialPluginRecord, PluginUpdateOffer } from './official-plugin-types';
import { OfficialPluginRuntimeActivator } from './runtime-activator';
import { assertValidManifestInstallUrl } from './manifest-url';
import { isPluginVersionNewer, validatePluginManifest } from './plugin-bundle';

export type { InstalledOfficialPluginRecord, PluginUpdateOffer } from './official-plugin-types';

const DEFAULT_CATALOG_URL = '/official-plugins/catalog.json';

export interface OfficialPluginServiceDeps {
	catalogClient: OfficialPluginCatalogClient;
	assetPipeline: OfficialPluginAssetPipeline;
	installedStore: OfficialPluginInstalledStore;
	runtimeActivator: OfficialPluginRuntimeActivator;
}

function createOfficialPluginServiceDeps(engine: ChronosEngine): OfficialPluginServiceDeps {
	const installedStore = new OfficialPluginInstalledStore(engine);
	const runtimeActivator = new OfficialPluginRuntimeActivator(engine, (pluginId) =>
		installedStore.has(pluginId)
	);
	return {
		catalogClient: new OfficialPluginCatalogClient(engine),
		assetPipeline: new OfficialPluginAssetPipeline(engine),
		installedStore,
		runtimeActivator
	};
}

export class OfficialPluginService implements Disposable {
	private initialized = false;
	private readonly catalogClient: OfficialPluginCatalogClient;
	private readonly assetPipeline: OfficialPluginAssetPipeline;
	private readonly installedStore: OfficialPluginInstalledStore;
	private readonly runtimeActivator: OfficialPluginRuntimeActivator;

	constructor(
		private readonly engine: ChronosEngine,
		deps?: OfficialPluginServiceDeps
	) {
		const resolved = deps ?? createOfficialPluginServiceDeps(engine);
		this.catalogClient = resolved.catalogClient;
		this.assetPipeline = resolved.assetPipeline;
		this.installedStore = resolved.installedStore;
		this.runtimeActivator = resolved.runtimeActivator;
	}

	async init(): Promise<void> {
		if (this.initialized) return;
		await this.installedStore.load();
		await this.installedStore.dedupeBuiltinOverlap();

		for (const record of this.installedStore.getCache()) {
			if (record.enabled) {
				try {
					await this.runtimeActivator.activate(record);
				} catch (err) {
					console.error(
						`[OfficialPluginService] Failed to load plugin ${record.manifest.id}:`,
						err
					);
				}
			}
		}
		this.initialized = true;
		this.installedStore.notify();
	}

	onChanged(listener: () => void): Disposable {
		return this.installedStore.onChanged(listener);
	}

	async fetchCatalog(catalogUrl?: string) {
		return this.catalogClient.fetchCatalog(catalogUrl);
	}

	async fetchManifest(manifestUrl: string) {
		return this.catalogClient.fetchManifest(manifestUrl);
	}

	async installFromManifestUrl(manifestUrl: string): Promise<void> {
		assertValidManifestInstallUrl(manifestUrl);
		const manifest = await this.fetchManifest(manifestUrl);
		await this.install(manifest, manifestUrl);
	}

	async install(
		manifest: PluginManifest,
		manifestUrl?: string,
		options?: { isUpdate?: boolean }
	): Promise<void> {
		validatePluginManifest(manifest);
		const assets = await this.assetPipeline.download(manifest, manifestUrl);

		const existing = this.installedStore.find(manifest.id);
		const record: InstalledOfficialPluginRecord = {
			manifest,
			code: assets.code ?? null,
			colorsJson: assets.colorsJson ?? null,
			iconThemeJson: assets.iconThemeJson ?? null,
			cssCode: assets.cssCode ?? null,
			manifestUrl: manifestUrl ?? existing?.manifestUrl,
			enabled: existing?.enabled ?? true,
			installedAt: existing?.installedAt ?? Date.now()
		};

		if (this.installedStore.has(manifest.id)) {
			await this.runtimeActivator.deactivate(manifest.id);
		}

		await this.installedStore.upsert(record);
		if (record.enabled) {
			await this.runtimeActivator.activate(record);
		}

		if (options?.isUpdate) {
			this.engine.notify(
				hostT('plugins.notify.updated', { pluginId: manifest.id, version: manifest.version }),
				'info'
			);
		} else if (manifest.type === 'theme') {
			this.engine.notify(hostT('plugins.notify.themeInstalled'), 'info');
		} else {
			this.engine.notify(hostT('plugins.notify.installed', { pluginId: manifest.id }), 'info');
		}
	}

	async uninstall(pluginId: string): Promise<void> {
		await this.runtimeActivator.deactivate(pluginId, { revertThemes: true });
		await this.installedStore.remove(pluginId);
		await this.engine.storage.clearPluginData?.(pluginId);
		this.engine.notify(hostT('plugins.notify.uninstalled', { pluginId }), 'info');
	}

	async enable(pluginId: string): Promise<void> {
		const record = this.installedStore.find(pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		if (record.enabled && this.runtimeActivator.isActive(pluginId)) return;

		await this.installedStore.setEnabled(pluginId, true);
		const updated = this.installedStore.find(pluginId);
		if (updated) {
			await this.runtimeActivator.activate(updated);
		}
		this.engine.notify(hostT('plugins.notify.enabled', { pluginId }), 'info');
	}

	async disable(pluginId: string): Promise<void> {
		const record = this.installedStore.find(pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		await this.installedStore.setEnabled(pluginId, false);
		await this.runtimeActivator.deactivate(pluginId, { revertThemes: true });
		this.engine.notify(hostT('plugins.notify.disabled', { pluginId }), 'info');
	}

	async getPluginConfig<T extends Record<string, unknown>>(pluginId: string): Promise<T | null> {
		return this.engine.storage.getPluginData<T>(pluginId, PLUGIN_CONFIG_STORAGE_KEY);
	}

	listInstalled(): ReadonlyArray<InstalledOfficialPluginRecord> {
		return this.installedStore.getCache();
	}

	getInstalled(pluginId: string): InstalledOfficialPluginRecord | undefined {
		return this.installedStore.find(pluginId);
	}

	isPluginActive(pluginId: string): boolean {
		return this.runtimeActivator.isActive(pluginId);
	}

	private async buildCatalogManifestMap(
		catalogUrl = DEFAULT_CATALOG_URL
	): Promise<Map<string, { manifest: PluginManifest; manifestUrl: string }>> {
		const catalog = await this.fetchCatalog(catalogUrl);
		const entries = await Promise.all(
			catalog.manifests.map(async (url) => {
				try {
					const manifest = await this.fetchManifest(url);
					return { manifest, manifestUrl: url };
				} catch (err) {
					console.error(`[OfficialPluginService] Failed to fetch catalog manifest ${url}:`, err);
					return null;
				}
			})
		);

		const map = new Map<string, { manifest: PluginManifest; manifestUrl: string }>();
		for (const entry of entries) {
			if (entry) map.set(entry.manifest.id, entry);
		}
		return map;
	}

	async checkForUpdates(
		catalogUrl = DEFAULT_CATALOG_URL,
		prefetchedCatalog?: ReadonlyMap<string, { manifest: PluginManifest; manifestUrl: string }>
	): Promise<PluginUpdateOffer[]> {
		let catalogMap: Map<string, { manifest: PluginManifest; manifestUrl: string }>;
		if (prefetchedCatalog) {
			catalogMap = new Map(prefetchedCatalog);
		} else {
			try {
				catalogMap = await this.buildCatalogManifestMap(catalogUrl);
			} catch (err) {
				console.error('[OfficialPluginService] Failed to fetch plugin catalog for updates:', err);
				catalogMap = new Map();
			}
		}

		const offers: PluginUpdateOffer[] = [];

		for (const record of this.listInstalled()) {
			const pluginId = record.manifest.id;
			const catalogEntry = catalogMap.get(pluginId);

			let remote: { manifest: PluginManifest; manifestUrl: string } | null = catalogEntry ?? null;

			if (!remote && record.manifestUrl) {
				try {
					const manifest = await this.fetchManifest(record.manifestUrl);
					remote = { manifest, manifestUrl: record.manifestUrl };
				} catch (err) {
					console.error(`[OfficialPluginService] Failed to fetch manifest for ${pluginId}:`, err);
				}
			}

			if (!remote) continue;
			if (remote.manifest.id !== pluginId) continue;
			if (!isPluginVersionNewer(remote.manifest.version, record.manifest.version)) continue;

			offers.push({
				pluginId,
				currentVersion: record.manifest.version,
				latestVersion: remote.manifest.version,
				manifest: remote.manifest,
				manifestUrl: remote.manifestUrl
			});
		}

		return offers;
	}

	async updateInstalled(pluginId: string, manifestUrl?: string): Promise<void> {
		const record = this.installedStore.find(pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}

		let resolvedUrl = manifestUrl ?? record.manifestUrl;

		if (!resolvedUrl) {
			const catalogMap = await this.buildCatalogManifestMap();
			resolvedUrl = catalogMap.get(pluginId)?.manifestUrl;
		}

		if (!resolvedUrl) {
			throw new Error(`No manifest URL available for plugin: ${pluginId}`);
		}

		const manifest = await this.fetchManifest(resolvedUrl);
		if (manifest.id !== pluginId) {
			throw new Error(`Plugin id mismatch: expected "${pluginId}", got "${manifest.id}"`);
		}

		await this.install(manifest, resolvedUrl, { isUpdate: true });
	}

	async resetAfterFactoryClear(): Promise<void> {
		this.runtimeActivator.disposeAll();
		this.installedStore.clear();
	}

	dispose(): void {
		this.runtimeActivator.disposeAll();
	}
}
