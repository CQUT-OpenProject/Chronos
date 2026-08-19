import { describe, it, expect, beforeEach, vi } from 'vite-plus/test';
import { createWebChronosEnv } from './web-env';
import { createCourse, createTimetable } from '@chronos/core';
import type {
	ChronosDB,
	CourseRow,
	PluginDataRow,
	TimetableRow,
	WallpaperRow
} from '$lib/storage/db';

class MockLocalStorage implements Storage {
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
	const wallpapersMap = new Map<string, WallpaperRow>();
	const pluginDataMap = new Map<string, PluginDataRow>();

	const mockTimetables = {
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
		}))
	};

	const mockCourses = {
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
			})
		})),
		bulkPut: vi.fn(async (rows: CourseRow[]) => {
			for (const r of rows) coursesMap.set(r.id, r);
		}),
		bulkDelete: vi.fn(async (ids: string[]) => {
			for (const id of ids) coursesMap.delete(id);
		})
	};

	const mockWallpapers = {
		get: vi.fn(async (id: string) => wallpapersMap.get(id) ?? undefined),
		put: vi.fn(async (row: WallpaperRow) => {
			wallpapersMap.set(row.id, row);
			return row.id;
		}),
		delete: vi.fn(async (id: string) => {
			wallpapersMap.delete(id);
		})
	};

	const mockPluginData = {
		get: vi.fn(async (id: string) => pluginDataMap.get(id) ?? undefined),
		put: vi.fn(async (row: PluginDataRow) => {
			pluginDataMap.set(row.id, row);
			return row.id;
		}),
		delete: vi.fn(async (id: string) => {
			pluginDataMap.delete(id);
		})
	};

	return {
		timetables: mockTimetables,
		courses: mockCourses,
		wallpapers: mockWallpapers,
		pluginData: mockPluginData,
		transaction: vi.fn(async (_mode: string, ...args: unknown[]) => {
			const fn = args[args.length - 1] as () => Promise<void>;
			return fn();
		})
	} as unknown as ChronosDB;
}

describe('WebChronosEnv', () => {
	let testDb: ChronosDB;
	let mockStorage: MockLocalStorage;

	beforeEach(() => {
		testDb = createMockDb();
		mockStorage = new MockLocalStorage();
	});

	it('provides platform: web and runtime capabilities', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });
		expect(env.platform).toBe('web');

		const encoded = env.runtime.encodeUtf8('你好 Chronos');
		expect(encoded).toBeInstanceOf(Uint8Array);
		expect(env.runtime.decodeUtf8(encoded)).toBe('你好 Chronos');

		const hash = await env.runtime.sha256('hello');
		expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
	});

	it('persists and retrieves timetables, courses, and summaries', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });

		const course = createCourse({
			id: 'c1',
			name: '数据结构',
			teacher: '李老师',
			location: '弘远楼A101',
			dayOfWeek: 3,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 2, 3]
		});

		const timetable = createTimetable({
			id: 't1',
			name: '计算机大二课表',
			courses: [course]
		});

		await env.storage.saveTimetable(timetable);

		const retrieved = await env.storage.getTimetable('t1');
		expect(retrieved).toBeDefined();
		expect(retrieved?.name).toBe('计算机大二课表');
		expect(retrieved?.courses.length).toBe(1);
		expect(retrieved?.courses[0]!.name).toBe('数据结构');

		const list = await env.storage.listTimetables();
		expect(list.length).toBe(1);
		expect(list[0]!.id).toBe('t1');

		await env.storage.patchTimetable('t1', { name: '已重命名课表' });
		const patched = await env.storage.getTimetable('t1');
		expect(patched?.name).toBe('已重命名课表');

		await env.storage.deleteTimetable('t1');
		expect(await env.storage.getTimetable('t1')).toBeNull();
		expect((await env.storage.listTimetables()).length).toBe(0);
	});

	it('reads and updates user preferences and active timetable ID', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });

		const initialPrefs = await env.storage.getPreferences();
		expect(initialPrefs.themeMode).toBe('auto');

		await env.storage.savePreferences({ themeMode: 'dark', timetableLayoutMode: 'compact' });
		const updatedPrefs = await env.storage.getPreferences();
		expect(updatedPrefs.themeMode).toBe('dark');
		expect(updatedPrefs.timetableLayoutMode).toBe('compact');

		await env.storage.setActiveTimetableId('tt_active');
		expect(await env.storage.getActiveTimetableId()).toBe('tt_active');
	});

	it('handles wallpaper Uint8Array persistence', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });

		expect(await env.storage.getWallpaper?.()).toBeNull();

		const wallpaperData = new Uint8Array([1, 2, 3, 4, 5]);
		await env.storage.setWallpaper?.(wallpaperData);

		const retrieved = await env.storage.getWallpaper?.();
		expect(retrieved).toBeDefined();
		expect(Array.from(retrieved!)).toEqual([1, 2, 3, 4, 5]);

		await env.storage.setWallpaper?.(null);
		expect(await env.storage.getWallpaper?.()).toBeNull();
	});

	it('stores and isolates plugin KV data in Dexie', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });

		await env.storage.setPluginData('cqut-plugin', 'token', { token: 'abc-123' });
		const data = await env.storage.getPluginData<{ token: string }>('cqut-plugin', 'token');
		expect(data).toEqual({ token: 'abc-123' });

		await env.storage.deletePluginData('cqut-plugin', 'token');
		expect(await env.storage.getPluginData('cqut-plugin', 'token')).toBeNull();
	});

	it('notifies storage changes via onChanged', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });
		const listener = vi.fn();

		const sub = env.storage.onChanged!(listener);

		await env.storage.savePreferences({ themeMode: 'light' });
		expect(listener).toHaveBeenCalledWith({ type: 'preferences', key: 'preferences' });

		sub.dispose();
		await env.storage.savePreferences({ themeMode: 'dark' });
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it('handles vault secrets storage', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });

		await env.vault.storeSecret('api_token', 'secret123');
		expect(await env.vault.getSecret('api_token')).toBe('secret123');

		await env.vault.removeSecret('api_token');
		expect(await env.vault.getSecret('api_token')).toBeNull();
	});

	it('handles HTTP requests with HttpResponse abstraction', async () => {
		const env = createWebChronosEnv({ database: testDb, localStorage: mockStorage });

		const mockResponse = new Response(JSON.stringify({ status: 'ok' }), {
			status: 200,
			statusText: 'OK',
			headers: { 'Content-Type': 'application/json' }
		});

		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse);

		const response = await env.http.request('https://api.example.com/data', {
			method: 'POST',
			headers: { Authorization: 'Bearer test' },
			body: JSON.stringify({ ping: true })
		});

		expect(response.ok).toBe(true);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: 'ok' });

		fetchSpy.mockRestore();
	});
});
