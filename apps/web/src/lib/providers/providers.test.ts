import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	DexieStorageProvider,
	WebHttpProxyProvider,
	PluginProxyHttpAdapter,
	WebRuntimeProvider,
	WebAnalyticsProvider,
	createWebProviders
} from './index';
import { createCourse, createTimetable } from '@chronos/core';
import type { ChronosDB, CourseRow, PluginDataRow, TimetableRow } from '$lib/storage/db';

class MockStorage implements Storage {
	private map = new Map<string, string>();
	get length(): number {
		return this.map.size;
	}
	clear(): void {
		this.map.clear();
	}
	getItem(key: string): string | null {
		return this.map.get(key) ?? null;
	}
	key(index: number): string | null {
		return Array.from(this.map.keys())[index] ?? null;
	}
	removeItem(key: string): void {
		this.map.delete(key);
	}
	setItem(key: string, value: string): void {
		this.map.set(key, value);
	}
}

function createMockDb(): ChronosDB {
	const timetablesMap = new Map<string, TimetableRow>();
	const coursesMap = new Map<string, CourseRow>();
	const pluginDataMap = new Map<string, PluginDataRow>();

	return {
		timetables: {
			get: vi.fn(async (id: string) => timetablesMap.get(id) ?? undefined),
			put: vi.fn(async (row: TimetableRow) => {
				timetablesMap.set(row.id, row);
				return row.id;
			}),
			delete: vi.fn(async (id: string) => {
				timetablesMap.delete(id);
			}),
			orderBy: vi.fn(() => ({
				reverse: () => ({
					toArray: async () =>
						Array.from(timetablesMap.values()).sort((a, b) => b.updatedAt - a.updatedAt)
				})
			})),
			toArray: async () => Array.from(timetablesMap.values())
		},
		courses: {
			where: vi.fn((_field: string) => ({
				equals: (val: unknown) => ({
					toArray: async () => Array.from(coursesMap.values()).filter((c) => c.timetableId === val),
					primaryKeys: async () =>
						Array.from(coursesMap.values())
							.filter((c) => c.timetableId === val)
							.map((c) => c.id),
					delete: async () => {
						for (const [id, c] of Array.from(coursesMap.entries())) {
							if (c.timetableId === val) coursesMap.delete(id);
						}
					}
				}),
				anyOf: (vals: unknown[]) => ({
					toArray: async () =>
						Array.from(coursesMap.values()).filter((c) =>
							(vals as string[]).includes(c.timetableId)
						)
				})
			})),
			toArray: async () => Array.from(coursesMap.values()),
			bulkPut: vi.fn(async (rows: CourseRow[]) => {
				for (const r of rows) coursesMap.set(r.id, r);
			}),
			bulkDelete: vi.fn(async (ids: string[]) => {
				for (const id of ids) coursesMap.delete(id);
			})
		},
		pluginData: {
			get: vi.fn(async (id: string) => pluginDataMap.get(id) ?? undefined),
			put: vi.fn(async (row: PluginDataRow) => {
				pluginDataMap.set(row.id, row);
				return row.id;
			}),
			delete: vi.fn(async (id: string) => {
				pluginDataMap.delete(id);
			})
		},
		transaction: vi.fn(async (_mode: string, ...args: unknown[]) => {
			const fn = args[args.length - 1] as () => Promise<void>;
			return fn();
		})
	} as unknown as ChronosDB;
}

