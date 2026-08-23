import type { ChronosEngine, Disposable, PluginManifest } from '@chronos/core';
import { PLUGIN_CONFIG_STORAGE_KEY } from '@chronos/core';
import { OfficialPluginAssetPipeline } from './asset-pipeline';
import { OfficialPluginCatalogClient } from './catalog-client';
import { OfficialPluginInstalledStore } from './installed-store';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';
import { OfficialPluginRuntimeActivator } from './runtime-activator';
import { validatePluginManifest } from './plugin-bundle';

export type { InstalledOfficialPluginRecord } from './official-plugin-types';

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
		const manifest = await this.fetchManifest(manifestUrl);
		await this.install(manifest, manifestUrl);
	}

	async install(manifest: PluginManifest, manifestUrl?: string): Promise<void> {
		validatePluginManifest(manifest);
		const assets = await this.assetPipeline.download(manifest);

		const record: InstalledOfficialPluginRecord = {
			manifest,
			code: assets.code ?? null,
			colorsJson: assets.colorsJson ?? null,
			iconThemeJson: assets.iconThemeJson ?? null,
			cssCode: assets.cssCode ?? null,
			manifestUrl,
			enabled: true,
			installedAt: Date.now()
		};

		if (this.installedStore.has(manifest.id)) {
			await this.runtimeActivator.deactivate(manifest.id);
		}

		await this.installedStore.upsert(record);
		await this.runtimeActivator.activate(record);

		if (manifest.type === 'theme') {
			this.engine.actions.notify('插件已安装并启用，可在「显示设置」中选择此外观主题', 'info');
		} else {
			this.engine.actions.notify(`插件「${manifest.id}」已安装并启用`, 'info');
		}
	}

	async uninstall(pluginId: string): Promise<void> {
		await this.runtimeActivator.deactivate(pluginId);
		await this.installedStore.remove(pluginId);
		await this.engine.storage.clearPluginData?.(pluginId);
		this.engine.actions.notify(`插件「${pluginId}」已卸载`, 'info');
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
		this.engine.actions.notify(`已启用插件「${pluginId}」`, 'info');
	}

	async disable(pluginId: string): Promise<void> {
		const record = this.installedStore.find(pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		await this.installedStore.setEnabled(pluginId, false);
		await this.runtimeActivator.deactivate(pluginId);
		this.engine.actions.notify(`已停用插件「${pluginId}」`, 'info');
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

	async resetAfterFactoryClear(): Promise<void> {
		this.runtimeActivator.disposeAll();
		this.installedStore.clear();
	}

	dispose(): void {
		this.runtimeActivator.disposeAll();
	}
}
