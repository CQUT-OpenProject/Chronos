import { SvelteDate, SvelteMap } from 'svelte/reactivity';
import { emptyAppState, type AppState } from '$lib/models/app-state';
import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
import { getRepository } from '$lib/client/repository';
import { BuildVisibleTimetableGridUseCase } from '$lib/domain/usecases/build-visible-timetable-grid';
import { BuildTimetableCourseDisplayModelsUseCase } from '$lib/domain/usecases/build-timetable-course-display-models';
import { CalculateAcademicWeekUseCase } from '$lib/domain/usecases/calculate-academic-week';
import { CreateTimetableUseCase } from '$lib/domain/usecases/create-timetable';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import {
	buildWeekCourseDisplayModels,
	buildWeekGridModels,
	computeDelayUntilNextMidnightMillis,
	resolveDisplayedWeek
} from './timetable-screen-logic';

const buildVisibleTimetableGrid = new BuildVisibleTimetableGridUseCase();
const buildTimetableCourseDisplayModels = new BuildTimetableCourseDisplayModelsUseCase();
const calculateAcademicWeek = new CalculateAcademicWeekUseCase();
const timeProvider = new SystemTimeProvider();

export interface TimetableScreenState {
	appState: AppState;
	hasLoadedAppState: boolean;
	today: string;
	academicWeek: number;
	displayedWeek: number;
	displayedWeekTimetableId: string | null;
	weekGridModels: Map<number, TimetableGridModel>;
	weekCourseDisplayModels: Map<number, TimetableCourseDisplayModel[]>;
}

export function createTimetableScreen() {
	let appState = $state<AppState>(emptyAppState());
	let hasLoadedAppState = $state(false);
	let today = $state(timeProvider.today());
	let displayedWeek = $state(1);
	let displayedWeekTimetableId = $state<string | null>(null);
	let weekGridModels = new SvelteMap<number, TimetableGridModel>();
	let weekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

	let cachedTimetable: AppState['currentTimetable'] = null;
	let cachedToday = '';
	let cachedWeekGridModels = new SvelteMap<number, TimetableGridModel>();
	let cachedWeekCourseDisplayModels = new SvelteMap<number, TimetableCourseDisplayModel[]>();

	let unsubscribe: (() => void) | null = null;
	let todayTimer: ReturnType<typeof setTimeout> | null = null;

	function recompute() {
		const timetable = appState.currentTimetable;
		const academicWeek = calculateAcademicWeek.invoke(today, timetable?.academicConfig);
		const resolvedWeek = resolveDisplayedWeek(
			timetable,
			displayedWeek,
			displayedWeekTimetableId,
			academicWeek
		);

		if (resolvedWeek !== displayedWeek) {
			displayedWeek = resolvedWeek;
		}

		const canReuseCache =
			timetable != null && timetable === cachedTimetable && today === cachedToday;

		const nextWeekGridModels = buildWeekGridModels(
			timetable,
			today,
			displayedWeek,
			canReuseCache ? cachedWeekGridModels : new SvelteMap(),
			(todayValue, week, currentTimetable) =>
				buildVisibleTimetableGrid.invoke(todayValue, week, currentTimetable)
		);

		const nextWeekCourseDisplayModels = buildWeekCourseDisplayModels(
			timetable,
			today,
			displayedWeek,
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
		});

		scheduleTodayRefresh();
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
		displayedWeek = Math.min(
			Math.max(week, timetable.academicConfig.startWeek),
			timetable.academicConfig.endWeek
		);
		displayedWeekTimetableId = timetable.id;
		recompute();
	}

	function jumpToCurrentWeek() {
		const timetable = appState.currentTimetable;
		if (!timetable) return;
		const academicWeek = calculateAcademicWeek.invoke(today, timetable.academicConfig);
		displayedWeek = Math.min(
			Math.max(academicWeek, timetable.academicConfig.startWeek),
			timetable.academicConfig.endWeek
		);
		displayedWeekTimetableId = timetable.id;
		recompute();
	}

	async function createTimetable() {
		const useCase = new CreateTimetableUseCase(getRepository(), undefined, timeProvider);
		await useCase.invoke('未命名课表');
	}

	const academicWeek = $derived(
		calculateAcademicWeek.invoke(today, appState.currentTimetable?.academicConfig)
	);

	const state = $derived({
		appState,
		hasLoadedAppState,
		today,
		academicWeek,
		displayedWeek,
		displayedWeekTimetableId,
		weekGridModels,
		weekCourseDisplayModels
	} satisfies TimetableScreenState);

	return {
		get state() {
			return state;
		},
		init,
		destroy,
		setDisplayedWeek,
		jumpToCurrentWeek,
		createTimetable
	};
}

export type TimetableScreenController = ReturnType<typeof createTimetableScreen>;
