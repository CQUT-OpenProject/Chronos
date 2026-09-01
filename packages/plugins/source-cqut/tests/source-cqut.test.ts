import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	ImportSlotError,
	type ChronosEnv,
	type HttpResponse,
	type Timetable,
	type UserPreferences
} from '@chronos/core';
import { cqutPlugin, parseCqutScheduleData, CQUT_DEFAULT_CAMPUS_PERIOD_TIMES } from '../src/index';
import { SOURCE_CQUT_MESSAGES } from '../src/messages';

const t = (key: string) =>
	SOURCE_CQUT_MESSAGES['zh-cn'][key as keyof (typeof SOURCE_CQUT_MESSAGES)['zh-cn']];

function createMockEnv(httpResponse?: HttpResponse): ChronosEnv {
	const timetables = new Map<string, Timetable>();
	let activeId: string | null = null;
	const prefs: UserPreferences = {
		schemaVersion: 1,
		themeMode: 'auto',
		paletteMode: 'vibrant',
		timetableLayoutMode: 'fixed',
		capsuleCornerStyle: 'rounded',
		hapticFeedbackEnabled: true
	};
	const pluginData = new Map<string, unknown>();

	const defaultResponse: HttpResponse = {
		status: 200,
		statusText: 'OK',
		ok: true,
		headers: {},
		text: async () => JSON.stringify({ studentName: '张三' }),
		json: async <T = unknown>() =>
			({
				studentName: '张三',
				campusId: 'huaxi',
				campusPeriodTimes: {
					huaxi: [{ index: 1, startTime: '08:30', endTime: '09:15' }]
				},
				payload: {
					yearTerm: '2024-2025-2',
					weekNum: '1',
					termStartDate: '2025-02-24',
					weekDayList: [{ weekDay: '1', weekDate: '02/24' }],
					eventList: [
						{
							eventName: '高等数学',
							memberName: '李老师',
							address: '一教101',
							weekDay: '1',
							sessionStart: '1',
							sessionList: ['1', '2'],
							weekList: ['1', '2', '3']
						}
					]
				}
			}) as T,
		bytes: async () => new Uint8Array()
	};

	return {
		platform: 'web',
		http: {
			request: vi.fn(async () => httpResponse ?? defaultResponse),
			proxy: vi.fn(async () => httpResponse ?? defaultResponse)
		},
		storage: {
			getTimetable: vi.fn(async (id: string) => timetables.get(id) ?? null),
			listTimetables: vi.fn(async () => []),
			saveTimetable: vi.fn(async () => {}),
			deleteTimetable: vi.fn(async () => {}),
			getActiveTimetableId: vi.fn(async () => activeId),
			setActiveTimetableId: vi.fn(async (id: string) => {
				activeId = id;
			}),
			queryCourses: vi.fn(async () => []),
			getPreferences: vi.fn(async (): Promise<UserPreferences> => ({ ...prefs })),
			savePreferences: vi.fn(async () => {}),
			getPluginData: vi.fn(async (pId: string, k: string) => {
				const val = pluginData.get(`${pId}:${k}`);
				return val !== undefined ? (val as never) : null;
			}),
			setPluginData: vi.fn(async <T>(pId: string, k: string, v: T) => {
				pluginData.set(`${pId}:${k}`, v);
			}),
			deletePluginData: vi.fn(async (pId: string, k: string) => {
				pluginData.delete(`${pId}:${k}`);
			})
		},
		vault: {
			isSupported: vi.fn(async () => true),
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => null),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			sha256: vi.fn(async () => 'hash')
		}
	};
}

