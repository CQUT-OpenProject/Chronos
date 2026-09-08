import { COURSE_PALETTE_ENTRIES, type CoursePaletteEntry } from '@chronos/core';
import type { ReactiveChronosController } from '../reactivity/engine-controller.svelte';

export const TIMETABLE_PRESENTATION_CONTEXT = 'chronos.timetablePresentation';

export type TimetablePresentationSnapshot = {
	displayedWeek?: number;
	coursePalette?: readonly CoursePaletteEntry[];
};

export type TimetablePresentationAccessor = () => TimetablePresentationSnapshot;

export function resolveDisplayedWeek(
	controller: ReactiveChronosController | undefined,
	presentation: TimetablePresentationSnapshot | undefined,
	academicWeek: number | null | undefined
): number {
	return presentation?.displayedWeek ?? controller?.activeWeek ?? academicWeek ?? 1;
}

export function resolveCoursePalette(
	presentation: TimetablePresentationSnapshot | undefined
): readonly CoursePaletteEntry[] {
	const palette = presentation?.coursePalette;
	if (palette && palette.length > 0) return palette;
	return COURSE_PALETTE_ENTRIES;
}
