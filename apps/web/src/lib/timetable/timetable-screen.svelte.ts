import { untrack } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';
import { trackEvent } from '$lib/client/analytics';
import {
	AcademicCalendarService,
	createDayClock,
	computeTimetableWeekLayout,
	currentTimeMinutes,
	findCurrentPeriodIndex,
	formatWeekDateRange,
	parsePeriodRanges,
	todayIsoDate,
	type DayClockHandle,
	type Timetable,
	type TimetableCourseDisplayModel,
	type TimetableGridModel,
	type TimetableWeekLayoutResult
} from '@chronos/core';
import type { AppShellController } from '$lib/app/app-shell.svelte';
import {
	academicBounds,
	buildWeekList,
	clampDisplayedWeek,
	resolveDisplayedWeek,
	slideIndexFromWeek,
	weekFromSlideIndex
} from './week-navigation';

const calendarService = new AcademicCalendarService();

let displayedWeekMemory = 1;
let displayedWeekTimetableIdMemory: string | null = null;

let sharedTimetableScreen: TimetableScreenController | null = null;

interface TimetableScreenState {
	currentTimetable: Timetable | null;
	hasLoadedAppState: boolean;
	today: string;
	academicWeek: number;
	displayedWeek: number;
	displayedWeekTimetableId: string | null;
	startWeek: number;
	endWeek: number;
	weeks: number[];
	slideIndex: number;
	weekRangeText: string;
	isCurrentWeek: boolean;
	currentPeriodIndex: number | null;
	expandedSlots: ReadonlySet<string>;
	weekGridModels: Map<number, TimetableGridModel>;
	weekCourseDisplayModels: Map<number, TimetableCourseDisplayModel[]>;
	weekLayouts: Map<number, TimetableWeekLayoutResult>;
}

export function getTimetableScreen(): TimetableScreenController {
	sharedTimetableScreen ??= createTimetableScreen();
	return sharedTimetableScreen;
}

