import { hostT } from '$lib/i18n/host-i18n.svelte';
import type { ChronosEngine, Disposable, PluginManifest } from '@chronos/core';
import { PLUGIN_CONFIG_STORAGE_KEY } from '@chronos/core';
import { APP_VERSION } from '$lib/config/app-meta';
import { isAbortError, swallowAbortRejection } from './abort-utils';
import { OfficialPluginAssetPipeline } from './asset-pipeline';
import { OfficialPluginCatalogClient } from './catalog-client';
import { OfficialPluginInstalledStore } from './installed-store';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';
import { replacePluginAssets } from './plugin-asset-replacer';
import { OfficialPluginRuntimeActivator } from './runtime-activator';
import { assertValidManifestInstallUrl } from './manifest-url';
import { validatePluginManifest } from './plugin-bundle';
import {
	OfficialPluginInstallQueue,
	type InstallQueueChangeKind,
	type PluginInstallStage,
	type PluginInstallTask,
	type PluginInstallProgress
} from './install-queue';
import { shouldSyncInstalledPlugin, syncInstalledPluginsWithHost } from './sync-installed-plugins';

export type { InstalledOfficialPluginRecord } from './official-plugin-types';
export type {
	InstallQueueChangeKind,
	PluginInstallStage,
	PluginInstallTask,
	PluginInstallProgress
};
export { OfficialPluginInstallQueue };

