import { PLUGIN_CONFIG_STORAGE_KEY } from '../constants/plugin-storage';
import type { IStorageService } from '../types/services';
import type { EngineContextHost } from './engine-context-host';
import type { Disposable } from '../types/services';

export interface PluginStorageApi {
	get<T = unknown>(key: string): Promise<T | null>;
	set<T = unknown>(key: string, value: T): Promise<void>;
	delete(key: string): Promise<void>;
}

export interface PluginI18nApi {
	readonly locale: string;
	t(key: string, params?: Record<string, unknown>): string;
	registerMessages(messages: Record<string, Record<string, string>>): Disposable;
}

/** Creates per-plugin storage scoped to pluginId. */
export function createPluginStorage(
	pluginId: string,
	getStorage: () => IStorageService
): PluginStorageApi {
	return {
		get: <T = unknown>(key: string) => getStorage().getPluginData<T>(pluginId, key),
		set: <T = unknown>(key: string, value: T) =>
			getStorage().setPluginData<T>(pluginId, key, value),
		delete: (key: string) => {
			if (key === PLUGIN_CONFIG_STORAGE_KEY) {
				console.warn(`[ScopedContext:${pluginId}] 拒绝删除保留键 __config__，请使用 updateConfig`);
				return Promise.resolve();
			}
			return getStorage().deletePluginData(pluginId, key);
		}
	};
}

/** Creates per-plugin i18n helpers bound to the engine host. */
export function createPluginI18n(
	pluginId: string,
	host: EngineContextHost,
	onRegister: (disposable: Disposable) => void
): PluginI18nApi {
	return {
		get locale() {
			return host.locale;
		},
		t: (key: string, params?: Record<string, unknown>) =>
			host.translateForPlugin(pluginId, key, params),
		registerMessages: (messages: Record<string, Record<string, string>>) => {
			const handle = host.i18nCatalog.register(pluginId, messages);
			onRegister(handle);
			return handle;
		}
	};
}
