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
import { cqutPlugin } from '../../plugins/src/source-cqut/index';
import { htmlParserPlugin } from '../../plugins/src/parser-html/index';
import { shareCodecPlugin } from '../../plugins/src/codec-share/index';

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
			patchTimetable: async (id: string, patch: Partial<Timetable>) => {
				const existing = timetables.get(id);
				if (existing) {
					timetables.set(id, { ...existing, ...patch, updatedAt: Date.now() });
				}
			},
			deleteTimetable: async (id: string) => {
				timetables.delete(id);
			},
			getActiveTimetableId: async () => activeId,
			setActiveTimetableId: async (id: string) => {
				activeId = id;
			},
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
			setTimeout: (handler, timeoutMs) => setTimeout(handler, timeoutMs) as unknown as number,
			clearTimeout: (handle) => clearTimeout(handle),
			sha256: async (data: string | Uint8Array) => {
				const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
				const hashBuf = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
				return Array.from(new Uint8Array(hashBuf))
					.map((b) => b.toString(16).padStart(2, '0'))
					.join('');
			},
			encodeUtf8: (str) => new TextEncoder().encode(str),
			decodeUtf8: (bytes) => new TextDecoder().decode(bytes)
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
		const htmlHandle = await engine.loadPlugin(htmlParserPlugin);

		expect(engine.slots.get('import.source.tab').length).toBeGreaterThanOrEqual(3);
		expect(engine.slots.get('export.action').length).toBeGreaterThanOrEqual(1);

		expect(engine.slots.getSource('share-json')).toBeDefined();
		expect(engine.slots.getSource('cqut-online')).toBeDefined();
		expect(engine.slots.getSource('edu-html')).toBeDefined();
		expect(engine.slots.getExporter('share-json')).toBeDefined();

		// 5. Verify JSON export via standard slot
		const exportSlot = engine.slots.getSlotItem('export.action', 'share-json');
		expect(exportSlot).toBeDefined();
		const exported = await exportSlot!.export(engine.state.currentTimetable!);
		expect(exported.filename).toBe('原生宿主课表.json');
		expect(exported.content).toContain('高级移动应用开发');

		// 6. Verify config update in native host environment
		const cqutCtx = engine.getPluginContext('source-cqut');
		await cqutCtx.updateConfig({ campusId: 'liangjiang' });
		expect(cqutCtx.config.campusId).toBe('liangjiang');

		shareHandle.dispose();
		cqutHandle.dispose();
		htmlHandle.dispose();

		expect(engine.slots.get('import.source.tab').length).toBe(0);
		expect(engine.slots.get('export.action').length).toBe(0);

		engine.dispose();
	});
});