describe('cqutPlugin', () => {
	it('owns the ten-period campus clocks used by web', () => {
		expect(CQUT_DEFAULT_CAMPUS_PERIOD_TIMES.huaxi).toHaveLength(10);
		expect(CQUT_DEFAULT_CAMPUS_PERIOD_TIMES.liangjiang).toHaveLength(10);
		expect(CQUT_DEFAULT_CAMPUS_PERIOD_TIMES.huaxi[0]?.startTime).toBe('08:20');
		expect(CQUT_DEFAULT_CAMPUS_PERIOD_TIMES.liangjiang[4]?.startTime).toBe('14:20');
	});
	it('registers import.source.tab slot and executes import', async () => {
		const env = createMockEnv();
		const notifications: string[] = [];
		const engine = new ChronosEngine({
			env,
			onNotification: (msg: string) => {
				notifications.push(msg);
			}
		});
		await engine.init();

		const handle = await engine.loadPlugin(cqutPlugin);
		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'cqut-online');
		expect(sourceSlot).toBeDefined();
		expect(sourceSlot?.inputSchema).toBeDefined();

		const ctx = engine.getPluginContext('source-cqut');
		const timetable = await sourceSlot!.executeImport(
			{
				username: '123456',
				password: 'password'
			},
			ctx
		);

		// eslint-disable-next-line typescript/unbound-method -- 断言对象即 mock 本身，无 this 依赖
		expect(env.http.proxy).toHaveBeenCalledWith(
			'source-cqut',
			'preview',
			expect.objectContaining({
				account: '123456',
				password: 'password'
			})
		);
		expect(timetable.name).toBe('123456的课表');
		expect(timetable.courses.length).toBe(1);
		expect(timetable.courses[0]?.name).toBe('高等数学');
		expect(timetable.importMetadata?.source).toBe('cqut-online');
		expect(timetable.importMetadata?.campusId).toBe('huaxi');
		expect(timetable.customMetadata?.['source-cqut']).toBeDefined();

		handle.dispose();
		expect(engine.slots.getSlotItem('import.source.tab', 'cqut-online')).toBeUndefined();
	});

	it('executes import with adapter-unwrapped online schedule payload', async () => {
		const adapterPayload = {
			campusId: 'huaxi',
			campusPeriodTimes: {
				huaxi: [{ index: 1, startTime: '08:30', endTime: '09:15' }]
			},
			payload: {
				yearTerm: '2025-2026-2',
				weekNum: '1',
				termStartDate: null,
				weekDayList: [{ weekDay: '1', weekDate: '03/02' }],
				eventList: [
					{
						eventName: '高等数学A',
						memberName: '王教授',
						address: '花溪校区 第三教学楼301',
						weekDay: '1',
						sessionStart: '1',
						sessionLast: '2',
						weekList: ['1', '2', '3', '4']
					}
				]
			}
		};
		const httpResponse: HttpResponse = {
			status: 200,
			statusText: 'OK',
			ok: true,
			headers: {},
			text: async () => JSON.stringify(adapterPayload),
			json: async <T = unknown>() => adapterPayload as T,
			bytes: async () => new Uint8Array()
		};
		const env = createMockEnv(httpResponse);
		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.loadPlugin(cqutPlugin);

		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'cqut-online')!;
		const ctx = engine.getPluginContext('source-cqut');
		const timetable = await sourceSlot.executeImport(
			{ username: '2024002', password: 'secret' },
			ctx
		);

		expect(timetable.courses.length).toBe(1);
		expect(timetable.courses[0]?.name).toBe('高等数学A');
		expect(timetable.academicConfig.termStartDate).toBe('2026-03-02');
		expect(timetable.importMetadata?.source).toBe('cqut-online');
		expect(timetable.importMetadata?.campusId).toBe('huaxi');
	});

	it('throws error when credentials missing', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.loadPlugin(cqutPlugin);

		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'cqut-online')!;
		const ctx = engine.getPluginContext('source-cqut');
		await expect(sourceSlot.executeImport({}, ctx)).rejects.toBeInstanceOf(ImportSlotError);
		await expect(sourceSlot.executeImport({}, ctx)).rejects.toMatchObject({
			kind: 'unsupported',
			message: '请输入学号与密码'
		});
	});

	it('parses CQUT server online schedule payload format', () => {
		const timetable = parseCqutScheduleData(
			{
				campusId: 'huaxi',
				campusPeriodTimes: {
					huaxi: [{ index: 1, startTime: '08:30', endTime: '09:15' }]
				},
				payload: {
					yearTerm: '2025-2026-2',
					weekNum: '1',
					termStartDate: null,
					weekDayList: [{ weekDay: '1', weekDate: '03/02' }],
					eventList: [
						{
							eventName: '高等数学A',
							memberName: '王教授',
							address: '花溪校区 第三教学楼301',
							weekDay: '1',
							sessionStart: '1',
							sessionLast: '2',
							weekList: ['1', '2', '3', '4']
						}
					]
				}
			},
			'2024002',
			'liangjiang',
			t
		);

		expect(timetable.name).toBe('2024002的课表');
		expect(timetable.academicConfig.termStartDate).toBe('2026-03-02');
		expect(timetable.courses.length).toBe(1);
		expect(timetable.courses[0]?.name).toBe('高等数学A');
		expect(timetable.courses[0]?.teacher).toBe('王教授');
		expect(timetable.courses[0]?.location).toBe('花溪校区 第三教学楼301');
		expect(timetable.courses[0]?.dayOfWeek).toBe(1);
		expect(timetable.courses[0]?.startPeriod).toBe(1);
		expect(timetable.courses[0]?.endPeriod).toBe(2);
		expect(timetable.courses[0]?.weeks).toEqual([1, 2, 3, 4]);
		expect(timetable.viewPrefs.showSaturday).toBe(false);
		expect(timetable.viewPrefs.showSunday).toBe(false);
	});

	it('skips cqut-online slot when disabledSlots includes it', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin({
			...cqutPlugin,
			defaultConfig: { disabledSlots: ['cqut-online'] }
		});

		expect(engine.slots.getSlotItem('import.source.tab', 'cqut-online')).toBeUndefined();
		expect(engine.slots.getSlotItem('import.source.tab', 'edu-html')).toBeDefined();
		const eduHtmlSlot = engine.slots.getSlotItem('import.source.tab', 'edu-html');
		expect(eduHtmlSlot?.confirmSchema).toBeDefined();
		expect(typeof eduHtmlSlot?.finalizePreview).toBe('function');

		handle.dispose();
	});
});
