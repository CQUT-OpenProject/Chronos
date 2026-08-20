import type {
	AppState,
	UserPreferences,
	ThemeMode,
	TimetableLayoutMode,
	PaletteMode,
	CapsuleCornerStyle
} from '$lib/models/app-state';
import type { Course } from '@chronos/core';
import type { Timetable } from '$lib/models/timetable';
import { assembleAppState, resolveCurrentTimetableId } from './app-state-assembler';
import { createSettingsRepo, type SettingsRepo } from './settings-repo';
import * as timetableLocal from './timetable-local';
import * as wallpaperLocal from './wallpaper-local';

export interface TimetableRepository {
	subscribeAppState(listener: (state: AppState) => void): () => void;
	getAppStateSnapshot(): Promise<AppState>;
	getTimetable(id: string): Promise<Timetable | null>;
	saveTimetable(timetable: Timetable): Promise<void>;
	saveCourse(timetableId: string, course: Course): Promise<void>;
	deleteCourse(courseId: string): Promise<void>;
	deleteTimetable(id: string): Promise<void>;
}

export interface PreferencesRepository {
	update(patch: Partial<UserPreferences>): Promise<void>;
	setCurrentTimetableId(id: string | null): Promise<void>;
	setWallpaper(wallpaper: Blob | null): Promise<void>;
	setThemeMode(mode: ThemeMode): Promise<void>;
	setTimetableLayoutMode(mode: TimetableLayoutMode): Promise<void>;
	setPaletteMode(mode: PaletteMode): Promise<void>;
	setCapsuleCornerStyle(style: CapsuleCornerStyle): Promise<void>;
	setHapticFeedbackEnabled(enabled: boolean): Promise<void>;
}

let wallpaperDisplayUrl: string | null = null;
let refreshAppState: (() => Promise<void>) | null = null;

export function invalidateWallpaperDisplayUrl() {
	if (wallpaperDisplayUrl) {
		URL.revokeObjectURL(wallpaperDisplayUrl);
		wallpaperDisplayUrl = null;
	}
}

export async function refreshRegisteredAppState(): Promise<void> {
	await refreshAppState?.();
}

async function resolveWallpaperDisplayUrl(): Promise<string | null> {
	const blob = await wallpaperLocal.getWallpaperBlob();
	if (!blob) {
		invalidateWallpaperDisplayUrl();
		return null;
	}
	if (!wallpaperDisplayUrl) {
		wallpaperDisplayUrl = URL.createObjectURL(blob);
	}
	return wallpaperDisplayUrl;
}

export function createOfflineTimetableRepository(
	settings: SettingsRepo = createSettingsRepo()
): TimetableRepository {
	const listeners = new Set<(state: AppState) => void>();
	let cachedState: AppState | null = null;

	async function rebuildState(): Promise<AppState> {
		const timetables = await timetableLocal.getTimetableSummaries();
		const preferences = settings.getSnapshot();
		const currentTimetableId = resolveCurrentTimetableId(timetables, preferences);
		const currentTimetable = currentTimetableId
			? await timetableLocal.getTimetable(currentTimetableId)
			: null;
		const wallpaperUri = await resolveWallpaperDisplayUrl();
		return assembleAppState(
			timetables,
			preferences,
			currentTimetableId,
			currentTimetable,
			wallpaperUri
		);
	}

	async function notify() {
		cachedState = await rebuildState();
		for (const listener of listeners) {
			listener(cachedState);
		}
	}

	refreshAppState = notify;

	settings.subscribe(() => {
		void notify();
	});

	return {
		subscribeAppState(listener) {
			listeners.add(listener);
			if (cachedState) {
				listener(cachedState);
			} else {
				void rebuildState().then((state) => {
					cachedState = state;
					listener(state);
				});
			}
			return () => listeners.delete(listener);
		},

		async getAppStateSnapshot() {
			if (!cachedState) {
				cachedState = await rebuildState();
			}
			return cachedState;
		},

		getTimetable: timetableLocal.getTimetable,

		async saveTimetable(timetable: Timetable) {
			await timetableLocal.saveTimetable(timetable);
			await notify();
		},

		async saveCourse(timetableId: string, course: Course) {
			await timetableLocal.saveCourse(timetableId, course);
			await notify();
		},

		async deleteCourse(courseId: string) {
			await timetableLocal.deleteCourse(courseId);
			await notify();
		},

		async deleteTimetable(id: string) {
			await timetableLocal.deleteTimetable(id);
			await notify();
		}
	};
}

/** Preference writes share the same SettingsRepo so AppState listeners still refresh. */
export function createPreferencesRepository(
	settings: SettingsRepo = createSettingsRepo()
): PreferencesRepository {
	return {
		async update(patch) {
			settings.update(patch);
		},
		async setCurrentTimetableId(id: string | null) {
			settings.update({ currentTimetableId: id });
		},
		async setWallpaper(wallpaper: Blob | null) {
			invalidateWallpaperDisplayUrl();
			if (wallpaper) {
				await wallpaperLocal.saveWallpaper(wallpaper);
			} else {
				await wallpaperLocal.deleteWallpaper();
			}
			await refreshAppState?.();
		},
		async setThemeMode(mode) {
			settings.update({ themeMode: mode });
		},
		async setTimetableLayoutMode(mode) {
			settings.update({ timetableLayoutMode: mode });
		},
		async setPaletteMode(mode) {
			settings.update({ paletteMode: mode });
		},
		async setCapsuleCornerStyle(style) {
			settings.update({ capsuleCornerStyle: style });
		},
		async setHapticFeedbackEnabled(enabled) {
			settings.update({ hapticFeedbackEnabled: enabled });
		}
	};
}
