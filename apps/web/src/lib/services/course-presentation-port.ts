import {
	assignCourseDisplayColors,
	COURSE_PALETTE_ENTRIES,
	lookupCoursePaint,
	type ChronosEngine,
	type CoursePaletteEntry,
	type ICoursePresentationService
} from '@chronos/core';

export type CoursePaletteRef = { current: readonly CoursePaletteEntry[] };

type PaintCacheEntry = {
	updatedAt: number;
	palette: readonly CoursePaletteEntry[];
	lookup: ReadonlyMap<string, CoursePaletteEntry>;
};

export function createWebCoursePresentationPort(
	paletteRef: CoursePaletteRef,
	getEngine: () => ChronosEngine
): ICoursePresentationService {
	const paintCache = new Map<string, PaintCacheEntry>();

	return {
		getCoursePalette() {
			return paletteRef.current;
		},

		async resolveCoursePaintsForTimetable(timetableId: string) {
			const engine = getEngine();

			let timetable =
				engine.state.currentTimetable?.id === timetableId ? engine.state.currentTimetable : null;
			if (!timetable) {
				timetable = await engine.storage.getTimetable(timetableId);
			}
			if (!timetable) {
				return new Map<string, CoursePaletteEntry>();
			}

			const palette = paletteRef.current;
			const cached = paintCache.get(timetableId);
			if (cached && cached.updatedAt === timetable.updatedAt && cached.palette === palette) {
				return cached.lookup;
			}

			const lookup = assignCourseDisplayColors(timetable.courses, palette);
			paintCache.set(timetableId, { updatedAt: timetable.updatedAt, palette, lookup });
			return lookup;
		},

		async resolveCoursePaint(input) {
			const lookup = await this.resolveCoursePaintsForTimetable(input.timetableId);
			return lookupCoursePaint(lookup, input.course, paletteRef.current);
		}
	};
}

export function createCoursePaletteRef(
	initial: readonly CoursePaletteEntry[] = COURSE_PALETTE_ENTRIES
): CoursePaletteRef {
	return { current: initial };
}
