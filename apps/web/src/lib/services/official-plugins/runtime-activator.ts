import type { ChronosEngine, Disposable } from '@chronos/core';
import {
	createIconThemeFromJson,
	createThemeFromColorJson,
	parseColorThemeJson,
	parseIconThemeJson,
	ScopedContext
} from '@chronos/core';
import { loadEsmPluginFromCode } from './plugin-bundle';
import type { InstalledOfficialPluginRecord } from './official-plugin-types';

export class OfficialPluginRuntimeActivator {
	private activeHandles = new Map<string, Disposable>();
	private styleElements = new Map<string, HTMLStyleElement>();

	constructor(
		private readonly engine: ChronosEngine,
		private readonly isInstalled: (pluginId: string) => boolean
	) {}

	isActive(pluginId: string): boolean {
		return this.activeHandles.has(pluginId);
	}

	async activate(record: InstalledOfficialPluginRecord): Promise<Disposable> {
		const manifest = record.manifest;
		await this.deactivate(manifest.id);

		if (record.cssCode) this.injectCss(manifest.id, record.cssCode);

		const disposables: Disposable[] = [];

		if (record.colorsJson || record.iconThemeJson) {
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

	async deactivate(pluginId: string, options?: { revertThemes?: boolean }): Promise<void> {
		const handle = this.activeHandles.get(pluginId);
		if (handle) {
			handle.dispose();
			this.activeHandles.delete(pluginId);
		}
		this.removeCss(pluginId);
		if (options?.revertThemes && this.isInstalled(pluginId)) {
			void this.engine.revertToDefaultThemes();
		}
	}

	disposeAll(): void {
		for (const [, handle] of this.activeHandles) {
			handle.dispose();
		}
		this.activeHandles.clear();
		for (const [, el] of this.styleElements) {
			el.remove();
		}
		this.styleElements.clear();
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
}
