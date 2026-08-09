import { type AppState, type TimetableSummary } from '$lib/models/app-state';
import type { Timetable } from '$lib/models/timetable';
import { copyForStateBoundary } from './mappers';
import type { UserPreferenceState } from './settings-repo';

export function resolveCurrentTimetableId(
	timetables: TimetableSummary[],
	preferences: UserPreferenceState
): string | null {
	const preferred = preferences.currentTimetableId;
	if (preferred && timetables.some((timetable) => timetable.id === preferred)) {
		return preferred;
	}
	return timetables[0]?.id ?? null;
}

export function assembleAppState(
	timetables: TimetableSummary[],
	preferences: UserPreferenceState,
	currentTimetableId: string | null,
	currentTimetable: Timetable | null,
	wallpaperUri: string | null
): AppState {
	return {
		timetables: [...timetables],
		currentTimetableId,
		wallpaperUri,
		currentTimetable: currentTimetable ? copyForStateBoundary(currentTimetable) : null,
		themeMode: preferences.themeMode
	};
}
