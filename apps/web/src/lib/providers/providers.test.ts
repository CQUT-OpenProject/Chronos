import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	DexieStorageProvider,
	WebAuthnVaultProvider,
	MemoryVaultProvider,
	WebHttpProxyProvider,
	CqutOnlineHttpAdapter,
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

	it('DexieStorageProvider maps legacy preference keys', async () => {
		localStorage.setItem('chronos_preferences:theme_mode', 'system');
		localStorage.setItem('chronos_preferences:timetable_layout_mode', 'fit');
		localStorage.setItem('chronos_preferences:palette_mode', 'random');
		localStorage.setItem('chronos_preferences:capsule_corner_style', 'merge');
		const storage = new DexieStorageProvider(db, localStorage);
		const prefs = await storage.getPreferences();
		expect(prefs.themeMode).toBe('auto');
		expect(prefs.timetableLayoutMode).toBe('compact');
		expect(prefs.paletteMode).toBe('vibrant');
		expect(prefs.capsuleCornerStyle).toBe('pill');
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

	it('MemoryVaultProvider round-trips secrets', async () => {
		const vault = new MemoryVaultProvider();
		await vault.storeSecret('api-token', 'sec-999');
		expect(await vault.getSecret('api-token')).toBe('sec-999');
		await vault.removeSecret('api-token');
		expect(await vault.getSecret('api-token')).toBeNull();
	});

	it('WebAuthnVaultProvider does not persist plaintext secrets', async () => {
		const vault = new WebAuthnVaultProvider(localStorage, {
			isSupported: async () => false
		});
		await expect(vault.storeSecret('api-token', 'sec-999')).rejects.toThrow(
			'WebAuthn PRF vault is not available'
		);
		expect(localStorage.getItem('chronos_vault:api-token')).toBeNull();
		expect(localStorage.getItem('chronos_vault_enc:api-token')).toBeNull();
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

	it('CqutOnlineHttpAdapter unwraps preview API envelope for cqut.edu.cn requests', async () => {
		const inner = new WebHttpProxyProvider();
		const adapter = new CqutOnlineHttpAdapter(inner);
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

		const response = await adapter.request('https://authserver.cqut.edu.cn/authserver/login', {
			method: 'POST',
			bypassCors: true,
			body: 'username=stu001&password=pass123'
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/cqut/preview',
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ account: 'stu001', password: 'pass123' })
			})
		);
		const json = await response.json();
		expect(json).toEqual(fetchPayload);
		vi.unstubAllGlobals();
	});

	it('CqutOnlineHttpAdapter extracts credentials from JSON body', async () => {
		const inner = new WebHttpProxyProvider();
		const adapter = new CqutOnlineHttpAdapter(inner);
		const fetchMock = vi.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => ({ ok: true, payload: {} })
		}));
		vi.stubGlobal('window', {});
		vi.stubGlobal('fetch', fetchMock);

		await adapter.request('https://uis.cqut.edu.cn/api', {
			method: 'POST',
			bypassCors: true,
			body: JSON.stringify({ username: 'json-user', password: 'json-pass' })
		});

		expect(fetchMock).toHaveBeenCalledWith(
			'/api/cqut/preview',
			expect.objectContaining({
				body: JSON.stringify({ account: 'json-user', password: 'json-pass' })
			})
		);
		vi.unstubAllGlobals();
	});

	it('createWebProviders instantiates all web providers', () => {
		const providers = createWebProviders({ database: db, localStorage, enableCqutProxy: true });
		expect(providers.storage).toBeInstanceOf(DexieStorageProvider);
		expect(providers.vault).toBeInstanceOf(WebAuthnVaultProvider);
		expect(providers.http).toBeInstanceOf(CqutOnlineHttpAdapter);
		expect(providers.runtime).toBeInstanceOf(WebRuntimeProvider);
		expect(providers.analytics).toBeInstanceOf(WebAnalyticsProvider);
	});

	it('createWebProviders uses plain HTTP when CQUT proxy disabled', () => {
		const providers = createWebProviders({ database: db, localStorage, enableCqutProxy: false });
		expect(providers.http).toBeInstanceOf(WebHttpProxyProvider);
		expect(providers.http).not.toBeInstanceOf(CqutOnlineHttpAdapter);
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
