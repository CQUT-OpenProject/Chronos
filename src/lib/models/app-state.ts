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

export enum TimetableLayoutMode {
	SCROLL = 'SCROLL',
	FIT = 'FIT'
}

const LAYOUT_STORAGE: Record<TimetableLayoutMode, string> = {
	[TimetableLayoutMode.SCROLL]: 'scroll',
	[TimetableLayoutMode.FIT]: 'fit'
};

export function timetableLayoutModeToStorage(mode: TimetableLayoutMode): string {
	return LAYOUT_STORAGE[mode];
}

export function timetableLayoutModeFromStorage(
	value: string | null | undefined
): TimetableLayoutMode {
	const normalized = value?.trim().toLowerCase();
	if (normalized === 'fit') return TimetableLayoutMode.FIT;
	return TimetableLayoutMode.SCROLL;
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
	timetableLayoutMode: TimetableLayoutMode;
}

export function emptyAppState(): AppState {
	return {
		timetables: [],
		currentTimetableId: null,
		wallpaperUri: null,
		currentTimetable: null,
		themeMode: ThemeMode.SYSTEM,
		timetableLayoutMode: TimetableLayoutMode.SCROLL
	};
}
