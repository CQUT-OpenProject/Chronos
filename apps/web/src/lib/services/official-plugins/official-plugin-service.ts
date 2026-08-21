import type {
	ChronosEngine,
	Disposable,
	OfficialPluginCatalog,
	PluginManifest
} from '@chronos/core';
import { IHttpService, IRuntimeService } from '@chronos/core';
import { parsePluginBundle, validatePluginManifest } from './plugin-bundle';
import { clearWallpaperForPluginUnload } from '$lib/wallpaper/wallpaper-controller.svelte';
import { WALLPAPER_PLUGIN_ID } from '$lib/wallpaper/wallpaper-storage';

const INSTALLED_STORAGE_KEY = 'installed_plugins';
const OFFICIAL_PLUGINS_PLUGIN_ID = 'core.official-plugins';
const LEGACY_MARKETPLACE_PLUGIN_ID = 'core.marketplace';

export interface InstalledOfficialPluginRecord {
	manifest: PluginManifest;
	code: string;
	manifestUrl?: string;
	enabled: boolean;
	installedAt: number;
}

export class OfficialPluginService implements Disposable {
	private activeHandles = new Map<string, Disposable>();
	private installedCache: InstalledOfficialPluginRecord[] = [];
	private changeListeners = new Set<() => void>();
	private initialized = false;

	constructor(private engine: ChronosEngine) {}

