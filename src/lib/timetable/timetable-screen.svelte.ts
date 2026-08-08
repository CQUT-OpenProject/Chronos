import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { emptyAppState, type AppState } from '$lib/models/app-state';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
import { getRepository } from '$lib/client/repository';
import { BuildVisibleTimetableGridUseCase } from '$lib/domain/usecases/build-visible-timetable-grid';
import { BuildTimetableCourseDisplayModelsUseCase } from '$lib/domain/usecases/build-timetable-course-display-models';
import { CalculateAcademicWeekUseCase } from '$lib/domain/usecases/calculate-academic-week';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
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

const buildVisibleTimetableGrid = new BuildVisibleTimetableGridUseCase();
const buildTimetableCourseDisplayModels = new BuildTimetableCourseDisplayModelsUseCase();
const calculateAcademicWeek = new CalculateAcademicWeekUseCase();
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

export function destroyTimetableScreen() {
	sharedTimetableScreen?.destroy();
	sharedTimetableScreen = null;
}

export function createTimetableScreen() {
	let appState = $state<AppState>(emptyAppState());
	let hasLoadedAppState = $state(false);
	let today = $state(timeProvider.today());
	let revision = $state(0);
	let weekGridModels = new SvelteMap<number, TimetableGridModel>();
	let weekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

	let cachedTimetable: AppState['currentTimetable'] = null;
	let cachedToday = '';
	let cachedWeekGridModels = new SvelteMap<number, TimetableGridModel>();
	let cachedWeekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

	let unsubscribe: (() => void) | null = null;
	let todayTimer: ReturnType<typeof setTimeout> | null = null;

	function notify() {
		revision += 1;
	}

	function recompute() {
		const timetable = appState.currentTimetable;
		const academicWeek = calculateAcademicWeek.invoke(today, timetable?.academicConfig);
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

		const nextWeekGridModels = buildWeekGridModels(
			timetable,
			today,
			displayedWeekMemory,
			canReuseCache ? cachedWeekGridModels : new SvelteMap(),
			(todayValue, week, currentTimetable) =>
				buildVisibleTimetableGrid.invoke(todayValue, week, currentTimetable)
		);

		const nextWeekCourseDisplayModels = buildWeekCourseDisplayModels(
			timetable,
			today,
			displayedWeekMemory,
			nextWeekGridModels,
			canReuseCache ? cachedWeekCourseDisplayModels : new SvelteMap(),
			(currentTimetable, visibleDayOfWeeks, week, todayValue) =>
				buildTimetableCourseDisplayModels.invoke(
					currentTimetable,
					visibleDayOfWeeks,
					week,
					todayValue
				)
		);

		cachedTimetable = timetable;
		cachedToday = today;
		cachedWeekGridModels = new SvelteMap(nextWeekGridModels);
		cachedWeekCourseDisplayModels = new SvelteMap(nextWeekCourseDisplayModels);
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

	function init() {
		if (unsubscribe) return;

		const repository = getRepository();
		unsubscribe = repository.subscribeAppState((nextState) => {
			appState = nextState;
			hasLoadedAppState = true;
			recompute();
			notify();
		});

		scheduleTodayRefresh();
	}

	function refresh() {
		recompute();
		notify();
	}

	function destroy() {
		unsubscribe?.();
		unsubscribe = null;
		if (todayTimer) clearTimeout(todayTimer);
		todayTimer = null;
	}

	function setDisplayedWeek(week: number) {
		const timetable = appState.currentTimetable;
		if (!timetable) return;
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(week, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
		recompute();
		notify();
	}

	function jumpToCurrentWeek() {
		const timetable = appState.currentTimetable;
		if (!timetable) return;
		const academicWeek = calculateAcademicWeek.invoke(today, timetable.academicConfig);
		const { startWeek, endWeek } = academicBounds(timetable);
		displayedWeekMemory = clampDisplayedWeek(academicWeek, startWeek, endWeek);
		displayedWeekTimetableIdMemory = timetable.id;
		recompute();
		notify();
	}

	function settlePagerAtSlide(slideIndex: number) {
		const timetable = appState.currentTimetable;
		if (!timetable) return;
		const { startWeek } = academicBounds(timetable);
		setDisplayedWeek(weekFromSlideIndex(startWeek, slideIndex));
	}

	const state = $derived.by(() => {
		void revision;
		const timetable = appState.currentTimetable;
		const academicWeek = calculateAcademicWeek.invoke(today, timetable?.academicConfig);
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
