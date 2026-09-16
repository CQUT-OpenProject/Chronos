import {
	buildCoursePaintLookup,
	COURSE_PALETTE_ENTRIES,
	lookupCoursePaint,
	type ChronosEngine,
	type CoursePaletteEntry,
	type ICoursePresentationService
} from '@chronos/core';

export type CoursePaletteRef = { current: readonly CoursePaletteEntry[] };

type PaintCacheEntry = {
	updatedAt: number;
	lookup: ReadonlyMap<string, CoursePaletteEntry>;
};

export type WebCoursePresentationPort = ICoursePresentationService & {
	invalidatePaintCache(): void;
};

export function createWebCoursePresentationPort(
	paletteRef: CoursePaletteRef,
	getEngine: () => ChronosEngine
): WebCoursePresentationPort {
	const paintCache = new Map<string, PaintCacheEntry>();

	return {
		getCoursePalette() {
			return paletteRef.current;
		},

		async resolveCoursePaintsForTimetable(timetableId: string) {
			const engine = getEngine();
			const palette = paletteRef.current;

			let timetable =
				engine.state.currentTimetable?.id === timetableId ? engine.state.currentTimetable : null;
			if (!timetable) {
				timetable = await engine.storage.getTimetable(timetableId);
			}
			if (!timetable) {
				return new Map<string, CoursePaletteEntry>();
			}

			const cached = paintCache.get(timetableId);
			if (cached && cached.updatedAt === timetable.updatedAt) {
				return cached.lookup;
			}

			const lookup = buildCoursePaintLookup(timetable.courses, palette);
			paintCache.set(timetableId, { updatedAt: timetable.updatedAt, lookup });
			return lookup;
		},

		async resolveCoursePaint(input) {
			const lookup = await this.resolveCoursePaintsForTimetable(input.timetableId);
			return lookupCoursePaint(lookup, input.course, paletteRef.current);
		},

		invalidatePaintCache() {
			paintCache.clear();
		}
	};
}

export function createCoursePaletteRef(
	initial: readonly CoursePaletteEntry[] = COURSE_PALETTE_ENTRIES
): CoursePaletteRef {
	return { current: initial };
}
