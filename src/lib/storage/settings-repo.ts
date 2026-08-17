import {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode,
	capsuleCornerStyleFromStorage,
	capsuleCornerStyleToStorage,
	hapticFeedbackFromStorage,
	hapticFeedbackToStorage,
	paletteModeFromStorage,
	paletteModeToStorage,
	themeModeFromStorage,
	themeModeToStorage,
	timetableLayoutModeFromStorage,
	timetableLayoutModeToStorage
} from '$lib/models/app-state';

export interface UserPreferenceState {
	currentTimetableId: string | null;
	themeMode: ThemeMode;
	timetableLayoutMode: TimetableLayoutMode;
	paletteMode: PaletteMode;
	capsuleCornerStyle: CapsuleCornerStyle;
	hapticFeedbackEnabled: boolean;
}

const KEYS = {
	currentTimetableId: 'current_timetable_id',
	themeMode: 'theme_mode',
	timetableLayoutMode: 'timetable_layout_mode',
	paletteMode: 'palette_mode',
	capsuleCornerStyle: 'capsule_corner_style',
	hapticFeedbackEnabled: 'haptic_feedback_enabled',
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
				paletteMode: PaletteMode.DEFAULT,
				capsuleCornerStyle: CapsuleCornerStyle.ROUNDED,
				hapticFeedbackEnabled: true
			};
		}

		return {
			currentTimetableId: target.getItem(storageKey(KEYS.currentTimetableId)),
			themeMode: themeModeFromStorage(target.getItem(storageKey(KEYS.themeMode))),
			timetableLayoutMode: timetableLayoutModeFromStorage(
				target.getItem(storageKey(KEYS.timetableLayoutMode))
			),
			paletteMode: paletteModeFromStorage(
				target.getItem(storageKey(KEYS.paletteMode)),
				target.getItem(storageKey(KEYS.randomTheme))
			),
			capsuleCornerStyle: capsuleCornerStyleFromStorage(
				target.getItem(storageKey(KEYS.capsuleCornerStyle))
			),
			hapticFeedbackEnabled: hapticFeedbackFromStorage(
				target.getItem(storageKey(KEYS.hapticFeedbackEnabled))
			)
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
		setPaletteMode(mode: PaletteMode) {
			if (!storage) return;
			storage.setItem(storageKey(KEYS.paletteMode), paletteModeToStorage(mode));
			storage.removeItem(storageKey(KEYS.randomTheme));
			notify();
		},
		setCapsuleCornerStyle(style: CapsuleCornerStyle) {
			setString(KEYS.capsuleCornerStyle, capsuleCornerStyleToStorage(style));
		},
		setHapticFeedbackEnabled(enabled: boolean) {
			setString(KEYS.hapticFeedbackEnabled, hapticFeedbackToStorage(enabled));
		}
	};
}

export type SettingsRepo = ReturnType<typeof createSettingsRepo>;
