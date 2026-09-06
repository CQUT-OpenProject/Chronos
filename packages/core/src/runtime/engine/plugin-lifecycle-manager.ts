import { PLUGIN_CONFIG_STORAGE_KEY } from '../../constants/plugin-storage';
import type { ChronosPlugin } from '../../types/context';
import type { ChronosSlotMap } from '../../types/slots';
import type { Disposable } from '../../types/services';
import { ScopedContext } from '../scoped-context';
import type { EngineContextHost } from '../engine-context-host';
import type { EventPipeline } from '../event-pipeline';
import type { I18nCatalog } from '../../i18n/i18n-catalog';
import type { IStorageService } from '../../types/services';

type LoadedPluginEntry = {
	plugin: ChronosPlugin<Record<string, unknown>>;
	context: ScopedContext<Record<string, unknown>>;
};

/** Plugin load/unload lifecycle separate from profile orchestration. */
export class PluginLifecycleManager {
	private readonly loadedPlugins = new Map<string, LoadedPluginEntry>();

	constructor(
		private readonly host: EngineContextHost,
		private readonly storage: IStorageService,
		private readonly events: EventPipeline,
		private readonly i18nCatalog: I18nCatalog
	) {}

	getPluginContext(pluginId: string): ScopedContext<Record<string, unknown>> {
		const entry = this.loadedPlugins.get(pluginId);
		if (entry) {
			return entry.context;
		}
		return new ScopedContext<Record<string, unknown>>(pluginId, this.host);
	}

	getPluginContextForSlot<K extends keyof ChronosSlotMap>(
		slotName: K,
		slotId: string
	): ScopedContext<Record<string, unknown>> {
		const ownerPluginId = this.host.slots.resolveOwner(slotName, slotId);
		if (!ownerPluginId) {
			throw new Error(`No owner plugin registered for slot ${String(slotName)}/${slotId}`);
		}
		const entry = this.loadedPlugins.get(ownerPluginId);
		if (!entry) {
			throw new Error(`Owner plugin "${ownerPluginId}" is not loaded`);
		}
		return entry.context;
	}

	isPluginLoaded(pluginId: string): boolean {
		return this.loadedPlugins.has(pluginId);
	}

	async loadPlugin<Config extends object = Record<string, unknown>>(
		plugin: ChronosPlugin<Config>
	): Promise<Disposable> {
		if (this.loadedPlugins.has(plugin.id)) {
			await this.unloadPlugin(plugin.id);
		}

		await this.activatePlugin(plugin as unknown as ChronosPlugin<Record<string, unknown>>);

		return {
			dispose: () => {
				void this.unloadPlugin(plugin.id);
			}
		};
	}

	private async activatePlugin(plugin: ChronosPlugin<Record<string, unknown>>): Promise<void> {
		let initialConfig: Record<string, unknown> = { ...plugin.defaultConfig };
		try {
			const savedConfig = await this.storage.getPluginData<Record<string, unknown>>(
				plugin.id,
				PLUGIN_CONFIG_STORAGE_KEY
			);
			if (savedConfig) {
				initialConfig = { ...initialConfig, ...savedConfig };
			}
		} catch (err) {
			console.warn(`[ChronosEngine] Failed to load saved config for plugin "${plugin.id}":`, err);
		}

		const context = new ScopedContext(plugin.id, this.host, initialConfig);
		await plugin.apply(context);
		this.loadedPlugins.set(plugin.id, { plugin, context });
		this.events.emit('plugin:loaded', { pluginId: plugin.id });
	}

	async unloadPlugin(pluginId: string): Promise<void> {
		const entry = this.loadedPlugins.get(pluginId);
		if (!entry) return;

		this.loadedPlugins.delete(pluginId);
		this.i18nCatalog.disposePlugin(pluginId);
		entry.context.dispose();
		try {
			await entry.plugin.dispose?.();
		} catch (error) {
			console.error(`[ChronosEngine] Error in plugin "${pluginId}" dispose hook:`, error);
		}

		this.events.emit('plugin:unloaded', { pluginId });
	}

	disposeAll(): void {
		for (const [pluginId, entry] of this.loadedPlugins) {
			try {
				entry.context.dispose();
				void entry.plugin.dispose?.();
			} catch (error) {
				console.error(`[ChronosEngine] Error disposing plugin ${pluginId}:`, error);
			}
		}
		this.loadedPlugins.clear();
	}
}
