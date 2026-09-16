import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	createCourse,
	createTimetable,
	type CourseQueryHit,
	IStorageService,
	assignCourseDisplayColors,
	COURSE_PALETTE_ENTRIES
} from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { createTodayPlugin } from '../src/index';
import { TODAY_CONFIG_SCHEMA } from '../src/messages';
import { coursePaintKey, createTodayScreenController } from '../src/today-screen.svelte';
import {
	attachCourseStatuses,
	queryTodayCourses,
	resolveCourseTimeStatus,
	resolveMinutesUntilCourseStart,
	resolvePeriodTimeRange,
	sortCourseHits
} from '../src/today-courses';
import { DEFAULT_PREPARE_REMINDER_MINUTES } from '../src/constants';
import type { ReactiveChronosController } from '@chronos/ui-kit';

describe('today plugin', () => {
	it('exposes prepare reminder config with 30 minute default', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createTodayPlugin());
		const ctx = engine.getPluginContext('tool-today');

		expect(ctx.config.prepareReminderMinutes).toBe(DEFAULT_PREPARE_REMINDER_MINUTES);
		expect(TODAY_CONFIG_SCHEMA.prepareReminderMinutes.default).toBe(30);

		handle.dispose();
		engine.dispose();
	});

	it('registers bottom bar tab and screen slots when loaded', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createTodayPlugin());

		const tab = engine.slots.getSlotItem('shell.bottom-bar.tab', 'today');
		expect(tab).toBeDefined();
		expect(tab?.order).toBe(15);
		expect(tab?.defaultLaunch).toBe(true);

		const screen = engine.slots.getSlotItem('shell.route.screen', 'tool-today');
		expect(screen).toBeDefined();

		handle.dispose();
		expect(engine.slots.getSlotItem('shell.bottom-bar.tab', 'today')).toBeUndefined();
		engine.dispose();
	});

	it('exposes a valid today ISO date before init', () => {
		const screen = createTodayScreenController();
		expect(screen.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});

	it('does not leak event listeners when disposed during async initialization', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.loadPlugin(createTodayPlugin());

		const mockController = {
			currentTimetable: null,
			coursePalette: null,
			clockNow: new Date(),
			clockTodayIso: '2026-03-02',
			currentPeriodIndex: null,
			getPluginContext: (id: string) => engine.getPluginContext(id)
		} as unknown as ReactiveChronosController;

		const screen = createTodayScreenController();
		const initPromise = screen.init(mockController, 'tool-today');
		screen.dispose();
		await initPromise;

		engine.events.emit('time:tick', {
			todayIso: '2026-03-02',
			now: new Date('2026-03-02T10:00:00'),
			currentWeek: 1,
			currentPeriod: 1,
			frozen: false
		});

		expect(screen.courseEntries).toEqual([]);
		engine.dispose();
	});

	it('resolves course paints via ICoursePresentationService using full timetable scope', async () => {
		const courseA = createCourse({
			id: 'ca',
			name: 'Course A',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 1
		});
		const courseB = createCourse({
			id: 'cb',
			name: 'Course B',
			dayOfWeek: 1,
			startPeriod: 2,
			endPeriod: 2
		});
		const timetable = createTimetable({ id: 'main', name: 'Main', courses: [courseA, courseB] });
		const lookup = assignCourseDisplayColors(timetable.courses, COURSE_PALETTE_ENTRIES);

		const { env, timetables } = createMockEnv({
			coursePresentation: {
				getCoursePalette: () => COURSE_PALETTE_ENTRIES,
				resolveCoursePaintsForTimetable: async () => lookup,
				resolveCoursePaint: async ({ course }) =>
					lookup.get(course.name) ?? COURSE_PALETTE_ENTRIES[0]!
			}
		});
		const engine = new ChronosEngine({ env });
		await engine.init();
		timetables.set(timetable.id, timetable);
		await engine.switchTimetable(timetable.id);
		await engine.loadPlugin(createTodayPlugin());

		const mockController = {
			snapshot: {
				subscribe: (listener: (value: unknown) => void) => {
					listener({
						clockNow: new Date('2026-03-02T10:00:00'),
						clockTodayIso: '2026-03-02',
						currentTimetable: timetable,
						coursePaletteRevision: 0
					});
					return () => {};
				}
			},
			getPluginContext: (id: string) => engine.getPluginContext(id)
		} as unknown as ReactiveChronosController;

		const storage = engine.getPluginContext('tool-today').service(IStorageService);
		vi.spyOn(storage, 'queryCourses').mockResolvedValue([
			{
				timetableId: timetable.id,
				timetableName: timetable.name,
				course: courseA
			}
		]);

		const screen = createTodayScreenController();
		await screen.init(mockController, 'tool-today');

		expect(screen.paintByCourseKey.get(coursePaintKey(timetable.id, courseA.name))).toEqual(
			lookup.get('Course A')
		);
		engine.dispose();
	});
});

