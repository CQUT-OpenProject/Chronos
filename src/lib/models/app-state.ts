import type { Timetable } from './timetable';

export enum ThemeMode {
	LIGHT = 'LIGHT',
	DARK = 'DARK',
	SYSTEM = 'SYSTEM'
}

const THEME_STORAGE: Record<ThemeMode, string> = {
	[ThemeMode.LIGHT]: 'light',
	[ThemeMode.DARK]: 'dark',
	[ThemeMode.SYSTEM]: 'system'
};

export function themeModeToStorage(mode: ThemeMode): string {
	return THEME_STORAGE[mode];
}

export function themeModeFromStorage(value: string | null | undefined): ThemeMode {
	const normalized = value?.trim().toLowerCase();
	if (normalized === 'light') return ThemeMode.LIGHT;
	if (normalized === 'dark') return ThemeMode.DARK;
	return ThemeMode.SYSTEM;
}

export interface TimetableSummary {
	id: string;
	name: string;
	courseCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface AppState {
	timetables: TimetableSummary[];
	currentTimetableId: string | null;
	wallpaperUri: string | null;
	currentTimetable: Timetable | null;
	themeMode: ThemeMode;
	useDynamicColor: boolean;
}

export function emptyAppState(): AppState {
	return {
		timetables: [],
		currentTimetableId: null,
		wallpaperUri: null,
		currentTimetable: null,
		themeMode: ThemeMode.SYSTEM,
		useDynamicColor: false
	};
}
