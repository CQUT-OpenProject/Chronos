import type { ChronosEngine, Disposable, MarketplaceRegistry, PluginManifest } from '@chronos/core';
import { IHttpService, IRuntimeService } from '@chronos/core';
import { WorkerPluginBridge } from './worker-plugin-bridge';

const MARKETPLACE_STORAGE_KEY = 'installed_plugins';
const MARKETPLACE_PLUGIN_ID = 'core.marketplace';

export interface InstalledPluginRecord {
	manifest: PluginManifest;
	code: string;
	enabled: boolean;
	installedAt: number;
}

export class MarketplaceService implements Disposable {
	private activeHandles = new Map<string, Disposable>();
	private installedCache: InstalledPluginRecord[] = [];
	private changeListeners = new Set<() => void>();
	private initialized = false;

	constructor(private engine: ChronosEngine) {}

	async init(): Promise<void> {
		if (this.initialized) return;
		this.installedCache = (await this.loadInstalledFromStorage()) || [];

		for (const record of this.installedCache) {
			if (record.enabled) {
				try {
					await this.loadPluginInstance(record.manifest, record.code);
				} catch (err) {
					console.error(`[MarketplaceService] Failed to load plugin ${record.manifest.id}:`, err);
				}
			}
		}
		this.initialized = true;
		this.notify();
	}

	onChanged(listener: () => void): Disposable {
		this.changeListeners.add(listener);
		return {
			dispose: () => {
				this.changeListeners.delete(listener);
			}
		};
	}

	private notify(): void {
		for (const listener of this.changeListeners) {
			try {
				listener();
			} catch (err) {
				console.error('[MarketplaceService] Error in change listener:', err);
			}
		}
	}

	private async loadInstalledFromStorage(): Promise<InstalledPluginRecord[]> {
		const data = await this.engine.storage.getPluginData<InstalledPluginRecord[]>(
			MARKETPLACE_PLUGIN_ID,
			MARKETPLACE_STORAGE_KEY
		);
		return Array.isArray(data) ? data : [];
	}

	private async saveInstalledToStorage(): Promise<void> {
		await this.engine.storage.setPluginData(
			MARKETPLACE_PLUGIN_ID,
			MARKETPLACE_STORAGE_KEY,
			this.installedCache
		);
		this.notify();
	}

	async fetchRegistry(registryUrl = '/marketplace/registry.json'): Promise<MarketplaceRegistry> {
		const response = await this.engine.services.get(IHttpService).request(registryUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch marketplace registry from ${registryUrl}: ${response.status}`
			);
		}

		const registry = (await response.json()) as MarketplaceRegistry;
		if (!registry || !Array.isArray(registry.plugins)) {
			throw new Error('Invalid marketplace registry schema format');
		}

		return registry;
	}

	async install(manifest: PluginManifest, bundleUrlOverride?: string): Promise<void> {
		const targetUrl = bundleUrlOverride || manifest.bundleUrl;
		const response = await this.engine.services.get(IHttpService).request(targetUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`Failed to download plugin bundle from ${targetUrl}`);
		}

		const code = await response.text();

		// SHA-256 integrity hash verification
		const computedHash = await this.engine.services.get(IRuntimeService).sha256(code);
		if (manifest.sha256 && computedHash.toLowerCase() !== manifest.sha256.toLowerCase()) {
			throw new Error(
				`Plugin integrity check failed for "${manifest.id}". Expected SHA-256 ${manifest.sha256}, got ${computedHash}`
			);
		}

		const record: InstalledPluginRecord = {
			manifest,
			code,
			enabled: true,
			installedAt: Date.now()
		};

		const existingIndex = this.installedCache.findIndex((p) => p.manifest.id === manifest.id);
		if (existingIndex >= 0) {
			await this.unloadPluginInstance(manifest.id);
			this.installedCache[existingIndex] = record;
		} else {
			this.installedCache.push(record);
		}

		await this.saveInstalledToStorage();
		await this.loadPluginInstance(manifest, code);
		this.engine.actions.notify(`插件《${manifest.id}》已安装并启用`, 'info');
	}

	async uninstall(pluginId: string): Promise<void> {
		await this.unloadPluginInstance(pluginId);
		this.installedCache = this.installedCache.filter((p) => p.manifest.id !== pluginId);
		await this.saveInstalledToStorage();
		this.engine.actions.notify(`插件《${pluginId}》已卸载`, 'info');
	}

	async enable(pluginId: string): Promise<void> {
		const record = this.installedCache.find((p) => p.manifest.id === pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		if (record.enabled && this.activeHandles.has(pluginId)) return;

		record.enabled = true;
		await this.saveInstalledToStorage();
		await this.loadPluginInstance(record.manifest, record.code);
		this.engine.actions.notify(`已启用插件《${pluginId}》`, 'info');
	}

	async disable(pluginId: string): Promise<void> {
		const record = this.installedCache.find((p) => p.manifest.id === pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		record.enabled = false;
		await this.saveInstalledToStorage();
		await this.unloadPluginInstance(pluginId);
		this.engine.actions.notify(`已停用插件《${pluginId}》`, 'info');
	}

	async getPluginConfig<T extends Record<string, unknown>>(pluginId: string): Promise<T | null> {
		return this.engine.storage.getPluginData<T>(pluginId, '__config__');
	}

	async updatePluginConfig<T extends Record<string, unknown>>(
		pluginId: string,
		patch: Partial<T>
	): Promise<void> {
		const current = (await this.getPluginConfig<T>(pluginId)) || ({} as T);
		const updated = { ...current, ...patch };
		await this.engine.storage.setPluginData(pluginId, '__config__', updated);
		this.engine.events.emit('config:changed', { pluginId, config: updated });
		this.engine.actions.notify('插件设置已保存', 'info');
	}

	private async loadPluginInstance(manifest: PluginManifest, code: string): Promise<Disposable> {
		await this.unloadPluginInstance(manifest.id);

		// Dual-track loading: third-party and unsigned plugins are strictly sandboxed via WorkerPluginBridge
		const bridge = new WorkerPluginBridge(manifest, code, this.engine);
		await bridge.start();

		this.activeHandles.set(manifest.id, bridge);
		return bridge;
	}

	private async unloadPluginInstance(pluginId: string): Promise<void> {
		const handle = this.activeHandles.get(pluginId);
		if (handle) {
			handle.dispose();
			this.activeHandles.delete(pluginId);
		}
	}

	listInstalled(): ReadonlyArray<InstalledPluginRecord> {
		return this.installedCache;
	}

	getInstalled(pluginId: string): InstalledPluginRecord | undefined {
		return this.installedCache.find((p) => p.manifest.id === pluginId);
	}

	isPluginActive(pluginId: string): boolean {
		return this.activeHandles.has(pluginId);
	}

	dispose(): void {
		for (const [, handle] of this.activeHandles) {
			handle.dispose();
		}
		this.activeHandles.clear();
		this.changeListeners.clear();
	}
}
