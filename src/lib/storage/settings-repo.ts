import {
	ThemeMode,
	TimetableLayoutMode,
	themeModeFromStorage,
	themeModeToStorage,
	timetableLayoutModeFromStorage,
	timetableLayoutModeToStorage
} from '$lib/models/app-state';

export interface UserPreferenceState {
	currentTimetableId: string | null;
	themeMode: ThemeMode;
	timetableLayoutMode: TimetableLayoutMode;
	randomTheme: boolean;
}

const KEYS = {
	currentTimetableId: 'current_timetable_id',
	themeMode: 'theme_mode',
	timetableLayoutMode: 'timetable_layout_mode',
	randomTheme: 'random_theme'
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
				themeMode: ThemeMode.SYSTEM,
				timetableLayoutMode: TimetableLayoutMode.SCROLL,
				randomTheme: false
			};
		}

		return {
			currentTimetableId: target.getItem(storageKey(KEYS.currentTimetableId)),
			themeMode: themeModeFromStorage(target.getItem(storageKey(KEYS.themeMode))),
			timetableLayoutMode: timetableLayoutModeFromStorage(
				target.getItem(storageKey(KEYS.timetableLayoutMode))
			),
			randomTheme: target.getItem(storageKey(KEYS.randomTheme)) === '1'
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
		reloadFromStorage() {
			notify();
		},
		setCurrentTimetableId(id: string | null) {
			setString(KEYS.currentTimetableId, id);
		},
		setThemeMode(mode: ThemeMode) {
			setString(KEYS.themeMode, themeModeToStorage(mode));
		},
		setTimetableLayoutMode(mode: TimetableLayoutMode) {
			setString(KEYS.timetableLayoutMode, timetableLayoutModeToStorage(mode));
		},
		setRandomTheme(enabled: boolean) {
			setString(KEYS.randomTheme, enabled ? '1' : null);
		}
	};
}

export type SettingsRepo = ReturnType<typeof createSettingsRepo>;
