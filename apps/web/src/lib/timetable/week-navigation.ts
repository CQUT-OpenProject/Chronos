import type { Timetable } from '$lib/models/timetable';

export function buildWeekList(startWeek: number, endWeek: number): number[] {
	const start = Math.min(startWeek, endWeek);
	const end = Math.max(startWeek, endWeek);
	const weeks: number[] = [];
	for (let week = start; week <= end; week += 1) {
		weeks.push(week);
	}
	return weeks;
}

export function clampDisplayedWeek(week: number, startWeek: number, endWeek: number): number {
	return Math.min(Math.max(week, startWeek), endWeek);
}

export function resolveDisplayedWeek(
	timetable: Timetable | null,
	displayedWeek: number,
	displayedWeekTimetableId: string | null | undefined,
	academicWeek: number
): number {
	if (!timetable) return 1;
	if (displayedWeekTimetableId !== timetable.id) {
		return clampDisplayedWeek(
			academicWeek,
			timetable.academicConfig.startWeek,
			timetable.academicConfig.endWeek
		);
	}
	return clampDisplayedWeek(
		displayedWeek,
		timetable.academicConfig.startWeek,
		timetable.academicConfig.endWeek
	);
}

export function slideIndexFromWeek(startWeek: number, week: number, weekCount: number): number {
	if (weekCount <= 0) return 0;
	return Math.max(0, Math.min(week - startWeek, weekCount - 1));
}

export function weekFromSlideIndex(startWeek: number, slideIndex: number): number {
	return startWeek + slideIndex;
}

/** Neighboring weeks to keep laid out and mounted around the live pager week. */
export const WEEK_PAGER_NEIGHBOR_RADIUS = 3;

export function scrollOffsetFromWeek(week: number, pageWidth: number, startWeek: number): number {
	if (pageWidth <= 0) return 0;
	return (week - startWeek) * pageWidth;
}

export function pagerPreviewWeekFromScroll(
	scrollLeft: number,
	pageWidth: number,
	startWeek: number,
	endWeek: number
): number | null {
	if (pageWidth <= 0) return null;
	const start = Math.min(startWeek, endWeek);
	const end = Math.max(startWeek, endWeek);
	const raw = start + scrollLeft / pageWidth;
	if (!Number.isFinite(raw)) return null;
	return Math.min(end, Math.max(start, raw));
}

export function committedWeekFromScroll(
	scrollLeft: number,
	pageWidth: number,
	startWeek: number,
	endWeek: number
): number | null {
	const preview = pagerPreviewWeekFromScroll(scrollLeft, pageWidth, startWeek, endWeek);
	if (preview == null) return null;
	return Math.round(preview);
}

export function shouldPaintPagerWeek(
	week: number,
	displayedWeek: number,
	paintAdjacent: boolean,
	radius = 1
): boolean {
	if (week === displayedWeek) return true;
	if (!paintAdjacent) return false;
	return Math.abs(week - displayedWeek) <= radius;
}

export function academicBounds(timetable: Timetable | null): {
	startWeek: number;
	endWeek: number;
} {
	return {
		startWeek: timetable?.academicConfig.startWeek ?? 1,
		endWeek: timetable?.academicConfig.endWeek ?? 1
	};
}
