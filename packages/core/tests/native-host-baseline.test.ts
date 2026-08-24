import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	createCourse,
	AcademicCalendarService,
	calculateTimetableGrid,
	placeCapsules,
	type ChronosEnv,
	type UserPreferences,
	type Timetable,
	type HttpResponse
} from '../src/index';
import { cqutPlugin } from '../../plugins/source-cqut/src/index';
import { shareCodecPlugin } from '../../plugins/codec-share/src/index';

/**
 * Native host environment factory (simulates environment capabilities injected by iOS Swift JSCore and Android Kotlin QuickJS).
 * Strictly guarantees zero DOM and zero browser global variable dependencies.
 */
function createNativeHostEnv(): ChronosEnv {
	const timetables = new Map<string, Timetable>();
	const pluginStorage = new Map<string, unknown>();
	let activeId: string | null = null;
	let preferences: UserPreferences = {
		schemaVersion: 1,
		themeMode: 'auto',
		paletteMode: 'vibrant',
		timetableLayoutMode: 'fixed',
		capsuleCornerStyle: 'rounded',
		hapticFeedbackEnabled: true
	};

	return {
		platform: 'ios', // or 'android'
		http: {
			request: vi.fn(async (url: string): Promise<HttpResponse> => ({
				status: 200,
				statusText: 'OK',
				headers: { 'Content-Type': 'application/json' },
				ok: true,
				text: async () => JSON.stringify({ ok: true, url }),
				json: async <T>() => ({ ok: true, url }) as T,
				bytes: async () => new Uint8Array([1, 2, 3])
			}))
		},
		storage: {
			getTimetable: async (id: string) => timetables.get(id) ?? null,
			listTimetables: async () =>
				Array.from(timetables.values()).map((t) => ({
					id: t.id,
					name: t.name,
					updatedAt: t.updatedAt
				})),
			saveTimetable: async (timetable: Timetable) => {
				timetables.set(timetable.id, timetable);
			},
			deleteTimetable: async (id: string) => {
				timetables.delete(id);
			},
			getActiveTimetableId: async () => activeId,
			setActiveTimetableId: async (id: string) => {
				activeId = id;
			},
			queryCourses: async () => [],
			getPreferences: async () => preferences,
			savePreferences: async (patch: Partial<UserPreferences>) => {
				preferences = { ...preferences, ...patch };
			},
			getPluginData: async <T>(_pluginId: string, key: string): Promise<T | null> => {
				return (pluginStorage.get(key) as T) ?? null;
			},
			setPluginData: async <T>(_pluginId: string, key: string, value: T) => {
				pluginStorage.set(key, value);
			},
			deletePluginData: async (_pluginId: string, key: string) => {
				pluginStorage.delete(key);
			}
		},
		vault: {
			isSupported: async () => true,
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => 'native-keychain-secret'),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			sha256: async (data: string | Uint8Array) => {
				const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
				const hashBuf = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
				return Array.from(new Uint8Array(hashBuf))
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
			}
		}
	};
}

