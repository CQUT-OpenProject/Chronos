import type { ReactiveChronosController } from '@chronos/ui-kit';
import {
	currentTimeMinutes,
	findCurrentPeriodIndex,
	IStorageService,
	parsePeriodRanges,
	todayIsoDate,
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
	let scope = $state<TodayScope>('active');
	let courseEntries = $state.raw<TodayCourseEntry[]>([]);

	let unsubscribeTimeTick: (() => void) | undefined;
	let unsubscribeTimetableSwitch: (() => void) | undefined;

	function getTimetable() {
		return chronosController?.currentTimetable ?? null;
	}

	function getPeriodTimes(): PeriodTime[] {
		return getTimetable()?.academicConfig.periodTimes ?? [];
	}

	const today = $derived(chronosController?.clockTodayIso || todayIsoDate());
	const now = $derived(chronosController?.clockNow ?? new Date());

	const currentPeriodIndex = $derived.by(() => {
		const controller = chronosController;
		const tickNow = controller?.clockNow ?? new Date();
		void tickNow;
		const periodTimes = getPeriodTimes();
		const parsed = parsePeriodRanges(periodTimes);
		if (parsed.length === 0) {
			return controller?.currentPeriodIndex ?? null;
		}
		return findCurrentPeriodIndex(parsed, currentTimeMinutes(tickNow));
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

		try {
			const ctx = controller.getPluginContext(pluginId);
			const timeTickDisposable = ctx.on('time:tick', () => {
				void refreshCourses();
			});
			unsubscribeTimeTick = () => timeTickDisposable.dispose();

			const timetableSwitchDisposable = ctx.on('timetable:switched', () => {
				void refreshCourses();
			});
			unsubscribeTimetableSwitch = () => timetableSwitchDisposable.dispose();
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
		unsubscribeTimeTick?.();
		unsubscribeTimeTick = undefined;
		unsubscribeTimetableSwitch?.();
		unsubscribeTimetableSwitch = undefined;
		chronosController = null;
		pluginId = '';
		courseEntries = [];
	}

	$effect(() => {
		const controller = chronosController;
		if (!controller) return;
		void controller.clockNow;
		void controller.clockTodayIso;
		void scope;
		void getTimetable()?.id;
		void getTimetable()?.academicConfig.periodTimes;
		void refreshCourses();
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
