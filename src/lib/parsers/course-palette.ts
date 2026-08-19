import { PaletteMode } from '$lib/models/app-state';
import {
	COURSE_PALETTE_ENTRIES,
	EASTER_EGG_PALETTE_ENTRIES,
	type CoursePaletteEntry
} from '@chronos/core';

export {
	type CoursePaletteEntry,
	COURSE_PALETTE_ENTRIES,
	EASTER_EGG_PALETTE_ENTRIES,
	kotlinStringHashCode,
	normalizedCourseName,
	coursePalette,
	defaultPaletteSlot,
	persistSwatchSelection,
	resolveCoursePaint,
	assignCourseDisplayColors,
	displaySwatchBackground
} from '@chronos/core';

export function resolveCoursePalette(
	paletteMode: PaletteMode,
	wallpaperPalette: readonly CoursePaletteEntry[] | null | undefined
): readonly CoursePaletteEntry[] {
	if (paletteMode === PaletteMode.RANDOM) return EASTER_EGG_PALETTE_ENTRIES;
	if (paletteMode === PaletteMode.WALLPAPER && wallpaperPalette && wallpaperPalette.length > 0) {
		return wallpaperPalette;
	}
	return COURSE_PALETTE_ENTRIES;
}
