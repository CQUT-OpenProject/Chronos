import {
	AcademicCalendarService,
	computeTimetableWeekLayout,
	type Timetable,
	type TimetableCourseDisplayModel,
	type TimetableGridModel,
	type TimetableWeekLayoutResult
} from '@chronos/core';

export interface WeekViewportInput {
	timetable: Timetable | null;
	todayIso: string;
	displayedWeek: number;
	expandedSlotKeys: ReadonlySet<string>;
	viewportRadius?: number;
	academicCalendarService?: AcademicCalendarService;
}

export interface WeekViewportMaps {
	weekLayouts: Map<number, TimetableWeekLayoutResult>;
	weekGridModels: Map<number, TimetableGridModel>;
	weekCourseDisplayModels: Map<number, TimetableCourseDisplayModel[]>;
}

export interface WeekLayoutCache {
	invalidateAll(): void;
}

class WeekLayoutCacheImpl implements WeekLayoutCache {
	private cachedTimetable: Timetable | null = null;
	private cachedToday = '';
	private cachedExpandedKey = '';
	private readonly weekLayouts = new Map<number, TimetableWeekLayoutResult>();

	invalidateAll(): void {
		this.cachedTimetable = null;
		this.cachedToday = '';
		this.cachedExpandedKey = '';
		this.weekLayouts.clear();
	}

	syncScope(timetable: Timetable | null, todayIso: string, expandedKey: string): void {
		const canReuse =
			timetable != null &&
			timetable === this.cachedTimetable &&
			todayIso === this.cachedToday &&
			expandedKey === this.cachedExpandedKey;

		if (canReuse) return;

		this.weekLayouts.clear();
		this.cachedTimetable = timetable;
		this.cachedToday = todayIso;
		this.cachedExpandedKey = expandedKey;
	}

	getWeekLayout(week: number): TimetableWeekLayoutResult | undefined {
		return this.weekLayouts.get(week);
	}

	setWeekLayout(week: number, layout: TimetableWeekLayoutResult): void {
		this.weekLayouts.set(week, layout);
	}
}

export function createWeekLayoutCache(): WeekLayoutCache {
	return new WeekLayoutCacheImpl();
}

function expandedSlotKey(keys: ReadonlySet<string>): string {
	return [...keys].sort().join('|');
}

export function buildWeekViewport(
	input: WeekViewportInput,
	cache: WeekLayoutCache
): WeekViewportMaps {
	const {
		timetable,
		todayIso,
		displayedWeek,
		expandedSlotKeys,
		viewportRadius = 1,
		academicCalendarService = new AcademicCalendarService()
	} = input;

	const cacheImpl = cache as WeekLayoutCacheImpl;
	cacheImpl.syncScope(timetable, todayIso, expandedSlotKey(expandedSlotKeys));

	const weekLayouts = new Map<number, TimetableWeekLayoutResult>();
	const weekGridModels = new Map<number, TimetableGridModel>();
	const weekCourseDisplayModels = new Map<number, TimetableCourseDisplayModel[]>();

	if (!timetable) {
		return { weekLayouts, weekGridModels, weekCourseDisplayModels };
	}

	const { startWeek, endWeek } = timetable.academicConfig;
	const minWeek = Math.max(startWeek, displayedWeek - viewportRadius);
	const maxWeek = Math.min(endWeek, displayedWeek + viewportRadius);

	for (let week = minWeek; week <= maxWeek; week += 1) {
		let layout = cacheImpl.getWeekLayout(week);
		if (!layout) {
			layout = computeTimetableWeekLayout({
				timetable,
				displayedWeek: week,
				todayIso,
				expandedSlotKeys,
				academicCalendarService
			});
			cacheImpl.setWeekLayout(week, layout);
		}
		weekLayouts.set(week, layout);
		weekGridModels.set(week, layout.gridModel);
		weekCourseDisplayModels.set(week, layout.courseDisplayModels);
	}

	return { weekLayouts, weekGridModels, weekCourseDisplayModels };
}