export interface OfficialPluginServiceDeps {
	catalogClient: OfficialPluginCatalogClient;
	assetPipeline: OfficialPluginAssetPipeline;
	installedStore: OfficialPluginInstalledStore;
	runtimeActivator: OfficialPluginRuntimeActivator;
	installQueue?: OfficialPluginInstallQueue;
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
	private disposed = false;
	private readonly hotUpdates = new Map<
		string,
		{ controller: AbortController; settled: Promise<InstalledOfficialPluginRecord> }
	>();
	private readonly catalogClient: OfficialPluginCatalogClient;
	private readonly assetPipeline: OfficialPluginAssetPipeline;
	private readonly installedStore: OfficialPluginInstalledStore;
	private readonly runtimeActivator: OfficialPluginRuntimeActivator;
	private readonly hostVersion: string;
	private hmrDisposable?: Disposable;
	readonly installQueue: OfficialPluginInstallQueue;

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
		this.installQueue =
			resolved.installQueue ??
			new OfficialPluginInstallQueue({
				runner: (manifest, manifestUrl, options) => this.install(manifest, manifestUrl, options),
				onTaskFailed: (task) => {
					this.engine.notify(
						hostT('snackbar.install.failed', { message: task.error ?? '' }),
						'error'
					);
				}
			});
	}

	async init(): Promise<void> {
		if (this.initialized || this.disposed) return;
		await this.loadInstalledStore();
		await this.activateCachedPlugins();
		this.initialized = true;
		this.installedStore.notify();
		await this.syncWithHostCatalog();
		this.installedStore.notify();
		this.setupDevHmr();
	}

	private async loadInstalledStore(): Promise<void> {
		await this.installedStore.load();
		await this.installedStore.dedupeBuiltinOverlap();
	}

	private async activateCachedPlugins(): Promise<void> {
		const pendingSyncIds = new Set(
			this.installedStore
				.getCache()
				.filter((record) => shouldSyncInstalledPlugin(record, this.hostVersion))
				.map((record) => record.manifest.id)
		);
		await this.activateInstalledFromCache({ skipIds: pendingSyncIds });
	}

	private async syncWithHostCatalog(): Promise<void> {
		await syncInstalledPluginsWithHost({
			hostVersion: this.hostVersion,
			catalogClient: this.catalogClient,
			getInstalledRecords: () => this.installedStore.getCache(),
			install: (manifest, manifestUrl, options) => this.install(manifest, manifestUrl, options)
		});
	}

	private setupDevHmr(): void {
		if (!import.meta.env.DEV) return;
		void import('./official-plugin-hmr').then(({ setupPluginHmr }) => {
			if (this.disposed) return;
			this.hmrDisposable?.dispose();
			this.hmrDisposable = setupPluginHmr(this, this.engine);
		});
	}

	private async activateInstalledFromCache(options?: { skipIds?: Set<string> }): Promise<void> {
		for (const record of this.installedStore.getCache()) {
			if (options?.skipIds?.has(record.manifest.id)) continue;
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

	async applyHotUpdate(
		data: {
			id: string;
			type?: 'theme' | 'tool';
			manifest?: Record<string, unknown>;
			code: string | null;
			cssCode: string | null;
			colorsJson: string | null;
			iconThemeJson: string | null;
		},
		options?: { signal?: AbortSignal }
	): Promise<InstalledOfficialPluginRecord> {
		const existing = this.installedStore.find(data.id);
		if (!existing) {
			throw new Error(`Plugin not installed: ${data.id}`);
		}

		const isTheme = data.type === 'theme' || existing.manifest.type === 'theme';
		const nextManifest = data.manifest
			? { ...existing.manifest, ...data.manifest, id: existing.manifest.id }
			: existing.manifest;

		const candidate: InstalledOfficialPluginRecord = {
			...existing,
			manifest: nextManifest as InstalledOfficialPluginRecord['manifest'],
			code: isTheme ? null : data.code,
			cssCode: isTheme ? null : data.cssCode,
			colorsJson: isTheme ? data.colorsJson : null,
			iconThemeJson: isTheme ? data.iconThemeJson : null
		};

		if (this.disposed) throw new DOMException('Aborted', 'AbortError');
		const controller = new AbortController();
		const signal = options?.signal
			? AbortSignal.any([options.signal, controller.signal])
			: controller.signal;
		const settled = this.replacePluginAssets(candidate, {
			preserveInstalledAt: true,
			signal,
			revertThemesOnDeactivate: false
		});
		const update = { controller, settled };
		this.hotUpdates.set(data.id, update);
		try {
			return await settled;
		} finally {
			if (this.hotUpdates.get(data.id) === update) this.hotUpdates.delete(data.id);
		}
	}

	private replacePluginAssets(
		candidate: InstalledOfficialPluginRecord,
		options?: {
			preserveInstalledAt?: boolean;
			revertThemesOnDeactivate?: boolean;
			signal?: AbortSignal;
		}
	): Promise<InstalledOfficialPluginRecord> {
		return replacePluginAssets(
			{
				installedStore: this.installedStore,
				runtimeActivator: this.runtimeActivator,
				isDisposed: () => this.disposed
			},
			candidate,
			options
		);
	}

	async install(
		manifest: PluginManifest,
		manifestUrl?: string,
		options?: {
			silent?: boolean;
			signal?: AbortSignal;
			onProgress?: (progress: {
				stage: PluginInstallStage;
				percent: number;
				message?: string;
			}) => void;
		}
	): Promise<void> {
		const signal = options?.signal;
		signal?.throwIfAborted?.();
		validatePluginManifest(manifest);

		const existingSnapshot = this.installedStore.find(manifest.id);

		try {
			const assets = await this.assetPipeline.download(manifest, manifestUrl, {
				signal,
				onProgress: options?.onProgress
			});

			signal?.throwIfAborted?.();
			options?.onProgress?.({ stage: 'installing', percent: 88 });

			const record: InstalledOfficialPluginRecord = {
				manifest,
				code: assets.code ?? null,
				colorsJson: assets.colorsJson ?? null,
				iconThemeJson: assets.iconThemeJson ?? null,
				cssCode: assets.cssCode ?? null,
				manifestUrl: manifestUrl ?? existingSnapshot?.manifestUrl,
				enabled: existingSnapshot?.enabled ?? true,
				installedAt: existingSnapshot?.installedAt ?? Date.now()
			};

			signal?.throwIfAborted?.();
			options?.onProgress?.({ stage: 'installing', percent: 96 });

			await this.replacePluginAssets(record, {
				preserveInstalledAt: Boolean(existingSnapshot),
				revertThemesOnDeactivate: true,
				signal
			});

			options?.onProgress?.({ stage: 'completed', percent: 100 });

			if (options?.silent) return;

			if (manifest.type === 'theme') {
				this.engine.notify(hostT('plugins.notify.themeInstalled'), 'info');
			} else {
				this.engine.notify(hostT('plugins.notify.installed', { pluginId: manifest.id }), 'info');
			}
		} catch (err: unknown) {
			if (signal?.aborted || isAbortError(err)) {
				throw new DOMException('Aborted', 'AbortError');
			}
			throw err;
		}
	}

	private async cancelHotUpdate(pluginId: string): Promise<void> {
		const update = this.hotUpdates.get(pluginId);
		if (!update) return;
		update.controller.abort();
		await swallowAbortRejection(update.settled);
	}

	async uninstall(pluginId: string): Promise<void> {
		await this.cancelHotUpdate(pluginId);
		await this.runtimeActivator.deactivate(pluginId, { revertThemes: true });
		await this.installedStore.remove(pluginId);
		await this.engine.storage.clearPluginData?.(pluginId);
		this.installQueue.clearFinished(pluginId);
		this.engine.notify(hostT('plugins.notify.uninstalled', { pluginId }), 'info');
	}

	async enable(pluginId: string): Promise<void> {
		await this.cancelHotUpdate(pluginId);
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
		await this.cancelHotUpdate(pluginId);
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

	async resetAfterFactoryClear(): Promise<void> {
		this.installQueue.cancelAll();
		this.runtimeActivator.disposeAll();
		this.installedStore.clear();
	}

	dispose(): void {
		this.disposed = true;
		for (const update of this.hotUpdates.values()) update.controller.abort();
		this.hmrDisposable?.dispose();
		this.installQueue.dispose();
		this.runtimeActivator.disposeAll();
	}
}
