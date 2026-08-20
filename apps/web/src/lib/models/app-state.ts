import type {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	Timetable,
	TimetableLayoutMode
} from '@chronos/core';

export type { CapsuleCornerStyle, PaletteMode, ThemeMode, TimetableLayoutMode };

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
		themeMode: 'auto',
		timetableLayoutMode: 'fixed',
		paletteMode: 'vibrant',
		capsuleCornerStyle: 'rounded',
		hapticFeedbackEnabled: true
	};
}
