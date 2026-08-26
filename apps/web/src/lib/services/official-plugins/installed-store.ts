import type { ChronosEngine, Disposable } from '@chronos/core';
import {
	INSTALLED_STORAGE_KEY,
	OFFICIAL_PLUGINS_PLUGIN_ID,
	type InstalledOfficialPluginRecord
} from './official-plugin-types';

export class OfficialPluginInstalledStore {
	private cache: InstalledOfficialPluginRecord[] = [];
	private changeListeners = new Set<() => void>();

	constructor(private readonly engine: ChronosEngine) {}

	onChanged(listener: () => void): Disposable {
		this.changeListeners.add(listener);
		return {
			dispose: () => {
				this.changeListeners.delete(listener);
			}
		};
	}

	notify(): void {
		for (const listener of this.changeListeners) {
			try {
				listener();
			} catch (err) {
				console.error('[OfficialPluginInstalledStore] Error in change listener:', err);
			}
		}
	}

	async load(): Promise<InstalledOfficialPluginRecord[]> {
		const data = await this.engine.storage.getPluginData<InstalledOfficialPluginRecord[]>(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY
		);
		this.cache = Array.isArray(data) ? data : [];
		return this.cache;
	}

	getCache(): ReadonlyArray<InstalledOfficialPluginRecord> {
		return this.cache;
	}

	find(pluginId: string): InstalledOfficialPluginRecord | undefined {
		return this.cache.find((p) => p.manifest.id === pluginId);
	}

	has(pluginId: string): boolean {
		return this.cache.some((p) => p.manifest.id === pluginId);
	}

	async dedupeBuiltinOverlap(): Promise<boolean> {
		const hasBuiltinOverlap = this.cache.some((record) =>
			this.engine.isPluginLoaded(record.manifest.id)
		);
		if (!hasBuiltinOverlap) return false;

		this.cache = this.cache.filter((record) => !this.engine.isPluginLoaded(record.manifest.id));
		await this.persist();
		return true;
	}

	async upsert(record: InstalledOfficialPluginRecord): Promise<void> {
		const existingIndex = this.cache.findIndex((p) => p.manifest.id === record.manifest.id);
		if (existingIndex >= 0) {
			this.cache[existingIndex] = record;
		} else {
			this.cache.push(record);
		}
		await this.persist();
	}

	async remove(pluginId: string): Promise<void> {
		this.cache = this.cache.filter((p) => p.manifest.id !== pluginId);
		await this.persist();
	}

	async setEnabled(pluginId: string, enabled: boolean): Promise<void> {
		const record = this.find(pluginId);
		if (!record) {
			throw new Error(`Plugin not installed: ${pluginId}`);
		}
		record.enabled = enabled;
		await this.persist();
	}

	async persist(): Promise<void> {
		await this.engine.storage.setPluginData(
			OFFICIAL_PLUGINS_PLUGIN_ID,
			INSTALLED_STORAGE_KEY,
			this.cache
		);
		this.notify();
	}

	clear(): void {
		this.cache = [];
		this.notify();
	}
}
