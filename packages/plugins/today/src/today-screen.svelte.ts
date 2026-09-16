import type { ChronosUiController } from '@chronos/ui-kit';
import { haptic } from '@chronos/ui-kit';
import {
	currentTimeMinutes,
	findCurrentPeriodIndex,
	isCoursePeriodVisible,
	ICoursePresentationService,
	IStorageService,
	normalizedCourseName,
	parsePeriodRanges,
	todayIsoDate,
	type CoursePaletteEntry,
	type PeriodTime
} from '@chronos/core';
import { get } from 'svelte/store';
import { DEFAULT_PREPARE_REMINDER_MINUTES, type TodayScope } from './constants';
import { attachCourseStatuses, queryTodayCourses, type TodayCourseEntry } from './today-courses';

export function coursePaintKey(timetableId: string, courseName: string): string {
	return `${timetableId}\0${normalizedCourseName(courseName)}`;
}

export interface TodayScreenController {
	readonly today: string;
	readonly now: Date;
	readonly scope: TodayScope;
	readonly prepareReminderMinutes: number;
	readonly courseEntries: TodayCourseEntry[];
	readonly paintByCourseKey: ReadonlyMap<string, CoursePaletteEntry>;
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
	let prepareReminderMinutes = $state(DEFAULT_PREPARE_REMINDER_MINUTES);
	let courseEntries = $state.raw<TodayCourseEntry[]>([]);
	let paintByCourseKey = $state.raw<Map<string, CoursePaletteEntry>>(new Map());
	let isDisposed = false;

	let unsubscribeConfigChanged: (() => void) | undefined;
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

	async function resolveCoursePaints(
		controller: ChronosUiController,
		entries: TodayCourseEntry[]
	): Promise<Map<string, CoursePaletteEntry>> {
		try {
			const ctx = controller.getPluginContext(pluginId);
			const presentation = ctx.tryService(ICoursePresentationService);
			if (!presentation) return new Map();

			const timetableIds = [...new Set(entries.map((entry) => entry.hit.timetableId))];
			const paints = new Map<string, CoursePaletteEntry>();
			await Promise.all(
				timetableIds.map(async (timetableId) => {
					const lookup = await presentation.resolveCoursePaintsForTimetable(timetableId);
					for (const [name, paint] of lookup) {
						paints.set(coursePaintKey(timetableId, name), paint);
					}
				})
			);
			return paints;
		} catch {
			return new Map();
		}
	}

	async function refreshCourses() {
		if (isDisposed) return;
		const controller = chronosController;
		const timetable = getTimetable();
		if (!controller || !timetable) {
			courseEntries = [];
			paintByCourseKey = new Map();
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
			const nextEntries = attachCourseStatuses(
				visibleHits,
				periodTimes,
				currentTimeMinutes(currentNow),
				getCurrentPeriodIndex(),
				prepareReminderMinutes
			);
			const nextPaints = await resolveCoursePaints(controller, nextEntries);
			if (isDisposed || chronosController !== controller) return;
			courseEntries = nextEntries;
			paintByCourseKey = nextPaints;
		} catch {
			if (!isDisposed) {
				courseEntries = [];
				paintByCourseKey = new Map();
			}
		}
	}

	function readPrepareReminderMinutes(config: Record<string, unknown>): number {
		const value = config.prepareReminderMinutes;
		return typeof value === 'number' && value >= 0 ? value : DEFAULT_PREPARE_REMINDER_MINUTES;
	}

	async function loadConfigFromPlugin() {
		const controller = chronosController;
		if (!controller) return;
		try {
			const ctx = controller.getPluginContext(pluginId);
			scope = (ctx.config.scope as TodayScope) ?? 'active';
			prepareReminderMinutes = readPrepareReminderMinutes(ctx.config);
		} catch {
			scope = 'active';
			prepareReminderMinutes = DEFAULT_PREPARE_REMINDER_MINUTES;
		}
	}

	async function init(controller: ChronosUiController, nextPluginId: string) {
		if (isDisposed) return;
		if (chronosController) return;
		chronosController = controller;
		pluginId = nextPluginId;

		await loadConfigFromPlugin();
		if (isDisposed || chronosController !== controller) return;

		try {
			const ctx = controller.getPluginContext(pluginId);
			const configChangedDisposable = ctx.on(
				'config:changed',
				({ pluginId: changedId, config }) => {
					if (isDisposed || changedId !== pluginId) return;
					scope = (config.scope as TodayScope) ?? scope;
					prepareReminderMinutes = readPrepareReminderMinutes(config);
					void refreshCourses();
				}
			);
			unsubscribeConfigChanged = () => configChangedDisposable.dispose();

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
		unsubscribeConfigChanged?.();
		unsubscribeConfigChanged = undefined;
		unsubscribeTimeTick?.();
		unsubscribeTimeTick = undefined;
		unsubscribeTimetableSwitch?.();
		unsubscribeTimetableSwitch = undefined;
		chronosController = null;
		pluginId = '';
		courseEntries = [];
		paintByCourseKey = new Map();
	}

	$effect(() => {
		if (isDisposed) return;
		const controller = chronosController;
		if (!controller) return;
		return controller.snapshot.subscribe((snapshot) => {
			void snapshot.clockNow;
			void snapshot.clockTodayIso;
			void snapshot.coursePaletteRevision;
			void scope;
			void prepareReminderMinutes;
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
		get prepareReminderMinutes() {
			return prepareReminderMinutes;
		},
		get courseEntries() {
			return courseEntries;
		},
		get paintByCourseKey() {
			return paintByCourseKey;
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