describe('Web Providers', () => {
	let db: ChronosDB;
	let localStorage: MockStorage;

	beforeEach(() => {
		db = createMockDb();
		localStorage = new MockStorage();
	});

	it('DexieStorageProvider preserves timetableLayoutMode on partial preferences update', async () => {
		const storage = new DexieStorageProvider(db, localStorage);
		await storage.savePreferences({ timetableLayoutMode: 'compact' });
		expect((await storage.getPreferences()).timetableLayoutMode).toBe('compact');

		// Partial update of another preference should not reset layout mode
		await storage.savePreferences({ themeMode: 'dark' });
		const prefs = await storage.getPreferences();
		expect(prefs.themeMode).toBe('dark');
		expect(prefs.timetableLayoutMode).toBe('compact');
	});

	it('DexieStorageProvider persists locale preference', async () => {
		const storage = new DexieStorageProvider(db, localStorage);
		await storage.savePreferences({ locale: 'en' });
		expect((await storage.getPreferences()).locale).toBe('en');
	});

	it('DexieStorageProvider persists timetables, courses, and plugin data', async () => {
		const storage = new DexieStorageProvider(db, localStorage);

		const course = createCourse({
			id: 'c101',
			name: '计算机系统结构',
			dayOfWeek: 2,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [1, 2, 3, 4]
		});

		const timetable = createTimetable({
			id: 'tt_test',
			name: '测试课表',
			courses: [course]
		});

		await storage.saveTimetable(timetable);

		const fetched = await storage.getTimetable('tt_test');
		expect(fetched).not.toBeNull();
		expect(fetched?.name).toBe('测试课表');
		expect(fetched?.courses.length).toBe(1);

		await storage.setPluginData('my-plugin', 'key1', { count: 42 });
		const pluginData = await storage.getPluginData<{ count: number }>('my-plugin', 'key1');
		expect(pluginData).toEqual({ count: 42 });

		await storage.deletePluginData('my-plugin', 'key1');
		expect(await storage.getPluginData('my-plugin', 'key1')).toBeNull();

		storage.dispose();
	});

	it('DexieStorageProvider queryCourses returns cross-timetable hits in one call', async () => {
		const storage = new DexieStorageProvider(db, localStorage);

		const courseA = createCourse({
			id: 'c-a',
			name: '数据结构',
			location: 'A101',
			dayOfWeek: 3,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1]
		});
		const courseB = createCourse({
			id: 'c-b',
			name: '操作系统',
			location: 'B202',
			dayOfWeek: 3,
			startPeriod: 3,
			endPeriod: 4,
			weeks: [1]
		});

		await storage.saveTimetable(
			createTimetable({ id: 'tt_a', name: '课表 A', courses: [courseA] })
		);
		await storage.saveTimetable(
			createTimetable({ id: 'tt_b', name: '课表 B', courses: [courseB] })
		);

		const hits = await storage.queryCourses({ dayOfWeek: 3, week: 1 });
		expect(hits).toHaveLength(2);
		expect(hits.map((h) => h.timetableId).sort()).toEqual(['tt_a', 'tt_b']);

		const roomHits = await storage.queryCourses({ location: { contains: 'A101' } });
		expect(roomHits).toHaveLength(1);
		expect(roomHits[0]?.course.name).toBe('数据结构');

		storage.dispose();
	});

	it('createWebProviders instantiates all web providers', () => {
		const providers = createWebProviders({ database: db, localStorage, enablePluginProxy: true });
		expect(providers.storage).toBeInstanceOf(DexieStorageProvider);
		expect(providers.http).toBeInstanceOf(PluginProxyHttpAdapter);
		expect(providers.runtime).toBeInstanceOf(WebRuntimeProvider);
		expect(providers.analytics).toBeInstanceOf(WebAnalyticsProvider);
	});

	it('WebHttpProxyProvider enforces SSRF and domain whitelist protection', async () => {
		const http = new WebHttpProxyProvider(['allowed.example.com']);

		// SSRF attack: loopback
		await expect(http.request('http://127.0.0.1:8080/admin', { bypassCors: true })).rejects.toThrow(
			/SSRF Protection/
		);

		// SSRF attack: private IP
		await expect(http.request('http://192.168.1.1/gateway', { bypassCors: true })).rejects.toThrow(
			/SSRF Protection/
		);

		// Whitelist rejection
		await expect(
			http.request('https://evil.attacker.com/steal', { bypassCors: true })
		).rejects.toThrow(/not in the allowed proxy whitelist/);
	});

	it('WebRuntimeProvider supports sha256 hashing', async () => {
		const runtime = new WebRuntimeProvider();
		expect(runtime.platform).toBe('web');

		const hash = await runtime.sha256('Chronos');
		expect(hash).toBeDefined();
		expect(hash.length).toBe(64);
	});

	it('WebAnalyticsProvider routes events cleanly', () => {
		const analytics = new WebAnalyticsProvider();
		expect(() => {
			analytics.track('timetable_switch', { timetableId: 'tt_123' });
		}).not.toThrow();
	});

	it('PluginProxyHttpAdapter posts explicit proxy payloads', async () => {
		const inner = new WebHttpProxyProvider();
		const adapter = new PluginProxyHttpAdapter(inner);
		const fetchPayload = {
			payload: {
				eventList: [{ eventName: '测试课程' }]
			},
			campusId: 'huaxi',
			campusPeriodTimes: { huaxi: [] }
		};
		const fetchMock = vi.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => ({ ok: true, payload: fetchPayload })
		}));
		vi.stubGlobal('window', {});
		vi.stubGlobal('fetch', fetchMock);

		const response = await adapter.proxy!('source-cqut', 'preview', {
			account: 'stu001',
			password: 'pass123'
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/plugins/source-cqut/preview',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ account: 'stu001', password: 'pass123' })
			})
		);
		const json = await response.json();
		expect(json).toEqual(fetchPayload);
		vi.unstubAllGlobals();
	});

	it('createWebProviders uses plain HTTP when plugin proxy disabled', () => {
		const providers = createWebProviders({ database: db, localStorage, enablePluginProxy: false });
		expect(providers.http).toBeInstanceOf(WebHttpProxyProvider);
		expect(providers.http).not.toBeInstanceOf(PluginProxyHttpAdapter);
	});
});
