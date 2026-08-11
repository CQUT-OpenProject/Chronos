import type { ThemeMode } from '$lib/models/app-state';

/** Writes user preferences (localStorage for theme/timetable; wallpaper in IndexedDB). */
export interface PreferencesRepository {
	setCurrentTimetableId(id: string | null): Promise<void>;
	setWallpaper(wallpaper: Blob | null): Promise<void>;
	setThemeMode(mode: ThemeMode): Promise<void>;
}