	async init(): Promise<void> {
		if (this.initialized) return;
		await this.migrateLegacyStorage();
		this.installedCache = (await this.loadInstalledFromStorage()) || [];

		for (const record of this.installedCache) {
			if (record.enabled) {
				try {
					await this.loadPluginInstance(record.manifest, record.code);
				} catch (err) {
					console.error(
						`[OfficialPluginService] Failed to load plugin ${record.manifest.id}:`,
						err
					);
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
				console.error('[OfficialPluginService] Error in change listener:', err);
			}
		}
	}

	private async migrateLegacyStorage(): Promise<void> {
		const legacy = await this.engine.storage.getPluginData<InstalledOfficialPluginRecord[]>(
			LEGACY_MARKETPLACE_PLUGIN_ID,
			INSTALLED_STORAGE_KEY
		);
		if (!legacy || !Array.isArray(legacy) || legacy.length === 0) return;

		const current = await this.engine.storage.getPluginData<InstalledOfficialPluginRecord[]>(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY
		);
		if (current && current.length > 0) return;

		await this.engine.storage.setPluginData(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY,
			legacy
		);
	}

	private async loadInstalledFromStorage(): Promise<InstalledOfficialPluginRecord[]> {
		const data = await this.engine.storage.getPluginData<InstalledOfficialPluginRecord[]>(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY
		);
		return Array.isArray(data) ? data : [];
	}

	private async saveInstalledToStorage(): Promise<void> {
		await this.engine.storage.setPluginData(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY,
			this.installedCache
		);
		this.notify();
	}

	async fetchCatalog(
		catalogUrl = '/official-plugins/catalog.json'
	): Promise<OfficialPluginCatalog> {
		const response = await this.engine.services.get(IHttpService).request(catalogUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(
				`Failed to fetch official plugin catalog from ${catalogUrl}: ${response.status}`
			);
		}

		const catalog = (await response.json()) as OfficialPluginCatalog;
		if (!catalog || !Array.isArray(catalog.manifests)) {
			throw new Error('Invalid official plugin catalog schema format');
		}

		return catalog;
	}

	async fetchManifest(manifestUrl: string): Promise<PluginManifest> {
		const response = await this.engine.services.get(IHttpService).request(manifestUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch plugin manifest from ${manifestUrl}: ${response.status}`);
		}

		const manifest = (await response.json()) as PluginManifest;
		validatePluginManifest(manifest);
		return manifest;
	}

	async installFromManifestUrl(manifestUrl: string): Promise<void> {
		const manifest = await this.fetchManifest(manifestUrl);
		await this.install(manifest, manifestUrl);
	}

	async install(manifest: PluginManifest, manifestUrl?: string): Promise<void> {
		validatePluginManifest(manifest);
		const code = await this.downloadBundle(manifest);

		const record: InstalledOfficialPluginRecord = {
			manifest,
			code,
			manifestUrl,
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
		await this.syncWallpaperStateIfNeeded(manifest.id);
		if (manifest.type === 'theme') {
			this.engine.actions.notify('插件已安装并启用，可在「显示设置」中选择此外观主题', 'info');
		} else {
			this.engine.actions.notify(`插件「${manifest.id}」已安装并启用`, 'info');
		}
	}

	private async downloadBundle(manifest: PluginManifest): Promise<string> {
		const response = await this.engine.services.get(IHttpService).request(manifest.bundleUrl, {
			method: 'GET'
		});

		if (!response.ok) {
			throw new Error(`Failed to download plugin bundle from ${manifest.bundleUrl}`);
		}

		const code = await response.text();
		const computedHash = await this.engine.services.get(IRuntimeService).sha256(code);
		if (manifest.sha256 && computedHash.toLowerCase() !== manifest.sha256.toLowerCase()) {
			throw new Error(
				`Plugin integrity check failed for "${manifest.id}". Expected SHA-256 ${manifest.sha256}, got ${computedHash}`
			);
		}

		return code;
	}

	async uninstall(pluginId: string): Promise<void> {
		await this.unloadPluginInstance(pluginId);
		if (pluginId === WALLPAPER_PLUGIN_ID) {
			await clearWallpaperForPluginUnload();
		}
		this.installedCache = this.installedCache.filter((p) => p.manifest.id !== pluginId);
		await this.saveInstalledToStorage();
		this.engine.actions.notify(`插件「${pluginId}」已卸载`, 'info');
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
		await this.syncWallpaperStateIfNeeded(pluginId);
		this.engine.actions.notify(`已启用插件「${pluginId}」`, 'info');
	}

	async disable(pluginId: string): Promise<void> {
		const record = this.installedCache.find((p) => p.manifest.id === pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		record.enabled = false;
		await this.saveInstalledToStorage();
		await this.unloadPluginInstance(pluginId);
		this.engine.actions.notify(`已停用插件「${pluginId}」`, 'info');
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

		const plugin = parsePluginBundle(code);
		if (plugin.id !== manifest.id) {
			throw new Error(`Plugin id mismatch: manifest "${manifest.id}" vs bundle "${plugin.id}"`);
		}

		const handle = await this.engine.loadPlugin({
			...plugin,
			configSchema: manifest.configSchema ?? plugin.configSchema,
			permissions: manifest.permissions ?? manifest.capabilities ?? plugin.permissions,
			allowedDomains: manifest.allowedDomains ?? plugin.allowedDomains
		});

		this.activeHandles.set(manifest.id, handle);
		return handle;
	}

	private async syncWallpaperStateIfNeeded(pluginId: string): Promise<void> {
		if (pluginId !== WALLPAPER_PLUGIN_ID) return;
		const { getWallpaperController } = await import('$lib/wallpaper/wallpaper-controller.svelte');
		await getWallpaperController().syncFromStorage(true);
	}

	private revertThemeIfNeeded(): void {
		const prefs = this.engine.state.userPreferences;
		const activeThemeId = this.engine.state.activeThemeId;

		if (activeThemeId !== 'm3-default' && !this.engine.themes.getTheme(activeThemeId)) {
			this.engine.actions.setTheme('m3-default');
			void this.engine.actions.updatePreferences({
				paletteMode: 'vibrant',
				visualThemeId: 'm3-default'
			});
			return;
		}

		if (prefs.paletteMode === 'wallpaper' && !this.engine.themes.getTheme('wallpaper')) {
			this.engine.actions.setTheme('m3-default');
			void this.engine.actions.updatePreferences({
				paletteMode: 'vibrant',
				visualThemeId: 'm3-default'
			});
		}
	}

	private async unloadPluginInstance(pluginId: string): Promise<void> {
		const handle = this.activeHandles.get(pluginId);
		if (handle) {
			handle.dispose();
			this.activeHandles.delete(pluginId);
		}
		if (this.installedCache.some((p) => p.manifest.id === pluginId)) {
			this.revertThemeIfNeeded();
		}
	}

	listInstalled(): ReadonlyArray<InstalledOfficialPluginRecord> {
		return this.installedCache;
	}

	getInstalled(pluginId: string): InstalledOfficialPluginRecord | undefined {
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