describe('Native Host Baseline (iOS JSCore / Android QuickJS)', () => {
	it('executes full engine lifecycle and timetable operators without DOM or browser APIs', async () => {
		const env = createNativeHostEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		// 1. Create timetable
		const timetable = await engine.createTimetable('原生宿主课表', {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20
		});
		expect(timetable.id).toBeDefined();
		expect(timetable.name).toBe('原生宿主课表');

		// 2. Add course
		const course = createCourse({
			id: 'course-1',
			name: '高级移动应用开发',
			teacher: '王老师',
			location: '计算机楼A201',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 2, 3]
		});
		await engine.saveCourse(course);

		// 3. Geometry capsule operator and week calculation validation (pure algorithm)
		const calendar = new AcademicCalendarService();
		const currentWeek = calendar.calculateAcademicWeek('2026-03-02', timetable.academicConfig);
		expect(currentWeek).toBe(1);

		const grid = calculateTimetableGrid('2026-03-02', 1, engine.state.currentTimetable!);
		expect(grid.visibleDays.length).toBeGreaterThan(0);

		const capsules = placeCapsules({
			courseDisplayModels: [
				{
					course,
					isInDisplayedWeek: true
				}
			],
			visibleDays: grid.visibleDays,
			columnWidthPx: 80,
			expandedSlotKeys: new Set()
		});
		expect(capsules.length).toBe(1);

		// 4. Load official plugins in native host environment
		const shareHandle = await engine.loadPlugin(shareCodecPlugin);
		const cqutHandle = await engine.loadPlugin(cqutPlugin);

		expect(engine.slots.get('import.source.tab').length).toBeGreaterThanOrEqual(3);
		expect(engine.slots.get('export.action').length).toBeGreaterThanOrEqual(1);

		expect(engine.slots.getSlotItem('import.source.tab', 'share-link')).toBeDefined();
		expect(engine.slots.getSlotItem('import.source.tab', 'cqut-online')).toBeDefined();
		expect(engine.slots.getSlotItem('import.source.tab', 'edu-html')).toBeDefined();
		expect(engine.slots.getSlotItem('export.action', 'share-link')).toBeDefined();
		expect(engine.slots.getSlotItem('export.action', 'share-json')).toBeUndefined();

		// 5. Verify share-link export via standard slot
		const exportSlot = engine.slots.getSlotItem('export.action', 'share-link');
		expect(exportSlot).toBeDefined();
		const exported = await exportSlot!.export(engine.state.currentTimetable!);
		expect(exported.filename).toBe('share-link.txt');
		expect(exported.mimeType).toBe('application/x-chronos-share-link');
		expect(exported.content).toContain('原生宿主课表');

		// 6. Verify config update in native host environment
		const cqutCtx = engine.getPluginContext('source-cqut');
		await cqutCtx.updateConfig({ campusId: 'liangjiang' });
		expect(cqutCtx.config.campusId).toBe('liangjiang');

		shareHandle.dispose();
		cqutHandle.dispose();

		expect(engine.slots.get('import.source.tab').length).toBe(0);
		expect(engine.slots.get('export.action').length).toBe(0);

		engine.dispose();
	});

	it('interoperates seamlessly with NativeHostBridge protocol', async () => {
		const nativeStorage = new Map<string, Timetable>();
		const nativeCalls: Array<{ capability: string; method: string; params: unknown }> = [];

		const bridge: import('../src/index').NativeHostBridge = {
			async callNative<T = unknown, R = unknown>(
				capability: import('../src/index').NativeHostCapability,
				method: string,
				params?: T
			): Promise<R> {
				nativeCalls.push({ capability, method, params });
				const p = params as Record<string, unknown> | undefined;
				if (capability === 'storage') {
					if (method === 'getPreferences')
						return { schemaVersion: 1, themeMode: 'dark' } as unknown as R;
					if (method === 'savePreferences') return undefined as unknown as R;
					if (method === 'getActiveTimetableId') return null as unknown as R;
					if (method === 'listTimetables')
						return Array.from(nativeStorage.values()) as unknown as R;
					if (method === 'saveTimetable' && p) {
						const tt = p as unknown as Timetable;
						nativeStorage.set(tt.id, tt);
						return undefined as unknown as R;
					}
					if (method === 'getTimetable' && p && typeof p.id === 'string') {
						return (nativeStorage.get(p.id) ?? null) as unknown as R;
					}
					if (method === 'getPluginData') return null as unknown as R;
					if (method === 'setPluginData') return undefined as unknown as R;
				}
				if (capability === 'vault') {
					if (method === 'isSupported') return true as unknown as R;
					if (method === 'getSecret') return 'bridge-secret' as unknown as R;
				}
				return null as unknown as R;
			}
		};

		const env = (await import('../src/index')).createNativeHostEnv(bridge, 'ios');
		const engine = new ChronosEngine({ env });
		await engine.init();

		const tt = await engine.createTimetable('Bridge Timetable');
		expect(tt.name).toBe('Bridge Timetable');

		expect(
			nativeCalls.some((c) => c.capability === 'storage' && c.method === 'saveTimetable')
		).toBe(true);

		engine.dispose();
	});
});
