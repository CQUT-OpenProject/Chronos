import type { ThemeMode } from '$lib/models/app-state';

/** Writes user preferences (localStorage-backed in the offline adapter). */
export interface PreferencesRepository {
	setCurrentTimetableId(id: string | null): Promise<void>;
	setWallpaper(uri: string | null): Promise<void>;
	setThemeMode(mode: ThemeMode): Promise<void>;
}
