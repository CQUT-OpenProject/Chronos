import type {
	ChronosEngine,
	Disposable,
	OfficialPluginCatalog,
	PluginManifest
} from '@chronos/core';
import {
	createIconThemeFromJson,
	createThemeFromColorJson,
	IHttpService,
	IRuntimeService,
	parseColorThemeJson,
	parseIconThemeJson,
	ScopedContext
} from '@chronos/core';
import { loadEsmPluginFromCode, validatePluginManifest } from './plugin-bundle';

const INSTALLED_STORAGE_KEY = 'installed_plugins';
const OFFICIAL_PLUGINS_PLUGIN_ID = 'core.official-plugins';

export interface InstalledOfficialPluginRecord {
	manifest: PluginManifest;
	code?: string | null;
	colorsJson?: string | null;
	iconThemeJson?: string | null;
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
					await this.loadPluginInstance(record);
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
		const assets = await this.downloadPluginAssets(manifest);

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

		const existingIndex = this.installedCache.findIndex((p) => p.manifest.id === manifest.id);
		if (existingIndex >= 0) {
			await this.unloadPluginInstance(manifest.id);
			this.installedCache[existingIndex] = record;
		} else {
			this.installedCache.push(record);
		}

		await this.saveInstalledToStorage();
		await this.loadPluginInstance(record);
		if (manifest.type === 'theme') {
			this.engine.actions.notify('插件已安装并启用，可在「显示设置」中选择此外观主题', 'info');
		} else {
			this.engine.actions.notify(`插件「${manifest.id}」已安装并启用`, 'info');
		}
	}

	private async downloadTextAsset(
		url: string,
		expectedSha256?: string,
		label = 'asset'
	): Promise<string> {
		const response = await this.engine.services.get(IHttpService).request(url, {
			method: 'GET'
		});
		if (!response.ok) {
			throw new Error(`Failed to download plugin ${label} from ${url}`);
		}
		const text = await response.text();
		if (expectedSha256) {
			const hash = await this.engine.services.get(IRuntimeService).sha256(text);
			if (hash.toLowerCase() !== expectedSha256.toLowerCase()) {
				throw new Error(
					`Plugin ${label} integrity check failed. Expected ${expectedSha256}, got ${hash}`
				);
			}
		}
		return text;
	}

	private async downloadPluginAssets(manifest: PluginManifest): Promise<{
		code?: string | null;
		colorsJson?: string | null;
		iconThemeJson?: string | null;
		cssCode?: string | null;
	}> {
		let code: string | null = null;
		let colorsJson: string | null = null;
		let iconThemeJson: string | null = null;
		let cssCode: string | null = null;

		if (manifest.colorsUrl) {
			colorsJson = await this.downloadTextAsset(
				manifest.colorsUrl,
				manifest.colorsSha256,
				'colors'
			);
		}

		if (manifest.iconThemeUrl) {
			iconThemeJson = await this.downloadTextAsset(
				manifest.iconThemeUrl,
				manifest.iconThemeSha256,
				'icon theme'
			);
		}

		if (manifest.bundleUrl) {
			code = await this.downloadTextAsset(manifest.bundleUrl, manifest.sha256, 'bundle');
			const cssUrl = manifest.cssUrl;
			const cssSha256 = manifest.cssSha256;
			if (cssUrl) {
				cssCode = await this.downloadTextAsset(cssUrl, cssSha256, 'css');
			}
		}

		return { code, colorsJson, iconThemeJson, cssCode };
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
		await this.loadPluginInstance(record);
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

	private async loadPluginInstance(record: InstalledOfficialPluginRecord): Promise<Disposable> {
		const manifest = record.manifest;
		await this.unloadPluginInstance(manifest.id);

		if (record.cssCode) this.injectCss(manifest.id, record.cssCode);

		const disposables: Disposable[] = [];

		if (record.colorsJson || record.iconThemeJson) {
			// JSON-only 主题资产经 ScopedContext 注册：slots↔registry 配对逻辑单源
			const ctx = new ScopedContext(manifest.id, this.engine);
			if (record.colorsJson) {
				disposables.push(
					ctx.registerSlot(
						'theme.definition',
						createThemeFromColorJson(parseColorThemeJson(JSON.parse(record.colorsJson)))
					)
				);
			}
			if (record.iconThemeJson) {
				disposables.push(
					ctx.registerSlot(
						'theme.icon.definition',
						createIconThemeFromJson(parseIconThemeJson(JSON.parse(record.iconThemeJson)))
					)
				);
			}
			disposables.push({ dispose: () => ctx.dispose() });
		}

		if (record.code) {
			const plugin = await loadEsmPluginFromCode(record.code);
			if (plugin.id !== manifest.id) {
				throw new Error(`Plugin id mismatch: manifest "${manifest.id}" vs bundle "${plugin.id}"`);
			}
			const handle = await this.engine.loadPlugin({
				...plugin,
				configSchema: manifest.configSchema ?? plugin.configSchema,
				allowedDomains: manifest.allowedDomains ?? plugin.allowedDomains
			});
			disposables.push(handle);
		}

		const composite: Disposable = {
			dispose: () => {
				for (const d of disposables) d.dispose();
			}
		};
		this.activeHandles.set(manifest.id, composite);
		return composite;
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
		const activeIconThemeId = prefs.visualIconThemeId ?? 'host-default';

		if (activeThemeId !== 'm3-default' && !this.engine.themes.getTheme(activeThemeId)) {
			this.engine.actions.setTheme('m3-default');
			void this.engine.actions.updatePreferences({
				paletteMode: 'vibrant',
				visualThemeId: 'm3-default'
			});
			return;
		}

		if (
			activeIconThemeId !== 'host-default' &&
			!this.engine.iconThemes.getIconTheme(activeIconThemeId)
		) {
			void this.engine.actions.updatePreferences({ visualIconThemeId: 'host-default' });
		}

		if (prefs.paletteMode !== 'vibrant' && !this.engine.themes.getTheme(prefs.paletteMode)) {
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

	async resetAfterFactoryClear(): Promise<void> {
		for (const [, handle] of this.activeHandles) {
			handle.dispose();
		}
		this.activeHandles.clear();
		for (const [, el] of this.styleElements) {
			el.remove();
		}
		this.styleElements.clear();
		this.installedCache = [];
		this.notify();
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
