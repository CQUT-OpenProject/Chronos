import type {
	Disposable,
	IStorageService,
	StorageChangeEvent,
	Timetable,
	UserPreferences,
	CourseQueryFilter,
	CourseQueryHit
} from '@chronos/core';
import { db, type ChronosDB } from '$lib/storage/db';
import { clearAppCaches } from '$lib/storage/cache-storage';
import { PreferencesStore } from '$lib/storage/preferences-store';
import { TimetableRepository } from '$lib/storage/timetable-repository';
import { PluginDataRepository } from '$lib/storage/plugin-data-repository';
import { clearKeysWithPrefix } from '$lib/storage/storage-key-utils';

/**
 * DexieStorageProvider implements the core IStorageService contract
 * using Dexie (IndexedDB) for structured records and localStorage for user preferences.
 */
export class DexieStorageProvider implements IStorageService {
	private listeners = new Set<(event: StorageChangeEvent) => void>();
	private storageListener?: (e: StorageEvent) => void;
	private readonly preferences: PreferencesStore;
	private readonly timetables: TimetableRepository;
	private readonly pluginData: PluginDataRepository;

	constructor(
		database: ChronosDB = db,
		localStore: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null,
		private cacheStore: CacheStorage | null = typeof caches !== 'undefined' ? caches : null
	) {
		this.preferences = new PreferencesStore(localStore);
		this.timetables = new TimetableRepository(database);
		this.pluginData = new PluginDataRepository(database);

		if (typeof window !== 'undefined') {
			this.storageListener = (e: StorageEvent) => {
				if (e.key?.startsWith('chronos_preferences:')) {
					this.notifyChange({ type: 'preferences', key: e.key });
				}
			};
			window.addEventListener('storage', this.storageListener);
		}
	}

	private notifyChange(event: StorageChangeEvent): void {
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch (err) {
				console.error('[DexieStorageProvider] Error in onChanged listener:', err);
			}
		}
	}

	onChanged(listener: (event: StorageChangeEvent) => void): Disposable {
		this.listeners.add(listener);
		return {
			dispose: () => {
				this.listeners.delete(listener);
			}
		};
	}

	async getTimetable(id: string): Promise<Timetable | null> {
		return this.timetables.getTimetable(id);
	}

	async listTimetables(): Promise<
		Array<{ id: string; name: string; courseCount: number; updatedAt: number }>
	> {
		return this.timetables.listTimetables();
	}

	async queryCourses(filter: CourseQueryFilter = {}): Promise<CourseQueryHit[]> {
		return this.timetables.queryCourses(filter);
	}

	async saveTimetable(timetable: Timetable): Promise<void> {
		try {
			await this.timetables.saveTimetable(timetable);
			this.notifyChange({ type: 'timetable', key: timetable.id });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to save timetable:', err);
			throw err;
		}
	}

	async deleteTimetable(id: string): Promise<void> {
		try {
			await this.timetables.deleteTimetable(id);
			this.notifyChange({ type: 'timetable', key: id });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to delete timetable:', err);
			throw err;
		}
	}

	async getActiveTimetableId(): Promise<string | null> {
		return this.preferences.getActiveTimetableId();
	}

	async setActiveTimetableId(id: string): Promise<void> {
		await this.preferences.setActiveTimetableId(id);
		this.notifyChange({ type: 'preferences', key: 'currentTimetableId' });
	}

	async getPreferences(): Promise<UserPreferences> {
		return this.preferences.getPreferences();
	}

	async savePreferences(patch: Partial<UserPreferences>): Promise<void> {
		await this.preferences.savePreferences(patch);
		this.notifyChange({ type: 'preferences', key: 'preferences' });
	}

	async getPluginData<T>(pluginId: string, key: string): Promise<T | null> {
		return this.pluginData.get<T>(pluginId, key);
	}

	async setPluginData<T>(pluginId: string, key: string, value: T): Promise<void> {
		const id = `${pluginId}:${key}`;
		try {
			await this.pluginData.set(pluginId, key, value);
			this.notifyChange({ type: 'pluginData', key: id });
		} catch (err) {
			console.warn(`[DexieStorageProvider] Failed to set plugin data for ${id}:`, err);
			throw err;
		}
	}

	async deletePluginData(pluginId: string, key: string): Promise<void> {
		const id = `${pluginId}:${key}`;
		try {
			await this.pluginData.delete(pluginId, key);
			this.notifyChange({ type: 'pluginData', key: id });
		} catch (err) {
			console.warn(`[DexieStorageProvider] Failed to delete plugin data for ${id}:`, err);
			throw err;
		}
	}

	async clearPluginData(pluginId: string): Promise<void> {
		try {
			await this.pluginData.clear(pluginId);
			this.notifyChange({ type: 'pluginData', key: pluginId });
		} catch (err) {
			console.warn(`[DexieStorageProvider] Failed to clear plugin data for ${pluginId}:`, err);
			throw err;
		}
	}

	async clearAllData(): Promise<void> {
		try {
			await this.timetables.clearTimetables();
			await this.pluginData.clearAll();
			if (typeof localStorage !== 'undefined') {
				clearKeysWithPrefix(localStorage, 'chronos');
			}
			if (typeof sessionStorage !== 'undefined') {
				clearKeysWithPrefix(sessionStorage, 'chronos');
			}
			await clearAppCaches(this.cacheStore);
			this.notifyChange({ type: 'preferences', key: 'clearAllData' });
			this.notifyChange({ type: 'timetable', key: 'clearAllData' });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to clear all data:', err);
			throw err;
		}
	}

	async estimateStorageBytes(): Promise<number> {
		const [timetableBytes, pluginBytes] = await Promise.all([
			this.timetables.estimateBytes(),
			this.pluginData.estimateBytes()
		]);
		return timetableBytes + pluginBytes;
	}

	dispose(): void {
		if (typeof window !== 'undefined' && this.storageListener) {
			window.removeEventListener('storage', this.storageListener);
		}
		this.listeners.clear();
	}
}
