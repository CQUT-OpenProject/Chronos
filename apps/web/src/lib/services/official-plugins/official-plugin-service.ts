import { hostT } from '$lib/i18n/host-i18n.svelte';
import type { ChronosEngine, Disposable, PluginManifest } from '@chronos/core';
import { PLUGIN_CONFIG_STORAGE_KEY } from '@chronos/core';
import { APP_VERSION } from '$lib/config/app-meta';
import { OfficialPluginAssetPipeline } from './asset-pipeline';
import { OfficialPluginCatalogClient } from './catalog-client';
import { OfficialPluginInstalledStore } from './installed-store';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';
import { OfficialPluginRuntimeActivator } from './runtime-activator';
import { assertValidManifestInstallUrl } from './manifest-url';
import { validatePluginManifest } from './plugin-bundle';
import {
	buildCatalogManifestMap,
	DEFAULT_OFFICIAL_CATALOG_URL,
	isOfficialCatalogManifestUrl,
	shouldSyncInstalledPlugin
} from './sync-installed-plugins';

export type { InstalledOfficialPluginRecord } from './official-plugin-types';

export interface OfficialPluginServiceDeps {
	catalogClient: OfficialPluginCatalogClient;
	assetPipeline: OfficialPluginAssetPipeline;
	installedStore: OfficialPluginInstalledStore;
	runtimeActivator: OfficialPluginRuntimeActivator;
	hostVersion?: string;
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
	private readonly hostVersion: string;

	constructor(
		private readonly engine: ChronosEngine,
		deps?: OfficialPluginServiceDeps
	) {
		const resolved = deps ?? createOfficialPluginServiceDeps(engine);
		this.catalogClient = resolved.catalogClient;
		this.assetPipeline = resolved.assetPipeline;
		this.installedStore = resolved.installedStore;
		this.runtimeActivator = resolved.runtimeActivator;
		this.hostVersion = resolved.hostVersion ?? APP_VERSION;
	}

	async init(): Promise<void> {
		if (this.initialized) return;
		await this.installedStore.load();
		await this.installedStore.dedupeBuiltinOverlap();
		await this.activateInstalledFromCache();
		this.initialized = true;
		this.installedStore.notify();
		await this.syncInstalledWithHost();
		this.installedStore.notify();
	}

	private async activateInstalledFromCache(): Promise<void> {
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
		options?: { silent?: boolean }
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

		// Activate before persisting: a rejected bundle must not leave a
		// dirty enabled record that errors on every boot.
		if (record.enabled) {
			try {
				await this.runtimeActivator.activate(record);
			} catch (err) {
				if (existing) {
					try {
						await this.runtimeActivator.activate(existing);
					} catch {
						// best effort: previous version also unloadable, keep it deactivated
					}
				}
				throw err;
			}
		}

		await this.installedStore.upsert(record);

		if (options?.silent) return;

		if (manifest.type === 'theme') {
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

	private async syncInstalledWithHost(catalogUrl = DEFAULT_OFFICIAL_CATALOG_URL): Promise<void> {
		const stale = this.installedStore
			.getCache()
			.filter((record) => shouldSyncInstalledPlugin(record, this.hostVersion));
		if (stale.length === 0) return;

		let catalogMap: Awaited<ReturnType<typeof buildCatalogManifestMap>>;
		try {
			const catalog = await this.catalogClient.fetchCatalog(catalogUrl);
			catalogMap = await buildCatalogManifestMap(catalog, (url) =>
				this.catalogClient.fetchManifest(url)
			);
		} catch (err) {
			console.error('[OfficialPluginService] Failed to sync installed plugins:', err);
			return;
		}

		for (const record of stale) {
			const entry = catalogMap.get(record.manifest.id);
			if (!entry) continue;
			if (record.manifestUrl && !isOfficialCatalogManifestUrl(record.manifestUrl)) continue;

			try {
				await this.install(entry.manifest, entry.manifestUrl, { silent: true });
			} catch (err) {
				console.error(`[OfficialPluginService] Failed to sync plugin ${record.manifest.id}:`, err);
			}
		}
	}

	async resetAfterFactoryClear(): Promise<void> {
		this.runtimeActivator.disposeAll();
		this.installedStore.clear();
	}

	dispose(): void {
		this.runtimeActivator.disposeAll();
	}
}
