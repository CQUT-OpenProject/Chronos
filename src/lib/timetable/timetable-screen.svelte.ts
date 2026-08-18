import { untrack } from 'svelte';
import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { trackEvent } from '$lib/client/analytics';
import { emptyAppState, type AppState } from '$lib/models/app-state';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
import type { AppShellController } from '$lib/app/app-shell.svelte';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import {
	invokeBuildTimetableCourseDisplayModels,
	invokeBuildVisibleTimetableGrid,
	invokeCalculateAcademicWeek
} from './timetable-preview';
import {
	buildWeekCourseDisplayModels,
	buildWeekGridModels,
	computeDelayUntilNextMidnightMillis
} from './timetable-screen-logic';
import {
	academicBounds,
	buildWeekList,
	clampDisplayedWeek,
	resolveDisplayedWeek,
	slideIndexFromWeek,
	weekFromSlideIndex
} from './week-navigation';

const timeProvider = new SystemTimeProvider();

let displayedWeekMemory = 1;
let displayedWeekTimetableIdMemory: string | null = null;

let sharedTimetableScreen: TimetableScreenController | null = null;

export interface TimetableScreenState {
	appState: AppState;
	hasLoadedAppState: boolean;
	today: string;
	academicWeek: number;
	displayedWeek: number;
	displayedWeekTimetableId: string | null;
	startWeek: number;
	endWeek: number;
	weeks: number[];
	slideIndex: number;
	weekGridModels: Map<number, TimetableGridModel>;
	weekCourseDisplayModels: Map<number, TimetableCourseDisplayModel[]>;
}

export function getTimetableScreen(): TimetableScreenController {
	sharedTimetableScreen ??= createTimetableScreen();
	return sharedTimetableScreen;
}

function createTimetableScreen() {
	let shellRef = $state<AppShellController | null>(null);
	let today = $state(timeProvider.today());
	let revision = $state(0);
	let weekGridModels = new SvelteMap<number, TimetableGridModel>();
	let weekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

	let cachedTimetable: AppState['currentTimetable'] = null;
	let cachedToday = '';
	const cachedWeekGridModels = new SvelteMap<number, TimetableGridModel>();
	const cachedWeekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

	let todayTimer: ReturnType<typeof setTimeout> | null = null;

	function currentAppState(): AppState {
		return shellRef?.state.appState ?? emptyAppState();
	}

	$effect(() => {
		const shell = shellRef;
		if (!shell) return;
		const { appState, initialized } = shell.state;
		void appState;
		void initialized;
		untrack(() => {
			recompute();
			notify();
		});
	});

	function notify() {
		revision += 1;
	}

	function recompute() {
		const timetable = currentAppState().currentTimetable;
		const academicWeek = invokeCalculateAcademicWeek(today, timetable?.academicConfig);
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
			cachedWeekGridModels.clear();
			cachedWeekCourseDisplayModels.clear();
		}

		const nextWeekGridModels = buildWeekGridModels(
			timetable,
			today,
			displayedWeekMemory,
			cachedWeekGridModels,
			(todayValue, week, currentTimetable) =>
				invokeBuildVisibleTimetableGrid(todayValue, week, currentTimetable)
		);

		const nextWeekCourseDisplayModels = buildWeekCourseDisplayModels(
			timetable,
			today,
			displayedWeekMemory,
			nextWeekGridModels,
			cachedWeekCourseDisplayModels,
			(currentTimetable, visibleDayOfWeeks, week, todayValue) =>
				invokeBuildTimetableCourseDisplayModels(
					currentTimetable,
					visibleDayOfWeeks,
					week,
					todayValue
				)
		);

		for (const [week, model] of nextWeekGridModels) {
			cachedWeekGridModels.set(week, model);
		}
		for (const [week, models] of nextWeekCourseDisplayModels) {
			cachedWeekCourseDisplayModels.set(week, models);
		}

		cachedTimetable = timetable;
		cachedToday = today;
		weekGridModels = new SvelteMap(nextWeekGridModels);
		weekCourseDisplayModels = new SvelteMap(nextWeekCourseDisplayModels);
	}

	function scheduleTodayRefresh() {
		if (todayTimer) clearTimeout(todayTimer);
		const delay = computeDelayUntilNextMidnightMillis(new SvelteDate());
		todayTimer = setTimeout(() => {
			today = timeProvider.today();
			recompute();
			notify();
			scheduleTodayRefresh();
		}, delay);
	}

	function init(shell: AppShellController) {
		if (shellRef) return;
		shellRef = shell;
		scheduleTodayRefresh();
	}

	function refresh() {
		recompute();
		notify();
	}

	function destroy() {
		shellRef = null;
		if (todayTimer) clearTimeout(todayTimer);
		todayTimer = null;
	}

	function setDisplayedWeek(week: number) {
		const timetable = currentAppState().currentTimetable;
		if (!timetable) return;
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(week, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
		recompute();
		notify();
	}

	function jumpToCurrentWeek() {
		const timetable = currentAppState().currentTimetable;
		if (!timetable) return;
		trackEvent('timetable_week_jump_current');
		const academicWeek = invokeCalculateAcademicWeek(today, timetable.academicConfig);
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(academicWeek, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
		recompute();
		notify();
	}

	function settlePagerAtSlide(slideIndex: number) {
		const timetable = currentAppState().currentTimetable;
		if (!timetable) return;
		const { startWeek } = academicBounds(timetable);
		setDisplayedWeek(weekFromSlideIndex(startWeek, slideIndex));
	}

	const state = $derived.by(() => {
		void revision;
		const appState = currentAppState();
		const hasLoadedAppState = shellRef?.state.initialized ?? false;
		const timetable = appState.currentTimetable;
		const academicWeek = invokeCalculateAcademicWeek(today, timetable?.academicConfig);
		const displayedWeek = resolveDisplayedWeek(
			timetable,
			displayedWeekMemory,
			displayedWeekTimetableIdMemory,
			academicWeek
		);
		const { startWeek, endWeek } = academicBounds(timetable);
		const weeks = buildWeekList(startWeek, endWeek);
		const slideIndex = slideIndexFromWeek(startWeek, displayedWeek, weeks.length);

		return {
			appState,
			hasLoadedAppState,
			today,
			academicWeek,
			displayedWeek,
			displayedWeekTimetableId: displayedWeekTimetableIdMemory,
			startWeek,
			endWeek,
			weeks,
			slideIndex,
			weekGridModels,
			weekCourseDisplayModels
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
		settlePagerAtSlide
	};
}

export type TimetableScreenController = ReturnType<typeof createTimetableScreen>;
