import type {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode
} from '$lib/models/app-state';

/** Writes user preferences (localStorage for theme/timetable; wallpaper in IndexedDB). */
export interface PreferencesRepository {
	setCurrentTimetableId(id: string | null): Promise<void>;
	setWallpaper(wallpaper: Blob | null): Promise<void>;
	setThemeMode(mode: ThemeMode): Promise<void>;
	setTimetableLayoutMode(mode: TimetableLayoutMode): Promise<void>;
	setPaletteMode(mode: PaletteMode): Promise<void>;
	setCapsuleCornerStyle(style: CapsuleCornerStyle): Promise<void>;
	setHapticFeedbackEnabled(enabled: boolean): Promise<void>;
}
