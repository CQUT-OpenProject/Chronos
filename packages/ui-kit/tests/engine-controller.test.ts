import { describe, it, expect, vi, beforeEach } from 'vite-plus/test';
import {
	ChronosEngine,
	createCourse,
	createTimetable,
	type ChronosContext,
	type ChronosEnv,
	type Timetable,
	type UserPreferences
} from '@chronos/core';
import { ReactiveChronosController } from '../src/reactivity/engine-controller.svelte';

function createMockEnv(): ChronosEnv {
	const timetables = new Map<string, Timetable>();
	let activeId: string | null = null;
	let prefs: UserPreferences = {
		schemaVersion: 1,
		themeMode: 'auto',
		paletteMode: 'vibrant',
		timetableLayoutMode: 'fixed',
		capsuleCornerStyle: 'rounded',
		hapticFeedbackEnabled: true
	};
	const pluginData = new Map<string, unknown>();

	return {
		platform: 'web',
		http: {
			request: vi.fn()
		},
		storage: {
			getTimetable: vi.fn(async (id: string) => timetables.get(id) ?? null),
			listTimetables: vi.fn(async () =>
				Array.from(timetables.values()).map((t) => ({
					id: t.id,
					name: t.name,
					updatedAt: t.updatedAt
				}))
			),
			saveTimetable: vi.fn(async (t: Timetable) => {
				timetables.set(t.id, t);
			}),
			patchTimetable: vi.fn(async (id: string, patch: Partial<Timetable>) => {
				const existing = timetables.get(id);
				if (existing) timetables.set(id, { ...existing, ...patch });
			}),
			deleteTimetable: vi.fn(async (id: string) => {
				timetables.delete(id);
			}),
			getActiveTimetableId: vi.fn(async () => activeId),
			setActiveTimetableId: vi.fn(async (id: string) => {
				activeId = id;
			}),
			getPreferences: vi.fn(async () => ({ ...prefs })),
			savePreferences: vi.fn(async (p: Partial<UserPreferences>) => {
				prefs = { ...prefs, ...p };
			}),
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
			sha256: vi.fn(async () => 'mock-hash'),
			encodeUtf8: vi.fn((s: string) => new TextEncoder().encode(s)),
			decodeUtf8: vi.fn((b: Uint8Array) => new TextDecoder().decode(b))
		}
	};
}

describe('ReactiveChronosController', () => {
	let engine: ChronosEngine;
	let env: ChronosEnv;

	beforeEach(async () => {
		env = createMockEnv();
		engine = new ChronosEngine({ env });
		await engine.init();
	});

	it('synchronizes initial engine state and slots', () => {
		const controller = new ReactiveChronosController(engine);

		expect(controller.currentTimetable).toBeNull();
		expect(controller.activeWeek).toBe(1);
		expect(controller.activeThemeId).toBe('m3-default');
		expect(controller.userPreferences).toBeDefined();
		expect(controller.currentLocale).toBe('zh-cn');
		expect(controller.slotVersion).toBeGreaterThanOrEqual(1);
		expect(controller.sources).toEqual([]);
		expect(controller.exporters).toEqual([]);
		expect(controller.courseActions).toEqual([]);
		expect(controller.courseBadges).toEqual({});

		controller.dispose();
	});

	it('reactively tracks timetable changes and action dispatch', async () => {
		const controller = new ReactiveChronosController(engine);

		const timetable = await controller.createTimetable('测试课表');
		expect(controller.currentTimetable?.id).toBe(timetable.id);
		expect(controller.currentTimetable?.name).toBe('测试课表');

		const course = createCourse({
			id: 'c1',
			name: '大学物理',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2,
			weeks: [1, 2, 3]
		});
		await controller.saveCourse(course);
		expect(controller.currentTimetable?.courses.length).toBe(1);

		await controller.updateCourse('c1', { name: '大学物理实验' });
		expect(controller.currentTimetable?.courses[0]?.name).toBe('大学物理实验');

		await controller.deleteCourse('c1');
		expect(controller.currentTimetable?.courses.length).toBe(0);

		controller.dispose();
	});

	it('reactively updates preferences, themes, and time ticks', async () => {
		const controller = new ReactiveChronosController(engine);

		await controller.updatePreferences({ themeMode: 'dark', timetableLayoutMode: 'compact' });
		expect(controller.userPreferences?.themeMode).toBe('dark');
		expect(controller.userPreferences?.timetableLayoutMode).toBe('compact');

		controller.setTheme('custom-theme');
		expect(controller.activeThemeId).toBe('custom-theme');

		controller.dispose();
	});

	it('synchronizes dynamic slots and tracks slotVersion', async () => {
		const controller = new ReactiveChronosController(engine);
		const initialVersion = controller.slotVersion;

		const testPlugin = {
			id: 'test-plugin',
			name: 'Test Plugin',
			version: '1.0.0',
			apply(ctx: ChronosContext) {
				ctx.registerSlot('import.source.tab', {
					id: 'test-tab',
					title: () => 'Tab 1',
					order: 10,
					executeImport: async () => createTimetable({ id: 'imported', name: 'Imported' })
				});
				ctx.registerSlot('mine.section', {
					id: 'sec-1',
					title: 'Section 1',
					order: 5
				});
				ctx.registerSlot('shell.route.screen', {
					id: 'screen-1',
					title: 'Screen 1'
				});
			}
		};

		const pluginHandle = await engine.loadPlugin(testPlugin);
		expect(controller.slotVersion).toBeGreaterThan(initialVersion);

		const tabs = controller.getSlots('import.source.tab');
		expect(tabs.length).toBe(1);
		expect(tabs[0]?.id).toBe('test-tab');

		const sections = controller.getSlots('mine.section');
		expect(sections.length).toBe(1);
		expect(sections[0]?.id).toBe('sec-1');

		const screen = controller.getSlotItem('shell.route.screen', 'screen-1');
		expect(screen).toBeDefined();
		expect(screen?.id).toBe('screen-1');

		const preUnloadVersion = controller.slotVersion;
		pluginHandle.dispose();
		expect(controller.slotVersion).toBeGreaterThan(preUnloadVersion);
		expect(controller.getSlots('import.source.tab').length).toBe(0);

		controller.dispose();
	});

	it('bumps slotVersion on locale change', () => {
		const controller = new ReactiveChronosController(engine);
		const prevVersion = controller.slotVersion;

		engine.setLocale('en');
		expect(controller.currentLocale).toBe('en');
		expect(controller.slotVersion).toBeGreaterThan(prevVersion);

		controller.dispose();
	});
});
