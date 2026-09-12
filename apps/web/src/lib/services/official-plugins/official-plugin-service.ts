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
	OfficialPluginInstallQueue,
	type InstallQueueChangeKind,
	type PluginInstallStage,
	type PluginInstallTask,
	type PluginInstallProgress
} from './install-queue';
import {
	buildCatalogManifestMap,
	DEFAULT_OFFICIAL_CATALOG_URL,
	isOfficialCatalogManifestUrl,
	shouldSyncInstalledPlugin
} from './sync-installed-plugins';

export type { InstalledOfficialPluginRecord } from './official-plugin-types';
export type {
	InstallQueueChangeKind,
	PluginInstallStage,
	PluginInstallTask,
	PluginInstallProgress
};
export { OfficialPluginInstallQueue };

function isAbortError(err: unknown): boolean {
	if (!err) return false;
	if (typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'AbortError') {
		return true;
	}
	if (err instanceof Error && (err.message === 'Aborted' || err.name === 'AbortError')) {
		return true;
	}
	return false;
}

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
		if (this.initialized) return;
		await this.installedStore.load();
		await this.installedStore.dedupeBuiltinOverlap();

		const pendingSyncIds = new Set(
			this.installedStore
				.getCache()
				.filter((record) => shouldSyncInstalledPlugin(record, this.hostVersion))
				.map((record) => record.manifest.id)
		);

		await this.activateInstalledFromCache({ skipIds: pendingSyncIds });
		this.initialized = true;
		this.installedStore.notify();
		await this.syncInstalledWithHost();
		this.installedStore.notify();
		if (import.meta.env.DEV) {
			void import('./official-plugin-hmr').then(({ setupPluginHmr }) => {
				this.hmrDisposable?.dispose();
				this.hmrDisposable = setupPluginHmr(this, this.engine);
			});
		}
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

	async applyHotUpdate(data: {
		id: string;
		type?: 'theme' | 'tool';
		manifest?: Record<string, unknown>;
		code: string | null;
		cssCode: string | null;
		colorsJson: string | null;
		iconThemeJson: string | null;
	}): Promise<InstalledOfficialPluginRecord> {
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

		return this.replacePluginAssets(candidate, {
			preserveInstalledAt: true,
			revertThemesOnDeactivate: false
		});
	}

	private async replacePluginAssets(
		candidate: InstalledOfficialPluginRecord,
		options?: {
			preserveInstalledAt?: boolean;
			revertThemesOnDeactivate?: boolean;
			signal?: AbortSignal;
		}
	): Promise<InstalledOfficialPluginRecord> {
		const pluginId = candidate.manifest.id;
		const existing = this.installedStore.find(pluginId);
		const hadActiveRuntime = Boolean(existing?.enabled && this.runtimeActivator.isActive(pluginId));

		const record: InstalledOfficialPluginRecord = {
			...candidate,
			enabled: existing?.enabled ?? candidate.enabled,
			installedAt:
				options?.preserveInstalledAt && existing
					? existing.installedAt
					: (candidate.installedAt ?? existing?.installedAt ?? Date.now()),
			manifestUrl: candidate.manifestUrl ?? existing?.manifestUrl
		};

		let runtimeTouched = false;
		const rollbackErrors: unknown[] = [];

		const rollbackRuntime = async (cause: unknown): Promise<InstalledOfficialPluginRecord> => {
			if (runtimeTouched) {
				try {
					await this.runtimeActivator.deactivate(pluginId, {
						revertThemes: options?.revertThemesOnDeactivate ?? true
					});
					if (existing && hadActiveRuntime) {
						await this.runtimeActivator.activate(existing);
					}
				} catch (rollbackErr) {
					rollbackErrors.push(rollbackErr);
				}
			}

			if (rollbackErrors.length > 0) {
				throw new AggregateError(
					[cause, ...rollbackErrors],
					`Failed to replace plugin ${pluginId} and rollback previous runtime`
				);
			}
			throw cause;
		};

		try {
			options?.signal?.throwIfAborted?.();

			if (existing?.enabled) {
				await this.runtimeActivator.deactivate(pluginId, {
					revertThemes: options?.revertThemesOnDeactivate ?? false
				});
				runtimeTouched = true;
			}

			options?.signal?.throwIfAborted?.();

			if (record.enabled) {
				await this.runtimeActivator.activate(record);
				runtimeTouched = true;
			}

			options?.signal?.throwIfAborted?.();

			await this.installedStore.upsert(record);
			runtimeTouched = false;
			return record;
		} catch (err: unknown) {
			return rollbackRuntime(err);
		}
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

	async uninstall(pluginId: string): Promise<void> {
		await this.runtimeActivator.deactivate(pluginId, { revertThemes: true });
		await this.installedStore.remove(pluginId);
		await this.engine.storage.clearPluginData?.(pluginId);
		this.installQueue.clearFinished(pluginId);
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
		this.installQueue.cancelAll();
		this.runtimeActivator.disposeAll();
		this.installedStore.clear();
	}

	dispose(): void {
		this.hmrDisposable?.dispose();
		this.installQueue.dispose();
		this.runtimeActivator.disposeAll();
	}
}
