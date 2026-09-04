import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, createTimetable, type IHttpService } from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { createHolidayPlugin } from '../src/index';

describe('calendar-holidays reload regression', () => {
	it('bundle reload clears then re-syncs holidays without warn notification when sync succeeds', async () => {
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
				days: [{ date: '2026-10-01', name: '国庆节', isOffDay: true }]
			}),
			bytes: async () => new Uint8Array()
		}));

		const notifications: Array<{ message: string; type: string }> = [];
		const { env, timetables } = createMockEnv({
			http: { request: httpRequest as IHttpService['request'] }
		});
		timetables.set(timetable.id, timetable);

		const engine = new ChronosEngine({
			env,
			onNotification: (message, type) => notifications.push({ message, type })
		});
		await engine.init();
		await engine.switchTimetable(timetable.id);

		const plugin = createHolidayPlugin();
		await engine.loadPlugin(plugin);
		expect(httpRequest).not.toHaveBeenCalled();
		expect(notifications).toEqual([]);

		await engine.unloadPlugin('tool-calendar-holidays');
		expect(timetables.get('t1')?.academicConfig.holidayCalendar).toBeUndefined();

		await engine.loadPlugin(plugin);
		expect(httpRequest).toHaveBeenCalled();
		expect(timetables.get('t1')?.academicConfig.holidayCalendar?.holidays).toEqual([
			{ date: '2026-10-01', label: '国庆节' }
		]);
		expect(notifications.filter((n) => n.type === 'warn')).toEqual([]);

		engine.dispose();
	});
});
