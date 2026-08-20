import type {
	Disposable,
	IStorageService,
	StorageChangeEvent,
	Timetable,
	UserPreferences
} from '@chronos/core';
import { DEFAULT_USER_PREFERENCES, CURRENT_PREFERENCES_SCHEMA_VERSION } from '@chronos/core';
import { db, type ChronosDB } from '$lib/storage/db';
import { courseToRow, timetableFromRow, timetableToRow } from '$lib/storage/mappers';

const SETTINGS_KEYS = {
	currentTimetableId: 'chronos_preferences:current_timetable_id',
	themeMode: 'chronos_preferences:theme_mode',
	timetableLayoutMode: 'chronos_preferences:timetable_layout_mode',
	paletteMode: 'chronos_preferences:palette_mode',
	capsuleCornerStyle: 'chronos_preferences:capsule_corner_style',
	hapticFeedbackEnabled: 'chronos_preferences:haptic_feedback_enabled'
} as const;

const WALLPAPER_ID = 'default';

function normalizeThemeMode(raw: string | null): import('@chronos/core').ThemeMode {
	const value = raw?.trim().toLowerCase();
	if (value === 'light' || value === 'dark') return value;
	return 'auto';
}

function normalizeLayoutMode(raw: string | null): import('@chronos/core').TimetableLayoutMode {
	const value = raw?.trim().toLowerCase();
	if (value === 'compact' || value === 'fit') return 'compact';
	return 'fixed';
}

function normalizePaletteMode(raw: string | null): import('@chronos/core').PaletteMode {
	const value = raw?.trim().toLowerCase();
	if (value === 'wallpaper') return 'wallpaper';
	if (value === 'random' || value === 'monochrome') return 'random';
	return 'vibrant';
}

function normalizeCornerStyle(raw: string | null): import('@chronos/core').CapsuleCornerStyle {
	const value = raw?.trim().toLowerCase();
	if (value === 'sharp' || value === 'square') return 'sharp';
	if (value === 'pill' || value === 'merge') return 'pill';
	return 'rounded';
}

/**
 * DexieStorageProvider implements the core IStorageService contract
 * using Dexie (IndexedDB) for structured records and localStorage for user preferences.
 */
export class DexieStorageProvider implements IStorageService {
	private listeners = new Set<(event: StorageChangeEvent) => void>();
	private storageListener?: (e: StorageEvent) => void;

	constructor(
		private database: ChronosDB = db,
		private localStore: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null
	) {
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
		try {
			const row = await this.database.timetables.get(id);
			if (!row) return null;
			const courses = await this.database.courses.where('timetableId').equals(id).toArray();
			return timetableFromRow(row, courses);
		} catch {
			return null;
		}
	}

	async listTimetables(): Promise<
		Array<{ id: string; name: string; courseCount: number; updatedAt: number }>
	> {
		try {
			const rows = await this.database.timetables.orderBy('updatedAt').reverse().toArray();
			const results = await Promise.all(
				rows.map(async (r) => {
					const count = await this.database.courses.where('timetableId').equals(r.id).count();
					return { id: r.id, name: r.name, courseCount: count, updatedAt: r.updatedAt };
				})
			);
			return results;
		} catch {
			return [];
		}
	}

	async saveTimetable(timetable: Timetable): Promise<void> {
		try {
			const row = timetableToRow(timetable);
			const courseRows = timetable.courses.map((course) => courseToRow(course, timetable.id));

			await this.database.transaction(
				'rw',
				this.database.timetables,
				this.database.courses,
				async () => {
					await this.database.timetables.put(row);

					const persistedIds = new Set(
						await this.database.courses.where('timetableId').equals(timetable.id).primaryKeys()
					);
					const incomingIds = new Set(courseRows.map((course) => course.id));
					const removedIds = [...persistedIds].filter((id) => !incomingIds.has(String(id)));

					if (removedIds.length > 0) {
						await this.database.courses.bulkDelete(removedIds);
					}
					if (courseRows.length > 0) {
						await this.database.courses.bulkPut(courseRows);
					}
				}
			);

			this.notifyChange({ type: 'timetable', key: timetable.id });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to save timetable:', err);
		}
	}

	async patchTimetable(id: string, patch: Partial<Timetable>): Promise<void> {
		const existing = await this.getTimetable(id);
		if (!existing) return;

		const merged: Timetable = {
			...existing,
			...patch,
			updatedAt: Date.now()
		};

		await this.saveTimetable(merged);
	}

	async deleteTimetable(id: string): Promise<void> {
		try {
			await this.database.transaction(
				'rw',
				this.database.timetables,
				this.database.courses,
				async () => {
					await this.database.courses.where('timetableId').equals(id).delete();
					await this.database.timetables.delete(id);
				}
			);

			this.notifyChange({ type: 'timetable', key: id });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to delete timetable:', err);
		}
	}

	async getActiveTimetableId(): Promise<string | null> {
		if (!this.localStore) return null;
		return this.localStore.getItem(SETTINGS_KEYS.currentTimetableId);
	}

	async setActiveTimetableId(id: string): Promise<void> {
		if (!this.localStore) return;
		if (id) {
			this.localStore.setItem(SETTINGS_KEYS.currentTimetableId, id);
		} else {
			this.localStore.removeItem(SETTINGS_KEYS.currentTimetableId);
		}
		this.notifyChange({ type: 'preferences', key: 'currentTimetableId' });
	}

