import { ThemeMode, themeModeFromStorage, themeModeToStorage } from '$lib/models/app-state';

export interface UserPreferenceState {
	currentTimetableId: string | null;
	wallpaperUri: string | null;
	themeMode: ThemeMode;
}

const KEYS = {
	currentTimetableId: 'current_timetable_id',
	wallpaperUri: 'wallpaper_uri',
	themeMode: 'theme_mode'
} as const;

const STORAGE_PREFIX = 'chronos_preferences:';

function storageKey(key: string): string {
	return `${STORAGE_PREFIX}${key}`;
}

function readStorage(): Storage | null {
	if (typeof localStorage === 'undefined') return null;
	return localStorage;
}

export function createSettingsRepo(storage: Storage | null = readStorage()) {
	const listeners = new Set<(state: UserPreferenceState) => void>();
	let cached = loadSnapshot(storage);

	function loadSnapshot(target: Storage | null): UserPreferenceState {
		if (!target) {
			return {
				currentTimetableId: null,
				wallpaperUri: null,
				themeMode: ThemeMode.SYSTEM
			};
		}

		return {
			currentTimetableId: target.getItem(storageKey(KEYS.currentTimetableId)),
			wallpaperUri: target.getItem(storageKey(KEYS.wallpaperUri)),
			themeMode: themeModeFromStorage(target.getItem(storageKey(KEYS.themeMode)))
		};
	}

	function notify() {
		cached = loadSnapshot(storage);
		for (const listener of listeners) {
			listener(cached);
		}
	}

	function subscribe(listener: (state: UserPreferenceState) => void): () => void {
		listeners.add(listener);
		listener(cached);
		return () => listeners.delete(listener);
	}

	function getSnapshot(): UserPreferenceState {
		return cached;
	}

	function setString(key: string, value: string | null) {
		if (!storage) return;
		const fullKey = storageKey(key);
		if (value == null) {
			storage.removeItem(fullKey);
		} else {
			storage.setItem(fullKey, value);
		}
		notify();
	}

	return {
		subscribe,
		getSnapshot,
		setCurrentTimetableId(id: string | null) {
			setString(KEYS.currentTimetableId, id);
		},
		setWallpaperUri(uri: string | null) {
			setString(KEYS.wallpaperUri, uri);
		},
		setThemeMode(mode: ThemeMode) {
			setString(KEYS.themeMode, themeModeToStorage(mode));
		}
	};
}

export type SettingsRepo = ReturnType<typeof createSettingsRepo>;
