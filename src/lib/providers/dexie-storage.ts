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
		const row = await this.database.timetables.get(id);
		if (!row) return null;
		const courses = await this.database.courses.where('timetableId').equals(id).toArray();
		return timetableFromRow(row, courses);
	}

	async listTimetables(): Promise<Array<{ id: string; name: string; updatedAt: number }>> {
		const rows = await this.database.timetables.orderBy('updatedAt').reverse().toArray();
		return rows.map((r) => ({ id: r.id, name: r.name, updatedAt: r.updatedAt }));
	}

	async saveTimetable(timetable: Timetable): Promise<void> {
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

		const themeModeRaw = this.localStore.getItem(SETTINGS_KEYS.themeMode)?.toLowerCase();
		const layoutModeRaw = this.localStore.getItem(SETTINGS_KEYS.timetableLayoutMode)?.toLowerCase();
		const paletteModeRaw = this.localStore.getItem(SETTINGS_KEYS.paletteMode)?.toLowerCase();
		const cornerStyleRaw = this.localStore.getItem(SETTINGS_KEYS.capsuleCornerStyle)?.toLowerCase();
		const hapticRaw = this.localStore.getItem(SETTINGS_KEYS.hapticFeedbackEnabled);

		const themeMode = themeModeRaw === 'light' || themeModeRaw === 'dark' ? themeModeRaw : 'auto';
		const timetableLayoutMode =
			layoutModeRaw === 'compact' || layoutModeRaw === 'fit' ? 'compact' : 'fixed';
		const paletteMode =
			paletteModeRaw === 'monochrome' || paletteModeRaw === 'wallpaper'
				? paletteModeRaw
				: 'vibrant';
		const capsuleCornerStyle =
			cornerStyleRaw === 'sharp' || cornerStyleRaw === 'pill' ? cornerStyleRaw : 'rounded';
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
		const row = await this.database.wallpapers.get(WALLPAPER_ID);
		if (!row?.blob) return null;
		const buffer = await row.blob.arrayBuffer();
		return new Uint8Array(buffer);
	}

	async setWallpaper(wallpaper: Uint8Array | null): Promise<void> {
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
	}

	async getPluginData<T>(pluginId: string, key: string): Promise<T | null> {
		const id = `${pluginId}:${key}`;
		const row = await this.database.pluginData.get(id);
		if (!row?.valueJson) return null;
		try {
			return JSON.parse(row.valueJson) as T;
		} catch {
			return null;
		}
	}

	async setPluginData<T>(pluginId: string, key: string, value: T): Promise<void> {
		const id = `${pluginId}:${key}`;
		await this.database.pluginData.put({
			id,
			pluginId,
			key,
			valueJson: JSON.stringify(value),
			updatedAt: Date.now()
		});
		this.notifyChange({ type: 'pluginData', key: id });
	}

	async deletePluginData(pluginId: string, key: string): Promise<void> {
		const id = `${pluginId}:${key}`;
		await this.database.pluginData.delete(id);
		this.notifyChange({ type: 'pluginData', key: id });
	}

	dispose(): void {
		if (typeof window !== 'undefined' && this.storageListener) {
			window.removeEventListener('storage', this.storageListener);
		}
		this.listeners.clear();
	}
}
