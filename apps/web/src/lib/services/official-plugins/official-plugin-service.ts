import type {
	ChronosEngine,
	Disposable,
	OfficialPluginCatalog,
	PluginManifest
} from '@chronos/core';
import { IHttpService, IRuntimeService } from '@chronos/core';
import { loadEsmPluginFromCode, validatePluginManifest } from './plugin-bundle';

const INSTALLED_STORAGE_KEY = 'installed_plugins';
const OFFICIAL_PLUGINS_PLUGIN_ID = 'core.official-plugins';

export interface InstalledOfficialPluginRecord {
	manifest: PluginManifest;
	code: string;
	cssCode?: string | null;
	manifestUrl?: string;
	enabled: boolean;
	installedAt: number;
}

export class OfficialPluginService implements Disposable {
	private activeHandles = new Map<string, Disposable>();
	private styleElements = new Map<string, HTMLStyleElement>();
	private installedCache: InstalledOfficialPluginRecord[] = [];
	private changeListeners = new Set<() => void>();
	private initialized = false;

	constructor(private engine: ChronosEngine) {}

	async init(): Promise<void> {
		if (this.initialized) return;
		this.installedCache = (await this.loadInstalledFromStorage()) || [];

		const hasBuiltinOverlap = this.installedCache.some((record) =>
			this.engine.isPluginLoaded(record.manifest.id)
		);
		if (hasBuiltinOverlap) {
			this.installedCache = this.installedCache.filter(
				(record) => !this.engine.isPluginLoaded(record.manifest.id)
			);
			await this.saveInstalledToStorage();
		}

		for (const record of this.installedCache) {
			if (record.enabled) {
				try {
					await this.loadPluginInstance(record.manifest, record.code, record.cssCode ?? null);
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
		const { code, cssCode } = await this.downloadBundle(manifest);

		const record: InstalledOfficialPluginRecord = {
			manifest,
			code,
			cssCode: cssCode ?? null,
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
		await this.loadPluginInstance(manifest, code, cssCode ?? null);
		if (manifest.type === 'theme') {
			this.engine.actions.notify('插件已安装并启用，可在「显示设置」中选择此外观主题', 'info');
		} else {
			this.engine.actions.notify(`插件「${manifest.id}」已安装并启用`, 'info');
		}
	}

	private async downloadBundle(
		manifest: PluginManifest
	): Promise<{ code: string; cssCode: string | null }> {
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

		let cssCode: string | null = null;
		const cssUrl = (manifest as unknown as { cssUrl?: string }).cssUrl;
		const cssSha256 = (manifest as unknown as { cssSha256?: string }).cssSha256;
		if (cssUrl) {
			const cssResponse = await this.engine.services.get(IHttpService).request(cssUrl, {
				method: 'GET'
			});
			if (!cssResponse.ok) {
				throw new Error(`Failed to download plugin css from ${cssUrl}`);
			}
			cssCode = await cssResponse.text();
			if (cssSha256) {
				const computedCssHash = await this.engine.services.get(IRuntimeService).sha256(cssCode);
				if (computedCssHash.toLowerCase() !== cssSha256.toLowerCase()) {
					throw new Error(
						`Plugin CSS integrity check failed for "${manifest.id}". Expected SHA-256 ${cssSha256}, got ${computedCssHash}`
					);
				}
			}
		}

		return { code, cssCode };
	}

	async uninstall(pluginId: string): Promise<void> {
		await this.unloadPluginInstance(pluginId);
		this.installedCache = this.installedCache.filter((p) => p.manifest.id !== pluginId);
		await this.engine.storage.clearPluginData?.(pluginId);
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
		await this.loadPluginInstance(record.manifest, record.code, record.cssCode ?? null);
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

	private async loadPluginInstance(
		manifest: PluginManifest,
		code: string,
		cssCode: string | null = null
	): Promise<Disposable> {
		await this.unloadPluginInstance(manifest.id);

		if (cssCode) this.injectCss(manifest.id, cssCode);

		const plugin = await loadEsmPluginFromCode(code);
		if (plugin.id !== manifest.id) {
			throw new Error(`Plugin id mismatch: manifest "${manifest.id}" vs bundle "${plugin.id}"`);
		}

		const handle = await this.engine.loadPlugin({
			...plugin,
			configSchema: manifest.configSchema ?? plugin.configSchema,
			permissions: manifest.permissions ?? plugin.permissions,
			allowedDomains: manifest.allowedDomains ?? plugin.allowedDomains
		});

		this.activeHandles.set(manifest.id, handle);
		return handle;
	}

	private injectCss(pluginId: string, css: string): void {
		if (typeof document === 'undefined') return;
		this.removeCss(pluginId);
		const el = document.createElement('style');
		el.setAttribute('data-plugin-id', pluginId);
		el.textContent = css;
		document.head.appendChild(el);
		this.styleElements.set(pluginId, el);
	}

	private removeCss(pluginId: string): void {
		const el = this.styleElements.get(pluginId);
		if (el) {
			el.remove();
			this.styleElements.delete(pluginId);
		} else if (typeof document !== 'undefined') {
			const fallback = document.querySelector(`style[data-plugin-id="${pluginId}"]`);
			fallback?.remove();
		}
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

		if (
			prefs.paletteMode !== 'vibrant' &&
			prefs.paletteMode !== 'material' &&
			!this.engine.themes.getTheme(prefs.paletteMode)
		) {
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
		this.removeCss(pluginId);
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
		for (const [, el] of this.styleElements) el.remove();
		this.styleElements.clear();
		this.changeListeners.clear();
	}
}