function createTimetableScreen() {
	let shellRef = $state<AppShellController | null>(null);
	let today = $state(todayIsoDate());
	let now = $state(new Date());
	let revision = $state(0);
	let expandedSlots = $state(new SvelteSet<string>());

	let weekLayouts = $state.raw<Map<number, TimetableWeekLayoutResult>>(new SvelteMap());
	let weekGridModels = $state.raw<Map<number, TimetableGridModel>>(new SvelteMap());
	let weekCourseDisplayModels = $state.raw<Map<number, TimetableCourseDisplayModel[]>>(
		new SvelteMap()
	);

	let cachedTimetable: Timetable | null = null;
	let cachedToday = '';
	const cachedWeekLayouts = new SvelteMap<number, TimetableWeekLayoutResult>();

	let dayClock: DayClockHandle | null = null;

	function currentTimetable(): Timetable | null {
		return shellRef?.controller.currentTimetable ?? null;
	}

	$effect(() => {
		const shell = shellRef;
		if (!shell) return;
		const currentTt = shell.controller.currentTimetable;
		const initialized = shell.state.initialized;
		void currentTt;
		void initialized;
		untrack(() => {
			recompute();
			notify();
		});
	});

	$effect(() => {
		const shell = shellRef;
		if (!shell || !dayClock) return;
		const timetable = shell.controller.currentTimetable;
		void timetable?.id;
		void timetable?.academicConfig.periodTimes;
		dayClock.reschedule();
	});

	function notify() {
		revision += 1;
	}

	function recompute() {
		const timetable = currentTimetable();
		const academicWeek = calendarService.calculateAcademicWeek(today, timetable?.academicConfig);
		const resolvedWeek = resolveDisplayedWeek(
			timetable,
			displayedWeekMemory,
			displayedWeekTimetableIdMemory,
			academicWeek
		);

		if (resolvedWeek !== displayedWeekMemory) {
			displayedWeekMemory = resolvedWeek;
		}

		const canReuseCache =
			timetable != null && timetable === cachedTimetable && today === cachedToday;

		if (!canReuseCache) {
			cachedWeekLayouts.clear();
		}

		const nextWeekLayouts = new SvelteMap<number, TimetableWeekLayoutResult>();
		const nextWeekGridModels = new SvelteMap<number, TimetableGridModel>();
		const nextWeekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

		if (timetable) {
			const { startWeek, endWeek } = timetable.academicConfig;
			const radius = 1;
			const minWeek = Math.max(startWeek, displayedWeekMemory - radius);
			const maxWeek = Math.min(endWeek, displayedWeekMemory + radius);

			for (let week = minWeek; week <= maxWeek; week += 1) {
				let layout = cachedWeekLayouts.get(week);
				if (!layout) {
					layout = computeTimetableWeekLayout({
						timetable,
						displayedWeek: week,
						todayIso: today,
						expandedSlotKeys: expandedSlots,
						academicCalendarService: calendarService
					});
					cachedWeekLayouts.set(week, layout);
				}
				nextWeekLayouts.set(week, layout);
				nextWeekGridModels.set(week, layout.gridModel);
				nextWeekCourseDisplayModels.set(week, layout.courseDisplayModels);
			}
		}

		cachedTimetable = timetable;
		cachedToday = today;
		weekLayouts = nextWeekLayouts;
		weekGridModels = nextWeekGridModels;
		weekCourseDisplayModels = nextWeekCourseDisplayModels;
	}

	function init(shell: AppShellController) {
		if (shellRef) return;
		shellRef = shell;
		dayClock = createDayClock({
			getPeriodTimes: () => currentTimetable()?.academicConfig.periodTimes ?? [],
			onMidnight: () => {
				today = todayIsoDate();
				now = new Date();
				recompute();
				notify();
			},
			onPeriodBoundary: () => {
				now = new Date();
				notify();
			}
		});
	}

	function refresh() {
		recompute();
		notify();
	}

	function destroy() {
		dayClock?.dispose();
		dayClock = null;
		shellRef = null;
	}

	function setDisplayedWeek(week: number) {
		const timetable = currentTimetable();
		if (!timetable) return;
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(week, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
		recompute();
		notify();
	}

	function jumpToCurrentWeek() {
		const timetable = currentTimetable();
		if (!timetable) return;
		trackEvent('timetable_week_jump_current');
		const academicWeek = calendarService.calculateAcademicWeek(today, timetable.academicConfig);
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(academicWeek, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
		recompute();
		notify();
	}

	function settlePagerAtSlide(slideIndex: number) {
		const timetable = currentTimetable();
		if (!timetable) return;
		const { startWeek } = academicBounds(timetable);
		setDisplayedWeek(weekFromSlideIndex(startWeek, slideIndex));
	}

	function expandSlot(slotKey: string) {
		if (!expandedSlots.has(slotKey)) {
			expandedSlots.add(slotKey);
			cachedWeekLayouts.clear();
			recompute();
			notify();
		}
	}

	function collapseSlot(slotKey: string) {
		if (expandedSlots.has(slotKey)) {
			expandedSlots.delete(slotKey);
			cachedWeekLayouts.clear();
			recompute();
			notify();
		}
	}

	function isSlotExpanded(slotKey: string): boolean {
		return expandedSlots.has(slotKey);
	}

	const state = $derived.by(() => {
		void revision;
		void now;
		const timetable = currentTimetable();
		const hasLoadedAppState = shellRef?.state.initialized ?? false;
		const academicWeek = calendarService.calculateAcademicWeek(today, timetable?.academicConfig);
		const displayedWeek = resolveDisplayedWeek(
			timetable,
			displayedWeekMemory,
			displayedWeekTimetableIdMemory,
			academicWeek
		);
		const isCurrentWeek = displayedWeek === academicWeek;
		const { startWeek, endWeek } = academicBounds(timetable);
		const weeks = buildWeekList(startWeek, endWeek);
		const slideIndex = slideIndexFromWeek(startWeek, displayedWeek, weeks.length);

		const weekRangeText = formatWeekDateRange(
			timetable?.academicConfig,
			displayedWeek,
			today,
			timetable?.viewPrefs,
			calendarService
		);

		const periods = timetable?.academicConfig.periodTimes ?? [];
		const parsedPeriods = parsePeriodRanges(periods);
		const currentPeriodIndex = findCurrentPeriodIndex(parsedPeriods, currentTimeMinutes(now));

		return {
			currentTimetable: timetable,
			hasLoadedAppState,
			today,
			academicWeek,
			displayedWeek,
			displayedWeekTimetableId: displayedWeekTimetableIdMemory,
			startWeek,
			endWeek,
			weeks,
			slideIndex,
			weekRangeText,
			isCurrentWeek,
			currentPeriodIndex,
			expandedSlots,
			weekGridModels,
			weekCourseDisplayModels,
			weekLayouts
		} satisfies TimetableScreenState;
	});

	return {
		get state() {
			return state;
		},
		init,
		refresh,
		destroy,
		setDisplayedWeek,
		jumpToCurrentWeek,
		settlePagerAtSlide,
		expandSlot,
		collapseSlot,
		isSlotExpanded
	};
}

export type TimetableScreenController = ReturnType<typeof createTimetableScreen>;
