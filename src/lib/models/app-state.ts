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

export enum PaletteMode {
	DEFAULT = 'DEFAULT',
	WALLPAPER = 'WALLPAPER',
	RANDOM = 'RANDOM'
}

const PALETTE_STORAGE: Record<PaletteMode, string> = {
	[PaletteMode.DEFAULT]: 'default',
	[PaletteMode.WALLPAPER]: 'wallpaper',
	[PaletteMode.RANDOM]: 'random'
};

export function paletteModeToStorage(mode: PaletteMode): string {
	return PALETTE_STORAGE[mode];
}

export function paletteModeFromStorage(
	value: string | null | undefined,
	legacyRandomTheme?: string | null
): PaletteMode {
	const normalized = value?.trim().toLowerCase();
	if (normalized === 'wallpaper') return PaletteMode.WALLPAPER;
	if (normalized === 'random') return PaletteMode.RANDOM;
	if (normalized === 'default') return PaletteMode.DEFAULT;
	if (legacyRandomTheme === '1') return PaletteMode.RANDOM;
	return PaletteMode.DEFAULT;
}

export enum CapsuleCornerStyle {
	ROUNDED = 'ROUNDED',
	MERGE = 'MERGE',
	SQUARE = 'SQUARE'
}

const CAPSULE_CORNER_STORAGE: Record<CapsuleCornerStyle, string> = {
	[CapsuleCornerStyle.ROUNDED]: 'rounded',
	[CapsuleCornerStyle.MERGE]: 'merge',
	[CapsuleCornerStyle.SQUARE]: 'square'
};

export function capsuleCornerStyleToStorage(style: CapsuleCornerStyle): string {
	return CAPSULE_CORNER_STORAGE[style];
}

export function capsuleCornerStyleFromStorage(
	value: string | null | undefined
): CapsuleCornerStyle {
	const normalized = value?.trim().toLowerCase();
	if (normalized === 'merge') return CapsuleCornerStyle.MERGE;
	if (normalized === 'square') return CapsuleCornerStyle.SQUARE;
	return CapsuleCornerStyle.ROUNDED;
}

export function hapticFeedbackToStorage(enabled: boolean): string {
	return enabled ? '1' : '0';
}

export function hapticFeedbackFromStorage(value: string | null | undefined): boolean {
	if (value === '0' || value === 'false') return false;
	return true;
}

export interface UserPreferences {
	currentTimetableId: string | null;
	themeMode: ThemeMode;
	timetableLayoutMode: TimetableLayoutMode;
	paletteMode: PaletteMode;
	capsuleCornerStyle: CapsuleCornerStyle;
	hapticFeedbackEnabled: boolean;
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
	paletteMode: PaletteMode;
	capsuleCornerStyle: CapsuleCornerStyle;
	hapticFeedbackEnabled: boolean;
}

export function emptyAppState(): AppState {
	return {
		timetables: [],
		currentTimetableId: null,
		wallpaperUri: null,
		currentTimetable: null,
		themeMode: ThemeMode.SYSTEM,
		timetableLayoutMode: TimetableLayoutMode.SCROLL,
		paletteMode: PaletteMode.DEFAULT,
		capsuleCornerStyle: CapsuleCornerStyle.ROUNDED,
		hapticFeedbackEnabled: true
	};
}
