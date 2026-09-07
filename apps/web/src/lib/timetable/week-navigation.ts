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

export function weekSlideWindow(
	displayedWeek: number,
	startWeek: number,
	endWeek: number
): { weeks: number[]; centerIndex: number } {
	const start = Math.min(startWeek, endWeek);
	const end = Math.max(startWeek, endWeek);
	const current = clampDisplayedWeek(displayedWeek, start, end);
	const weeks: number[] = [];
	if (current > start) weeks.push(current - 1);
	weeks.push(current);
	if (current < end) weeks.push(current + 1);
	return { weeks, centerIndex: weeks.indexOf(current) };
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
