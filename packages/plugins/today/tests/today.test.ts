import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	createCourse,
	createTimetable,
	type CourseQueryHit,
	type IStorageService
} from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { createTodayPlugin } from '../src/index';
import {
	attachCourseStatuses,
	queryTodayCourses,
	resolveCourseTimeStatus,
	sortCourseHits
} from '../src/today-courses';
import { dayOfWeekFromIso } from '@chronos/core';

describe('today plugin', () => {
	it('registers bottom bar tab and screen slots when loaded', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createTodayPlugin());

		const tab = engine.slots.getSlotItem('shell.bottom-bar.tab', 'today');
		expect(tab).toBeDefined();
		expect(tab?.href).toBe('/today');
		expect(tab?.order).toBe(15);
		expect(tab?.defaultLaunch).toBe(true);

		const screen = engine.slots.getSlotItem('shell.route.screen', 'tool-today');
		expect(screen).toBeDefined();

		handle.dispose();
		expect(engine.slots.getSlotItem('shell.bottom-bar.tab', 'today')).toBeUndefined();
		engine.dispose();
	});
});

describe('today-courses', () => {
	const periodTimes = [
		{ index: 1, startTime: '08:00', endTime: '08:45' },
		{ index: 2, startTime: '08:55', endTime: '09:40' },
		{ index: 3, startTime: '10:00', endTime: '10:45' }
	];

	it('dayOfWeekFromIso maps Sunday to 7', () => {
		expect(dayOfWeekFromIso('2026-03-01')).toBe(7);
		expect(dayOfWeekFromIso('2026-03-02')).toBe(1);
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

		const entries = attachCourseStatuses(hits, periodTimes, 9 * 60, 2);
		expect(entries.map((entry) => entry.hit.course.id)).toEqual(['c1', 'c2']);
		expect(entries[0]?.status).toBe('past');
		expect(entries[1]?.status).toBe('upcoming');
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
		expect(queryCourses).toHaveBeenCalledTimes(2);
		expect(queryCourses).toHaveBeenCalledWith({
			dayOfWeek: 1,
			week: 1,
			timetableIds: ['t1']
		});
		expect(queryCourses).toHaveBeenCalledWith({
			dayOfWeek: 1,
			week: 1,
			timetableIds: ['t2']
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
