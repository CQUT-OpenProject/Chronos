import type { AppState } from '$lib/models/app-state';
import type { Course } from '$lib/models/course';
import type { Timetable } from '$lib/models/timetable';
import type { PreferencesRepository } from '$lib/domain/interfaces/preferences-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';
import { assembleAppState, resolveCurrentTimetableId } from './app-state-assembler';
import { createSettingsRepo, type SettingsRepo } from './settings-repo';
import * as timetableLocal from './timetable-local';
import { db } from './db';

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
		return assembleAppState(timetables, preferences, currentTimetableId, currentTimetable);
	}

	async function notify() {
		cachedState = await rebuildState();
		for (const listener of listeners) {
			listener(cachedState);
		}
	}

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
		async setWallpaper(uri: string | null) {
			settings.setWallpaperUri(uri);
		},
		async setThemeMode(mode) {
			settings.setThemeMode(mode);
		}
	};
}

export { db };
