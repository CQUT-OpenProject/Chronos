import type { AppState } from '$lib/models/app-state';
import type { Course } from '$lib/models/course';
import type { Timetable } from '$lib/models/timetable';
import type { PreferencesRepository } from '$lib/domain/interfaces/preferences-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';
import { assembleAppState, resolveCurrentTimetableId } from './app-state-assembler';
import { createSettingsRepo, type SettingsRepo } from './settings-repo';
import * as timetableLocal from './timetable-local';
import * as wallpaperLocal from './wallpaper-local';

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
		async setCurrentTimetableId(id: string | null) {
			settings.setCurrentTimetableId(id);
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
			settings.setThemeMode(mode);
		},
		async setTimetableLayoutMode(mode) {
			settings.setTimetableLayoutMode(mode);
		},
		async setPaletteMode(mode) {
			settings.setPaletteMode(mode);
		},
		async setCapsuleCornerStyle(style) {
			settings.setCapsuleCornerStyle(style);
		},
		async setHapticFeedbackEnabled(enabled) {
			settings.setHapticFeedbackEnabled(enabled);
		}
	};
}
