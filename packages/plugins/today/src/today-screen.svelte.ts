import type { ChronosUiController } from '@chronos/ui-kit';
import { haptic } from '@chronos/ui-kit';
import {
	currentTimeMinutes,
	findCurrentPeriodIndex,
	isCoursePeriodVisible,
	IStorageService,
	parsePeriodRanges,
	todayIsoDate,
	type PeriodTime
} from '@chronos/core';
import { get } from 'svelte/store';
import type { TodayScope } from './constants';
import { attachCourseStatuses, queryTodayCourses, type TodayCourseEntry } from './today-courses';

export interface TodayScreenController {
	readonly today: string;
	readonly now: Date;
	readonly scope: TodayScope;
	readonly courseEntries: TodayCourseEntry[];
	readonly currentPeriodIndex: number | null;
	init(controller: ChronosUiController, pluginId: string): Promise<void>;
	dispose(): void;
	persistScope(nextScope: TodayScope): Promise<void>;
	refreshCourses(): Promise<void>;
}

export function createTodayScreenController(): TodayScreenController {
	let chronosController = $state<ChronosUiController | null>(null);
	let pluginId = '';
	let scope = $state<TodayScope>('active');
	let courseEntries = $state.raw<TodayCourseEntry[]>([]);
	let isDisposed = false;

	let unsubscribeTimeTick: (() => void) | undefined;
	let unsubscribeTimetableSwitch: (() => void) | undefined;

	function readSnapshot() {
		if (!chronosController) return null;
		return get(chronosController.snapshot);
	}

	function getTimetable() {
		return readSnapshot()?.currentTimetable ?? null;
	}

	function getPeriodTimes(): PeriodTime[] {
		return getTimetable()?.academicConfig.periodTimes ?? [];
	}

	function getTodayIso(): string {
		return readSnapshot()?.clockTodayIso || todayIsoDate();
	}

	function getNow(): Date {
		return readSnapshot()?.clockNow ?? new Date();
	}

	function getCurrentPeriodIndex(): number | null {
		const snapshot = readSnapshot();
		if (!snapshot) return null;
		const periodTimes = getPeriodTimes();
		const parsed = parsePeriodRanges(periodTimes);
		if (parsed.length === 0) {
			return snapshot.currentPeriodIndex ?? null;
		}
		return findCurrentPeriodIndex(parsed, currentTimeMinutes(snapshot.clockNow));
	}

	async function refreshCourses() {
		if (isDisposed) return;
		const controller = chronosController;
		const timetable = getTimetable();
		if (!controller || !timetable) {
			courseEntries = [];
			return;
		}

		try {
			const ctx = controller.getPluginContext(pluginId);
			const currentToday = getTodayIso();
			const currentNow = getNow();
			const hits = await queryTodayCourses(ctx.service(IStorageService), {
				todayIso: currentToday,
				scope,
				timetable
			});
			if (isDisposed || chronosController !== controller) return;

			const periodTimes = getPeriodTimes();
			const visibleHits = hits.filter((hit) =>
				isCoursePeriodVisible(hit.course, periodTimes.length)
			);
			courseEntries = attachCourseStatuses(
				visibleHits,
				periodTimes,
				currentTimeMinutes(currentNow),
				getCurrentPeriodIndex()
			);
		} catch {
			if (!isDisposed) {
				courseEntries = [];
			}
		}
	}

	async function loadScopeFromConfig() {
		const controller = chronosController;
		if (!controller) return;
		try {
			const ctx = controller.getPluginContext(pluginId);
			scope = (ctx.config.scope as TodayScope) ?? 'active';
		} catch {
			scope = 'active';
		}
	}

	async function init(controller: ChronosUiController, nextPluginId: string) {
		if (isDisposed) return;
		if (chronosController) return;
		chronosController = controller;
		pluginId = nextPluginId;

		await loadScopeFromConfig();
		if (isDisposed || chronosController !== controller) return;

		try {
			const ctx = controller.getPluginContext(pluginId);
			const timeTickDisposable = ctx.on('time:tick', () => {
				if (isDisposed) return;
				void refreshCourses();
			});
			unsubscribeTimeTick = () => timeTickDisposable.dispose();

			const timetableSwitchDisposable = ctx.on('timetable:switched', () => {
				if (isDisposed) return;
				void refreshCourses();
			});
			unsubscribeTimetableSwitch = () => timetableSwitchDisposable.dispose();
		} catch {
			// Plugin context unavailable during teardown.
		}

		if (isDisposed || chronosController !== controller) return;
		await refreshCourses();
	}

	async function persistScope(nextScope: TodayScope) {
		if (isDisposed) return;
		if (nextScope !== scope) {
			haptic.medium();
		}
		scope = nextScope;
		const controller = chronosController;
		if (!controller) return;
		try {
			const ctx = controller.getPluginContext(pluginId);
			await ctx.updateConfig({ scope: nextScope });
		} catch {
			// Keep local state if persistence fails.
		}
		if (isDisposed) return;
		await refreshCourses();
	}

	function dispose() {
		isDisposed = true;
		unsubscribeTimeTick?.();
		unsubscribeTimeTick = undefined;
		unsubscribeTimetableSwitch?.();
		unsubscribeTimetableSwitch = undefined;
		chronosController = null;
		pluginId = '';
		courseEntries = [];
	}

	$effect(() => {
		if (isDisposed) return;
		const controller = chronosController;
		if (!controller) return;
		return controller.snapshot.subscribe((snapshot) => {
			void snapshot.clockNow;
			void snapshot.clockTodayIso;
			void scope;
			void snapshot.currentTimetable?.id;
			void snapshot.currentTimetable?.academicConfig.periodTimes;
			void refreshCourses();
		});
	});

	return {
		get today() {
			return getTodayIso();
		},
		get now() {
			return getNow();
		},
		get scope() {
			return scope;
		},
		get courseEntries() {
			return courseEntries;
		},
		get currentPeriodIndex() {
			return getCurrentPeriodIndex();
		},
		init,
		dispose,
		persistScope,
		refreshCourses
	};
}
