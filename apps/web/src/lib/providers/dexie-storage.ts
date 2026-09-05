import type {
	Disposable,
	IStorageService,
	StorageChangeEvent,
	Timetable,
	UserPreferences,
	CourseQueryFilter,
	CourseQueryHit
} from '@chronos/core';
import {
	DEFAULT_USER_PREFERENCES,
	CURRENT_PREFERENCES_SCHEMA_VERSION,
	PALETTE_MODE_VIBRANT,
	LEGACY_PALETTE_MODE_DYNAMIC,
	matchesCourseQuery,
	DEFAULT_VISUAL_THEME_ID
} from '@chronos/core';
import { db, type ChronosDB } from '$lib/storage/db';
import { courseToRow, timetableFromRow, timetableToRow, courseFromRow } from '$lib/storage/mappers';
import { clearAppCaches } from '$lib/storage/cache-storage';

const SETTINGS_KEYS = {
	currentTimetableId: 'chronos_preferences:current_timetable_id',
	themeMode: 'chronos_preferences:theme_mode',
	timetableLayoutMode: 'chronos_preferences:timetable_layout_mode',
	paletteMode: 'chronos_preferences:palette_mode',
	capsuleCornerStyle: 'chronos_preferences:capsule_corner_style',
	hapticFeedbackEnabled: 'chronos_preferences:haptic_feedback_enabled',
	visualThemeId: 'chronos_preferences:visual_theme_id',
	locale: 'chronos_preferences:locale'
} as const;

function normalizeThemeMode(raw: string | null): import('@chronos/core').ThemeMode {
	const value = raw?.trim().toLowerCase();
	if (value === 'light' || value === 'dark') return value;
	return 'auto';
}

function normalizeLayoutMode(raw: string | null): import('@chronos/core').TimetableLayoutMode {
	const value = raw?.trim().toLowerCase();
	if (value === 'compact') return 'compact';
	return 'fixed';
}

function normalizePaletteMode(raw: string | null): import('@chronos/core').PaletteMode {
	const value = raw?.trim().toLowerCase();
	if (value === LEGACY_PALETTE_MODE_DYNAMIC) return LEGACY_PALETTE_MODE_DYNAMIC;
	return PALETTE_MODE_VIBRANT;
}

function normalizeCornerStyle(raw: string | null): import('@chronos/core').CapsuleCornerStyle {
	const value = raw?.trim().toLowerCase();
	if (value === 'rounded') return 'rounded';
	if (value === 'sharp') return 'sharp';
	if (value === 'pill') return 'pill';
	return DEFAULT_USER_PREFERENCES.capsuleCornerStyle;
}

function normalizeLocale(raw: string | null): import('@chronos/core').AppLocale | undefined {
	if (raw?.toLowerCase() === 'en') return 'en';
	if (raw?.toLowerCase() === 'zh-cn') return 'zh-cn';
	return undefined;
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
		private localStore: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null,
		private cacheStore: CacheStorage | null = typeof caches !== 'undefined' ? caches : null
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

	async queryCourses(filter: CourseQueryFilter = {}): Promise<CourseQueryHit[]> {
		try {
			const timetableRows = await this.database.timetables.toArray();
			const timetableNameById = new Map(timetableRows.map((row) => [row.id, row.name]));
			const allowedTimetableIds =
				filter.timetableIds !== undefined
					? new Set(filter.timetableIds)
					: new Set(timetableRows.map((row) => row.id));

			let courseRows;
			const ids = filter.timetableIds;
			if (ids?.length === 1) {
				courseRows = await this.database.courses.where('timetableId').equals(ids[0]!).toArray();
			} else if (ids && ids.length > 1) {
				courseRows = await this.database.courses.where('timetableId').anyOf(ids).toArray();
			} else {
				courseRows = await this.database.courses.toArray();
			}

			const hits: CourseQueryHit[] = [];
			for (const row of courseRows) {
				if (!allowedTimetableIds.has(row.timetableId)) continue;
				const course = courseFromRow(row);
				if (!matchesCourseQuery(course, filter)) continue;
				hits.push({
					timetableId: row.timetableId,
					timetableName: timetableNameById.get(row.timetableId) ?? '',
					course
				});
			}
			return hits;
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
		const visualThemeId =
			this.localStore.getItem(SETTINGS_KEYS.visualThemeId)?.trim() || DEFAULT_VISUAL_THEME_ID;
		const locale = normalizeLocale(this.localStore.getItem(SETTINGS_KEYS.locale));

		return {
			schemaVersion: CURRENT_PREFERENCES_SCHEMA_VERSION,
			themeMode,
			paletteMode,
			timetableLayoutMode,
			capsuleCornerStyle,
			hapticFeedbackEnabled,
			visualThemeId,
			...(locale ? { locale } : {})
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
		if (patch.visualThemeId !== undefined) {
			this.localStore.setItem(SETTINGS_KEYS.visualThemeId, patch.visualThemeId);
		}
		if (patch.locale !== undefined) {
			this.localStore.setItem(SETTINGS_KEYS.locale, patch.locale);
		}

		this.notifyChange({ type: 'preferences', key: 'preferences' });
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

	async clearPluginData(pluginId: string): Promise<void> {
		try {
			await this.database.pluginData.where('pluginId').equals(pluginId).delete();
			this.notifyChange({ type: 'pluginData', key: pluginId });
		} catch (err) {
			console.warn(`[DexieStorageProvider] Failed to clear plugin data for ${pluginId}:`, err);
		}
	}

	async clearAllData(): Promise<void> {
		try {
			await this.database.transaction(
				'rw',
				this.database.timetables,
				this.database.courses,
				this.database.pluginData,
				async () => {
					await this.database.timetables.clear();
					await this.database.courses.clear();
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
			await clearAppCaches(this.cacheStore);
			this.notifyChange({ type: 'preferences', key: 'clearAllData' });
			this.notifyChange({ type: 'timetable', key: 'clearAllData' });
		} catch (err) {
			console.warn('[DexieStorageProvider] Failed to clear all data:', err);
		}
	}

	async estimateStorageBytes(): Promise<number> {
		try {
			const [timetables, courses, pluginData] = await Promise.all([
				this.database.timetables.toArray(),
				this.database.courses.toArray(),
				this.database.pluginData.toArray()
			]);

			const encoder = new TextEncoder();
			let total = 0;
			for (const row of timetables) {
				total += encoder.encode(JSON.stringify(row)).length;
			}
			for (const row of courses) {
				total += encoder.encode(JSON.stringify(row)).length;
			}
			for (const row of pluginData) {
				total += encoder.encode(JSON.stringify(row)).length;
			}
			return total;
		} catch {
			return 0;
		}
	}

	dispose(): void {
		if (typeof window !== 'undefined' && this.storageListener) {
			window.removeEventListener('storage', this.storageListener);
		}
		this.listeners.clear();
	}
}
