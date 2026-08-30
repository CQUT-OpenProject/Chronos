import { SvelteSet } from 'svelte/reactivity';
import { trackEvent } from '$lib/client/analytics';
import {
	AcademicCalendarService,
	createDayClock,
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
import { buildWeekViewport, createWeekLayoutCache } from './week-viewport';

const calendarService = new AcademicCalendarService();

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
	let expandedSlots = $state(new SvelteSet<string>());
	let displayedWeekMemory = $state(1);
	let displayedWeekTimetableIdMemory = $state<string | null>(null);

	const layoutCache = createWeekLayoutCache();
	let dayClock: DayClockHandle | null = null;

	function currentTimetable(): Timetable | null {
		return shellRef?.controller.currentTimetable ?? null;
	}

	const navigation = $derived.by(() => {
		const timetable = currentTimetable();
		const academicWeek = calendarService.calculateAcademicWeek(today, timetable?.academicConfig);
		const displayedWeek = resolveDisplayedWeek(
			timetable,
			displayedWeekMemory,
			displayedWeekTimetableIdMemory,
			academicWeek
		);
		const { startWeek, endWeek } = academicBounds(timetable);
		return {
			timetable,
			academicWeek,
			displayedWeek,
			startWeek,
			endWeek,
			weeks: buildWeekList(startWeek, endWeek)
		};
	});

	const weekViewport = $derived.by(() => {
		const { timetable, displayedWeek } = navigation;
		void expandedSlots.size;
		void [...expandedSlots];
		return buildWeekViewport(
			{
				timetable,
				todayIso: today,
				displayedWeek,
				expandedSlotKeys: expandedSlots,
				academicCalendarService: calendarService
			},
			layoutCache
		);
	});

	$effect(() => {
		const timetable = currentTimetable();
		const timetableId = timetable?.id ?? null;
		if (displayedWeekTimetableIdMemory === timetableId) return;

		const academicWeek = calendarService.calculateAcademicWeek(today, timetable?.academicConfig);
		displayedWeekMemory = resolveDisplayedWeek(
			timetable,
			displayedWeekMemory,
			displayedWeekTimetableIdMemory,
			academicWeek
		);
		displayedWeekTimetableIdMemory = timetableId;
	});

	$effect(() => {
		const shell = shellRef;
		if (!shell || !dayClock) return;
		const timetable = shell.controller.currentTimetable;
		void timetable?.id;
		void timetable?.academicConfig.periodTimes;
		dayClock.reschedule();
	});

	const state = $derived.by(() => {
		void now;
		const { timetable, academicWeek, displayedWeek, startWeek, endWeek, weeks } = navigation;
		const { weekLayouts, weekGridModels, weekCourseDisplayModels } = weekViewport;
		const hasLoadedAppState = shellRef?.state.initialized ?? false;
		const isCurrentWeek = displayedWeek === academicWeek;
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

	function init(shell: AppShellController) {
		if (shellRef) return;
		shellRef = shell;
		dayClock = createDayClock({
			getPeriodTimes: () => currentTimetable()?.academicConfig.periodTimes ?? [],
			onMidnight: () => {
				today = todayIsoDate();
				now = new Date();
			},
			onPeriodBoundary: () => {
				now = new Date();
			}
		});
	}

	function refresh() {
		layoutCache.invalidateAll();
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
	}

	function jumpToCurrentWeek() {
		const timetable = currentTimetable();
		if (!timetable) return;
		trackEvent('timetable_week_jump_current');
		const academicWeek = calendarService.calculateAcademicWeek(today, timetable.academicConfig);
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(academicWeek, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
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
		}
	}

	function collapseSlot(slotKey: string) {
		if (expandedSlots.has(slotKey)) {
			expandedSlots.delete(slotKey);
		}
	}

	function isSlotExpanded(slotKey: string): boolean {
		return expandedSlots.has(slotKey);
	}

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