describe('today-courses', () => {
	const periodTimes = [
		{ index: 1, startTime: '08:00', endTime: '08:45' },
		{ index: 2, startTime: '08:55', endTime: '09:40' },
		{ index: 3, startTime: '10:00', endTime: '10:45' }
	];

	it('resolvePeriodTimeRange returns start and end times for a period span', () => {
		expect(resolvePeriodTimeRange(periodTimes, 1, 2)).toEqual({
			startTime: '08:00',
			endTime: '09:40'
		});
		expect(resolvePeriodTimeRange(periodTimes, 3, 3)).toEqual({
			startTime: '10:00',
			endTime: '10:45'
		});
		expect(resolvePeriodTimeRange(periodTimes, 9, 9)).toBeNull();
	});

	it('sortCourseHits orders by start period then end period', () => {
		const hits: CourseQueryHit[] = [
			{
				timetableId: 't1',
				timetableName: 'A',
				course: createCourse({
					id: 'c2',
					name: 'B',
					dayOfWeek: 1,
					startPeriod: 3,
					endPeriod: 3
				})
			},
			{
				timetableId: 't1',
				timetableName: 'A',
				course: createCourse({
					id: 'c1',
					name: 'A',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 2
				})
			}
		];

		expect(sortCourseHits(hits).map((hit) => hit.course.id)).toEqual(['c1', 'c2']);
	});

	it('resolveCourseTimeStatus marks preparing courses within reminder window', () => {
		const preparing = createCourse({
			id: 'prep',
			name: 'Preparing',
			dayOfWeek: 1,
			startPeriod: 3,
			endPeriod: 3
		});

		const nowMinutes = 9 * 60 + 30;
		expect(resolveCourseTimeStatus(preparing, periodTimes, nowMinutes, 2, 30)).toBe('preparing');
		expect(resolveCourseTimeStatus(preparing, periodTimes, nowMinutes, 2, 29)).toBe('upcoming');
		expect(resolveCourseTimeStatus(preparing, periodTimes, nowMinutes, 2, 0)).toBe('upcoming');
	});

	it('resolveMinutesUntilCourseStart returns minutes before class starts', () => {
		const course = createCourse({
			id: 'c1',
			name: 'Math',
			dayOfWeek: 1,
			startPeriod: 3,
			endPeriod: 3
		});

		expect(resolveMinutesUntilCourseStart(course, periodTimes, 9 * 60 + 30)).toBe(30);
		expect(resolveMinutesUntilCourseStart(course, periodTimes, 10 * 60)).toBeNull();
	});

	it('resolveCourseTimeStatus marks current, past, and upcoming courses', () => {
		const upcoming = createCourse({
			id: 'u',
			name: 'Upcoming',
			dayOfWeek: 1,
			startPeriod: 3,
			endPeriod: 3
		});
		const current = createCourse({
			id: 'c',
			name: 'Current',
			dayOfWeek: 1,
			startPeriod: 2,
			endPeriod: 2
		});
		const past = createCourse({
			id: 'p',
			name: 'Past',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 1
		});

		const nowMinutes = 9 * 60;
		expect(resolveCourseTimeStatus(upcoming, periodTimes, nowMinutes, 2)).toBe('upcoming');
		expect(resolveCourseTimeStatus(current, periodTimes, nowMinutes, 2)).toBe('current');
		expect(resolveCourseTimeStatus(past, periodTimes, nowMinutes, 2)).toBe('past');
	});

	it('attachCourseStatuses returns sorted entries with status', () => {
		const hits: CourseQueryHit[] = [
			{
				timetableId: 't1',
				timetableName: 'A',
				course: createCourse({
					id: 'c2',
					name: 'Later',
					dayOfWeek: 1,
					startPeriod: 3,
					endPeriod: 3
				})
			},
			{
				timetableId: 't1',
				timetableName: 'A',
				course: createCourse({
					id: 'c1',
					name: 'Earlier',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 1
				})
			}
		];

		const entries = attachCourseStatuses(hits, periodTimes, 9 * 60 + 30, 2, 30);
		expect(entries.map((entry) => entry.hit.course.id)).toEqual(['c1', 'c2']);
		expect(entries[0]?.status).toBe('past');
		expect(entries[1]?.status).toBe('preparing');
		expect(entries[1]?.minutesUntilStart).toBe(30);
	});

	it('queryTodayCourses uses active timetable filter when scope is active', async () => {
		const timetable = createTimetable({
			id: 't1',
			name: 'Main',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			}
		});

		const queryCourses = vi.fn(async () => []);
		const storage = { queryCourses } as unknown as IStorageService;

		await queryTodayCourses(storage, {
			todayIso: '2026-03-02',
			scope: 'active',
			timetable
		});

		expect(queryCourses).toHaveBeenCalledWith({
			dayOfWeek: 1,
			week: 1,
			timetableIds: ['t1']
		});
	});

	it('queryTodayCourses queries each timetable with its own week when scope is all', async () => {
		const timetable1 = createTimetable({
			id: 't1',
			name: 'Main',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			}
		});
		const timetable2 = createTimetable({
			id: 't2',
			name: 'Other',
			academicConfig: {
				termStartDate: '2026-09-01',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			}
		});

		const queryCourses = vi.fn(async () => []);
		const listTimetables = vi.fn(async () => [
			{ id: 't1', name: 'Main', updatedAt: 0 },
			{ id: 't2', name: 'Other', updatedAt: 0 }
		]);
		const getTimetable = vi.fn(async (id: string) => {
			if (id === 't1') return timetable1;
			if (id === 't2') return timetable2;
			return null;
		});
		const storage = { queryCourses, listTimetables, getTimetable } as unknown as IStorageService;

		await queryTodayCourses(storage, {
			todayIso: '2026-03-02',
			scope: 'all',
			timetable: timetable1
		});

		expect(listTimetables).toHaveBeenCalled();
		expect(getTimetable).toHaveBeenCalledTimes(2);
		expect(queryCourses).toHaveBeenCalledTimes(1);
		expect(queryCourses).toHaveBeenCalledWith({
			dayOfWeek: 1,
			week: 1,
			timetableIds: ['t1', 't2']
		});
	});

	it('queryTodayCourses returns empty array without timetable', async () => {
		const queryCourses = vi.fn(async () => []);
		const storage = { queryCourses } as unknown as IStorageService;

		const hits = await queryTodayCourses(storage, {
			todayIso: '2026-03-02',
			scope: 'active',
			timetable: null
		});

		expect(hits).toEqual([]);
		expect(queryCourses).not.toHaveBeenCalled();
	});
});
