import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	type ChronosEnv,
	type HttpResponse,
	type Timetable,
	type UserPreferences
} from '@chronos/core';
import { cqutPlugin, parseCqutScheduleData, type CqutCampusScheduleMetadata } from '../src/index';

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
				termName: '2024-2025-2',
				termStartDate: '2025-02-24',
				campusId: 'huaxi',
				campusPeriodTimes: {
					huaxi: [{ index: 1, startTime: '08:30', endTime: '09:15' }]
				},
				courses: [
					{
						courseName: '高等数学',
						teacherName: '李老师',
						roomName: '一教101',
						dayOfWeek: 1,
						startPeriod: 1,
						endPeriod: 2,
						weeks: [1, 2, 3]
					}
				]
			}) as T,
		bytes: async () => new Uint8Array()
	};

	return {
		platform: 'web',
		http: {
			request: vi.fn(async () => httpResponse ?? defaultResponse)
		},
		storage: {
			getTimetable: vi.fn(async (id: string) => timetables.get(id) ?? null),
			listTimetables: vi.fn(async () => []),
			saveTimetable: vi.fn(async () => {}),
			patchTimetable: vi.fn(async () => {}),
			deleteTimetable: vi.fn(async () => {}),
			getActiveTimetableId: vi.fn(async () => activeId),
			setActiveTimetableId: vi.fn(async (id: string) => {
				activeId = id;
			}),
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
			setTimeout: vi.fn((cb: () => void) => setTimeout(() => cb(), 0) as unknown as number),
			clearTimeout: vi.fn((id: number) => clearTimeout(id)),
			sha256: vi.fn(async () => 'hash'),
			encodeUtf8: vi.fn((s: string) => new TextEncoder().encode(s)),
			decodeUtf8: vi.fn((b: Uint8Array) => new TextDecoder().decode(b))
		}
	};
}

describe('cqutPlugin', () => {
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
				password: 'password',
				campusId: 'huaxi'
			},
			ctx
		);

		expect(timetable.name).toBe('张三的课表');
		expect(timetable.courses.length).toBe(1);
		expect(timetable.courses[0]?.name).toBe('高等数学');
		expect(timetable.customMetadata?.['source-cqut']).toBeDefined();

		handle.dispose();
		expect(engine.slots.getSlotItem('import.source.tab', 'cqut-online')).toBeUndefined();
	});

	it('throws error when credentials missing', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		await engine.loadPlugin(cqutPlugin);

		const sourceSlot = engine.slots.getSlotItem('import.source.tab', 'cqut-online')!;
		const ctx = engine.getPluginContext('source-cqut');
		await expect(sourceSlot.executeImport({}, ctx)).rejects.toThrow('请输入学号与密码');
	});

	it('parses CQUT schedule data correctly', () => {
		const timetable = parseCqutScheduleData(
			{
				studentName: '李四',
				termName: '2024-2025-1',
				termStartDate: '2024-09-01',
				campusId: 'liangjiang',
				campusPeriodTimes: {
					liangjiang: [{ index: 1, startTime: '09:00', endTime: '09:45' }]
				},
				courses: [
					{
						courseName: '大学英语',
						dayOfWeek: 2,
						startPeriod: 3,
						endPeriod: 4,
						weeks: [1, 2, 3, 4]
					}
				]
			},
			'2024001'
		);

		expect(timetable.name).toBe('李四的课表');
		expect(timetable.academicConfig.periodTimes[0]?.startTime).toBe('09:00');
		expect(timetable.courses[0]?.name).toBe('大学英语');
		const metadata = timetable.customMetadata?.['source-cqut'] as
			| CqutCampusScheduleMetadata
			| undefined;
		expect(metadata?.studentId).toBe('2024001');
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
			'2024002'
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
	});
});
