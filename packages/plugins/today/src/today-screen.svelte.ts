import { untrack } from 'svelte';
import type { ReactiveChronosController } from '@chronos/ui-kit';
import {
	createDayClock,
	currentTimeMinutes,
	findCurrentPeriodIndex,
	IStorageService,
	parsePeriodRanges,
	todayIsoDate,
	type DayClockHandle,
	type PeriodTime
} from '@chronos/core';
import type { TodayScope } from './constants';
import { attachCourseStatuses, queryTodayCourses, type TodayCourseEntry } from './today-courses';

export interface TodayScreenController {
	readonly today: string;
	readonly now: Date;
	readonly scope: TodayScope;
	readonly courseEntries: TodayCourseEntry[];
	readonly currentPeriodIndex: number | null;
	init(controller: ReactiveChronosController, pluginId: string): Promise<void>;
	dispose(): void;
	persistScope(nextScope: TodayScope): Promise<void>;
	refreshCourses(): Promise<void>;
}

export function createTodayScreenController(): TodayScreenController {
	let chronosController = $state<ReactiveChronosController | null>(null);
	let pluginId = '';
	let today = $state(todayIsoDate());
	let now = $state(new Date());
	let scope = $state<TodayScope>('active');
	let courseEntries = $state<TodayCourseEntry[]>([]);

	let dayClock: DayClockHandle | null = null;
	let unsubscribeTimetableSwitch: (() => void) | undefined;

	function getTimetable() {
		return chronosController?.currentTimetable ?? null;
	}

	function getPeriodTimes(): PeriodTime[] {
		return getTimetable()?.academicConfig.periodTimes ?? [];
	}

	const currentPeriodIndex = $derived.by(() => {
		void now;
		const periodTimes = getPeriodTimes();
		const parsed = parsePeriodRanges(periodTimes);
		if (parsed.length === 0) {
			return chronosController?.currentPeriodIndex ?? null;
		}
		return findCurrentPeriodIndex(parsed, currentTimeMinutes(now));
	});

	async function refreshCourses() {
		const controller = chronosController;
		const timetable = getTimetable();
		if (!controller || !timetable) {
			courseEntries = [];
			return;
		}

		try {
			const ctx = controller.getPluginContext(pluginId);
			const hits = await queryTodayCourses(ctx.service(IStorageService), {
				todayIso: today,
				scope,
				timetable
			});
			courseEntries = attachCourseStatuses(
				hits,
				getPeriodTimes(),
				currentTimeMinutes(now),
				currentPeriodIndex
			);
		} catch {
			courseEntries = [];
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

	async function init(controller: ReactiveChronosController, nextPluginId: string) {
		if (chronosController) return;
		chronosController = controller;
		pluginId = nextPluginId;

		await loadScopeFromConfig();

		dayClock = createDayClock({
			getPeriodTimes,
			onMidnight: () => {
				today = todayIsoDate();
				now = new Date();
				void refreshCourses();
			},
			onPeriodBoundary: () => {
				now = new Date();
				void refreshCourses();
			}
		});

		try {
			const ctx = controller.getPluginContext(pluginId);
			const disposable = ctx.on('timetable:switched', () => {
				dayClock?.reschedule();
				void refreshCourses();
			});
			unsubscribeTimetableSwitch = () => disposable.dispose();
		} catch {
			// Plugin context unavailable during teardown.
		}

		await refreshCourses();
	}

	async function persistScope(nextScope: TodayScope) {
		scope = nextScope;
		const controller = chronosController;
		if (!controller) return;
		try {
			const ctx = controller.getPluginContext(pluginId);
			await ctx.updateConfig({ scope: nextScope });
		} catch {
			// Keep local state if persistence fails.
		}
		await refreshCourses();
	}

	function dispose() {
		dayClock?.dispose();
		dayClock = null;
		unsubscribeTimetableSwitch?.();
		unsubscribeTimetableSwitch = undefined;
		chronosController = null;
		pluginId = '';
		courseEntries = [];
	}

	$effect(() => {
		const controller = chronosController;
		if (!controller || !dayClock) return;
		const timetable = controller.currentTimetable;
		void timetable?.id;
		void timetable?.academicConfig.periodTimes;
		void scope;
		void today;
		untrack(() => {
			dayClock?.reschedule();
			void refreshCourses();
		});
	});

	return {
		get today() {
			return today;
		},
		get now() {
			return now;
		},
		get scope() {
			return scope;
		},
		get courseEntries() {
			return courseEntries;
		},
		get currentPeriodIndex() {
			return currentPeriodIndex;
		},
		init,
		dispose,
		persistScope,
		refreshCourses
	};
}
