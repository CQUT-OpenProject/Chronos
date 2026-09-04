import { describe, it, expect, vi } from 'vite-plus/test';
import { parseHolidayCnOffDays } from '../src/holiday-cn-client';
import { needsHolidaySync, syncHolidayCalendarFromHolidayCn } from '../src/holiday-sync';
import {
	ChronosEngine,
	createTimetable,
	type ChronosContext,
	type IHttpService
} from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { createHolidayPlugin } from '../src/index';

describe('calendar-holidays plugin', () => {
	it('parses only isOffDay=true from holiday-cn payload', () => {
		const holidays = parseHolidayCnOffDays({
			year: 2026,
			papers: [],
			days: [
				{ date: '2026-01-01', name: '元旦', isOffDay: true },
				{ date: '2026-01-04', name: '元旦', isOffDay: false }
			]
		});
		expect(holidays).toEqual([{ date: '2026-01-01', label: '元旦' }]);
	});

	it('needsHolidaySync returns false when synced years cover the term', () => {
		expect(
			needsHolidaySync(
				{
					holidays: [{ date: '2026-10-01', label: '国庆节' }],
					syncedAt: 1,
					syncedYears: [2026]
				},
				[2026]
			)
		).toBe(false);
		expect(
			needsHolidaySync(
				{
					holidays: [{ date: '2026-10-01', label: '国庆节' }],
					syncedAt: 1,
					syncedYears: [2026]
				},
				[2026, 2027]
			)
		).toBe(true);
	});

	it('registers mine.item and screen slots when loaded', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(createHolidayPlugin());

		const item = engine.slots.getSlotItem('mine.item', 'holiday-calendar');
		expect(item).toBeDefined();
		expect(item?.sectionId).toBe('data-sync');
		expect(item?.href).toBe('/plugins/tool-calendar-holidays');

		const screen = engine.slots.getSlotItem('shell.route.screen', 'tool-calendar-holidays');
		expect(screen).toBeDefined();

		handle.dispose();
		expect(engine.slots.getSlotItem('mine.item', 'holiday-calendar')).toBeUndefined();
		engine.dispose();
	});

	it('auto-syncs holidays on apply when not yet synced', async () => {
		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			}
		});

		const httpRequest = vi.fn(async () => ({
			ok: true,
			status: 200,
			statusText: 'OK',
			headers: {},
			text: async () => '',
			json: async () => ({
				year: 2026,
				papers: ['https://example.com/paper'],
				days: [{ date: '2026-10-01', name: '国庆节', isOffDay: true }]
			}),
			bytes: async () => new Uint8Array()
		}));

		const { env, timetables } = createMockEnv({
			http: { request: httpRequest as IHttpService['request'] }
		});
		timetables.set(timetable.id, timetable);

		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.switchTimetable(timetable.id);

		const handle = await engine.loadPlugin(createHolidayPlugin());

		expect(httpRequest).toHaveBeenCalled();
		const saved = timetables.get('t1');
		expect(saved?.academicConfig.holidayCalendar).toEqual(
			expect.objectContaining({
				holidays: [{ date: '2026-10-01', label: '国庆节' }],
				syncedAt: expect.any(Number),
				syncedYears: [2026]
			})
		);

		handle.dispose();
		engine.dispose();
	});

	it('skips network sync when holiday data already covers required years', async () => {
		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [],
				holidayCalendar: {
					holidays: [{ date: '2026-10-01', label: '国庆节' }],
					syncedAt: 1,
					syncedYears: [2026]
				}
			}
		});

		const httpRequest = vi.fn();
		const { env, timetables } = createMockEnv({
			http: { request: httpRequest as IHttpService['request'] }
		});
		timetables.set(timetable.id, timetable);

		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.switchTimetable(timetable.id);

		const handle = await engine.loadPlugin(createHolidayPlugin());

		expect(httpRequest).not.toHaveBeenCalled();

		handle.dispose();
		engine.dispose();
	});

	it('force sync still fetches when holiday data already exists', async () => {
		const timetable = createTimetable({
			id: 't1',
			name: '测试课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [],
				holidayCalendar: {
					holidays: [{ date: '2026-10-01', label: '国庆节' }],
					syncedAt: 1,
					syncedYears: [2026]
				}
			}
		});

		const httpRequest = vi.fn(async () => ({
			ok: true,
			status: 200,
			statusText: 'OK',
			headers: {},
			text: async () => '',
			json: async () => ({
				year: 2026,
				papers: [],
				days: [{ date: '2026-10-02', name: '国庆节', isOffDay: true }]
			}),
			bytes: async () => new Uint8Array()
		}));

		const { env, timetables } = createMockEnv({
			http: { request: httpRequest as IHttpService['request'] }
		});
		timetables.set(timetable.id, timetable);

		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.switchTimetable(timetable.id);

		const ctx = {
			get state() {
				return engine.state;
			},
			actions: engine.actions,
			service: engine['services'].get.bind(engine['services'])
		} as unknown as ChronosContext;

		await syncHolidayCalendarFromHolidayCn(ctx, { force: true });

		expect(httpRequest).toHaveBeenCalled();
		expect(timetables.get('t1')?.academicConfig.holidayCalendar?.holidays).toEqual([
			{ date: '2026-10-02', label: '国庆节' }
		]);

		engine.dispose();
	});

	it('writes holiday data to the timetable that started sync after switching away', async () => {
		const academicConfig = {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: [] as { index: number; startTime: string; endTime: string }[]
		};
		const t1 = createTimetable({ id: 't1', name: '课表一', academicConfig });
		const t2 = createTimetable({ id: 't2', name: '课表二', academicConfig });

		let resumeFetch!: () => void;
		const fetchGate = new Promise<void>((resolve) => {
			resumeFetch = resolve;
		});

		const httpRequest = vi.fn(async () => {
			await fetchGate;
			return {
				ok: true,
				status: 200,
				statusText: 'OK',
				headers: {},
				text: async () => '',
				json: async () => ({
					year: 2026,
					papers: [],
					days: [{ date: '2026-10-01', name: '国庆节', isOffDay: true }]
				}),
				bytes: async () => new Uint8Array()
			};
		});

		const { env, timetables } = createMockEnv({
			http: { request: httpRequest as IHttpService['request'] }
		});
		timetables.set(t1.id, t1);
		timetables.set(t2.id, t2);

		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.switchTimetable(t1.id);

		const ctx = {
			get state() {
				return engine.state;
			},
			actions: engine.actions,
			service: engine['services'].get.bind(engine['services'])
		} as unknown as ChronosContext;

		const syncPromise = syncHolidayCalendarFromHolidayCn(ctx);
		await engine.switchTimetable(t2.id);
		resumeFetch();
		await syncPromise;

		expect(timetables.get('t1')?.academicConfig.holidayCalendar).toEqual(
			expect.objectContaining({
				holidays: [{ date: '2026-10-01', label: '国庆节' }]
			})
		);
		expect(timetables.get('t2')?.academicConfig.holidayCalendar).toBeUndefined();

		engine.dispose();
	});

	it('unload does not clear holiday data (silent bundle reload must preserve sync state)', async () => {
		const academicConfig = {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: [] as { index: number; startTime: string; endTime: string }[],
			holidayCalendar: {
				holidays: [{ date: '2026-10-01', label: '国庆节' }],
				syncedAt: 1,
				syncedYears: [2026]
			}
		};
		const t1 = createTimetable({ id: 't1', name: '课表一', academicConfig });
		const t2 = createTimetable({
			id: 't2',
			name: '课表二',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			}
		});

		const { env, timetables } = createMockEnv();
		timetables.set(t1.id, t1);
		timetables.set(t2.id, t2);

		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.switchTimetable(t1.id);

		await engine.loadPlugin(createHolidayPlugin());
		await engine.unloadPlugin('tool-calendar-holidays');

		expect(timetables.get('t1')?.academicConfig.holidayCalendar).toEqual(
			academicConfig.holidayCalendar
		);
		expect(timetables.get('t2')?.academicConfig.holidayCalendar).toBeUndefined();

		engine.dispose();
	});
});
