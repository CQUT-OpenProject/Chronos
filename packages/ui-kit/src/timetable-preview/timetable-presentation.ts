import { COURSE_PALETTE_ENTRIES, type CoursePaletteEntry } from '@chronos/core';
import type { Readable } from 'svelte/store';

export const TIMETABLE_PRESENTATION_CONTEXT = 'chronos.timetablePresentation';

export type TimetablePresentationSnapshot = {
	displayedWeek?: number;
	coursePalette?: readonly CoursePaletteEntry[];
};

export type TimetablePresentationSource = Readable<TimetablePresentationSnapshot>;

export function resolveDisplayedWeek(
	presentation: TimetablePresentationSnapshot | undefined,
	academicWeek: number | null | undefined,
	activeWeek: number | null | undefined = null
): number {
	return presentation?.displayedWeek ?? activeWeek ?? academicWeek ?? 1;
}

export function resolveCoursePalette(
	presentation: TimetablePresentationSnapshot | undefined
): readonly CoursePaletteEntry[] {
	const palette = presentation?.coursePalette;
	if (palette && palette.length > 0) return palette;
	return COURSE_PALETTE_ENTRIES;
}
