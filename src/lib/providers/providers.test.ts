import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	DexieStorageProvider,
	WebAuthnVaultProvider,
	WebHttpProxyProvider,
	WebRuntimeProvider,
	WebAnalyticsProvider,
	createWebProviders,
	registerWebProviders
} from './index';
import {
	createCourse,
	createTimetable,
	ServiceContainer,
	IStorageService,
	IVaultService,
	IHttpService,
	IRuntimeService,
	IAnalyticsService
} from '@chronos/core';
import type {
	ChronosDB,
	CourseRow,
	PluginDataRow,
	TimetableRow,
	WallpaperRow
} from '$lib/storage/db';

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
	const wallpapersMap = new Map<string, WallpaperRow>();
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
			}))
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
				})
			})),
			bulkPut: vi.fn(async (rows: CourseRow[]) => {
				for (const r of rows) coursesMap.set(r.id, r);
			}),
			bulkDelete: vi.fn(async (ids: string[]) => {
				for (const id of ids) coursesMap.delete(id);
			})
		},
		wallpapers: {
			get: vi.fn(async (id: string) => wallpapersMap.get(id) ?? undefined),
			put: vi.fn(async (row: WallpaperRow) => {
				wallpapersMap.set(row.id, row);
				return row.id;
			}),
			delete: vi.fn(async (id: string) => {
				wallpapersMap.delete(id);
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

	it('WebAuthnVaultProvider manages secrets', async () => {
		const vault = new WebAuthnVaultProvider(localStorage);
		expect(typeof (await vault.isSupported())).toBe('boolean');

		await vault.storeSecret('api-token', 'sec-999');
		expect(await vault.getSecret('api-token')).toBe('sec-999');

		await vault.removeSecret('api-token');
		expect(await vault.getSecret('api-token')).toBeNull();
	});

	it('WebHttpProxyProvider enforces SSRF and domain whitelist protection', async () => {
		const http = new WebHttpProxyProvider(['authserver.cqut.edu.cn', '*.cqut.edu.cn']);

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

	it('WebRuntimeProvider supports encoding, decoding, hashing, and timers', async () => {
		const runtime = new WebRuntimeProvider();
		expect(runtime.platform).toBe('web');

		const encoded = runtime.encodeUtf8('Chronos Runtime');
		expect(runtime.decodeUtf8(encoded)).toBe('Chronos Runtime');

		const hash = await runtime.sha256('Chronos');
		expect(hash).toBeDefined();
		expect(hash.length).toBe(64);

		let timerFired = false;
		const handle = runtime.setTimeout(() => {
			timerFired = true;
		}, 10);
		expect(handle).toBeDefined();
		runtime.clearTimeout(handle);
		expect(timerFired).toBe(false);
	});

	it('WebAnalyticsProvider routes events cleanly', () => {
		const analytics = new WebAnalyticsProvider();
		expect(() => {
			analytics.track('timetable_switch', { timetableId: 'tt_123' });
		}).not.toThrow();
	});

	it('createWebProviders instantiates all web providers', () => {
		const providers = createWebProviders({ database: db, localStorage });
		expect(providers.storage).toBeInstanceOf(DexieStorageProvider);
		expect(providers.vault).toBeInstanceOf(WebAuthnVaultProvider);
		expect(providers.http).toBeInstanceOf(WebHttpProxyProvider);
		expect(providers.runtime).toBeInstanceOf(WebRuntimeProvider);
		expect(providers.analytics).toBeInstanceOf(WebAnalyticsProvider);
	});

	it('registerWebProviders populates ServiceContainer correctly', () => {
		const container = new ServiceContainer();
		registerWebProviders(container, { database: db, localStorage });

		expect(container.has(IStorageService)).toBe(true);
		expect(container.has(IVaultService)).toBe(true);
		expect(container.has(IHttpService)).toBe(true);
		expect(container.has(IRuntimeService)).toBe(true);
		expect(container.has(IAnalyticsService)).toBe(true);
	});
});