	async getPreferences(): Promise<UserPreferences> {
		if (!this.localStore) return { ...DEFAULT_USER_PREFERENCES };

		const themeMode = normalizeThemeMode(this.localStore.getItem(SETTINGS_KEYS.themeMode));
		const timetableLayoutMode = normalizeLayoutMode(
			this.localStore.getItem(SETTINGS_KEYS.timetableLayoutMode)
		);
		const paletteMode = normalizePaletteMode(this.localStore.getItem(SETTINGS_KEYS.paletteMode));
		const capsuleCornerStyle = normalizeCornerStyle(
			this.localStore.getItem(SETTINGS_KEYS.capsuleCornerStyle)
		);
		const hapticRaw = this.localStore.getItem(SETTINGS_KEYS.hapticFeedbackEnabled);
		const hapticFeedbackEnabled = hapticRaw !== '0' && hapticRaw !== 'false';

		return {
			schemaVersion: CURRENT_PREFERENCES_SCHEMA_VERSION,
			themeMode,
			paletteMode,
			timetableLayoutMode,
			capsuleCornerStyle,
			hapticFeedbackEnabled
		};
	}

	async savePreferences(patch: Partial<UserPreferences>): Promise<void> {
		if (!this.localStore) return;

		if (patch.themeMode !== undefined) {
			this.localStore.setItem(SETTINGS_KEYS.themeMode, patch.themeMode);
		}
		if (patch.timetableLayoutMode !== undefined) {
			this.localStore.setItem(SETTINGS_KEYS.timetableLayoutMode, patch.timetableLayoutMode);
		}
		if (patch.paletteMode !== undefined) {
			this.localStore.setItem(SETTINGS_KEYS.paletteMode, patch.paletteMode);
		}
		if (patch.capsuleCornerStyle !== undefined) {
			this.localStore.setItem(SETTINGS_KEYS.capsuleCornerStyle, patch.capsuleCornerStyle);
		}
		if (patch.hapticFeedbackEnabled !== undefined) {
			this.localStore.setItem(
				SETTINGS_KEYS.hapticFeedbackEnabled,
				patch.hapticFeedbackEnabled ? '1' : '0'
			);
		}

		this.notifyChange({ type: 'preferences', key: 'preferences' });
	}

	async getWallpaper(): Promise<Uint8Array | null> {
		try {
			const row = await this.database.wallpapers.get(WALLPAPER_ID);
			if (!row?.blob) return null;
			const buffer = await row.blob.arrayBuffer();
			return new Uint8Array(buffer);
		} catch {
			return null;
		}
	}

	async setWallpaper(wallpaper: Uint8Array | null): Promise<void> {
		try {
			if (wallpaper) {
				const blob = new Blob([wallpaper as unknown as Uint8Array<ArrayBuffer>]);
				await this.database.wallpapers.put({
					id: WALLPAPER_ID,
					blob,
					updatedAt: Date.now()
				});
			} else {
				await this.database.wallpapers.delete(WALLPAPER_ID);
			}
			this.notifyChange({ type: 'preferences', key: 'wallpaper' });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to set wallpaper:', err);
		}
	}

	async getPluginData<T>(pluginId: string, key: string): Promise<T | null> {
		const id = `${pluginId}:${key}`;
		try {
			const row = await this.database.pluginData.get(id);
			if (!row?.valueJson) return null;
			return JSON.parse(row.valueJson) as T;
		} catch {
			return null;
		}
	}

	async setPluginData<T>(pluginId: string, key: string, value: T): Promise<void> {
		const id = `${pluginId}:${key}`;
		try {
			await this.database.pluginData.put({
				id,
				pluginId,
				key,
				valueJson: JSON.stringify(value),
				updatedAt: Date.now()
			});
			this.notifyChange({ type: 'pluginData', key: id });
		} catch (err) {
			console.warn(`[DexieStorageProvider] Failed to set plugin data for ${id}:`, err);
		}
	}

	async deletePluginData(pluginId: string, key: string): Promise<void> {
		const id = `${pluginId}:${key}`;
		try {
			await this.database.pluginData.delete(id);
			this.notifyChange({ type: 'pluginData', key: id });
		} catch (err) {
			console.warn(`[DexieStorageProvider] Failed to delete plugin data for ${id}:`, err);
		}
	}

	async clearAllData(): Promise<void> {
		try {
			await this.database.transaction(
				'rw',
				this.database.timetables,
				this.database.courses,
				this.database.wallpapers,
				this.database.pluginData,
				async () => {
					await this.database.timetables.clear();
					await this.database.courses.clear();
					await this.database.wallpapers.clear();
					await this.database.pluginData.clear();
				}
			);
			if (this.localStore) {
				const keysToRemove: string[] = [];
				for (let i = 0; i < this.localStore.length; i++) {
					const k = this.localStore.key(i);
					if (k?.startsWith('chronos')) {
						keysToRemove.push(k);
					}
				}
				for (const k of keysToRemove) {
					this.localStore.removeItem(k);
				}
			}
			if (typeof sessionStorage !== 'undefined') {
				const keysToRemove: string[] = [];
				for (let i = 0; i < sessionStorage.length; i++) {
					const k = sessionStorage.key(i);
					if (k?.startsWith('chronos')) {
						keysToRemove.push(k);
					}
				}
				for (const k of keysToRemove) {
					sessionStorage.removeItem(k);
				}
			}
			this.notifyChange({ type: 'preferences', key: 'clearAllData' });
			this.notifyChange({ type: 'timetable', key: 'clearAllData' });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to clear all data:', err);
		}
	}

	dispose(): void {
		if (typeof window !== 'undefined' && this.storageListener) {
			window.removeEventListener('storage', this.storageListener);
		}
		this.listeners.clear();
	}
}
