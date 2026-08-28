import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine } from '../src/runtime/engine';
import { createTimetable } from '../src/domain/timetable';
import type { Timetable } from '../src/domain/timetable';
import { createCourse } from '../src/domain/course';
import { DEFAULT_USER_PREFERENCES } from '../src/domain/preferences';
import type { ChronosEnv, StorageChangeEvent } from '../src/types/env';
import type { ChronosContext, ChronosPlugin } from '../src/types/context';
import { defineSchema } from '../src/schema/schema';
import { IHttpService } from '../src/types/services';

function createMockEnv() {
	const timetables = new Map<string, Timetable>();
	let activeId: string | null = null;
	let prefs = { ...DEFAULT_USER_PREFERENCES };
	const kv = new Map<string, unknown>();
	const listeners = new Set<(e: StorageChangeEvent) => void>();

	const env: ChronosEnv = {
		platform: 'node',
		http: {
			request: vi.fn()
		},
		storage: {
			getTimetable: async (id: string) => timetables.get(id) ?? null,
			listTimetables: async () =>
				Array.from(timetables.values()).map((t) => ({
					id: t.id,
					name: t.name,
					updatedAt: t.updatedAt
				})),
			saveTimetable: async (t: Timetable) => {
				timetables.set(t.id, t);
			},
			deleteTimetable: async (id: string) => {
				timetables.delete(id);
			},
			getActiveTimetableId: async () => activeId,
			setActiveTimetableId: async (id: string) => {
				activeId = id || null;
			},
			queryCourses: async () => [],
			getPreferences: async () => prefs,
			savePreferences: async (patch) => {
				prefs = { ...prefs, ...patch };
			},
			getPluginData: async <T>(pluginId: string, key: string): Promise<T | null> =>
				(kv.get(`${pluginId}:${key}`) as T) ?? null,
			setPluginData: async <T>(pluginId: string, key: string, val: T): Promise<void> => {
				kv.set(`${pluginId}:${key}`, val);
			},
			deletePluginData: async (pluginId: string, key: string): Promise<void> => {
				kv.delete(`${pluginId}:${key}`);
			},
			onChanged: (l: (e: StorageChangeEvent) => void) => {
				listeners.add(l);
				return { dispose: () => listeners.delete(l) };
			}
		},
		vault: {
			isSupported: async () => false,
			storeSecret: vi.fn(),
			getSecret: vi.fn(),
			removeSecret: vi.fn()
		},
		runtime: {
			sha256: async () => 'hash'
		}
	};

	return {
		env,
		timetables,
		triggerStorageChange: (e: StorageChangeEvent) => {
			for (const l of listeners) l(e);
		}
	};
}

describe('ChronosEngine in @chronos/core', () => {
	it('initializes and loads active timetable and preferences from storage', async () => {
		const { env, timetables } = createMockEnv();
		const tt = createTimetable({ id: 't1', name: '我的课表' });
		timetables.set('t1', tt);
		await env.storage.setActiveTimetableId('t1');
		await env.storage.savePreferences({ timetableLayoutMode: 'compact' });

		const engine = new ChronosEngine({ env });
		const onLoaded = vi.fn();
		const onPrefUpdated = vi.fn();
		engine.on('timetable:loaded', onLoaded);
		engine.on('preferences:updated', onPrefUpdated);

		await engine.init();

		expect(engine.state.currentTimetable?.id).toBe('t1');
		expect(engine.state.userPreferences.timetableLayoutMode).toBe('compact');
		expect(onLoaded).toHaveBeenCalledWith({ timetable: tt });
		expect(onPrefUpdated).toHaveBeenCalledWith({
			preferences: expect.objectContaining({ timetableLayoutMode: 'compact' })
		});
	});

	it('creates and switches timetable', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const tt = await engine.createTimetable('新课表');
		expect(engine.state.currentTimetable?.id).toBe(tt.id);
		expect(engine.state.currentTimetable?.name).toBe('新课表');

		const tt2 = await engine.createTimetable('第二张课表');
		await engine.switchTimetable(tt2.id);
		expect(engine.state.currentTimetable?.id).toBe(tt2.id);
	});

	it('saves, updates, and deletes courses within current timetable', async () => {
		const { env, timetables } = createMockEnv();
		const tt = createTimetable({ id: 't1', name: '课表' });
		timetables.set('t1', tt);
		await env.storage.setActiveTimetableId('t1');

		const engine = new ChronosEngine({ env });
		await engine.init();

		const course = createCourse({
			id: 'c1',
			name: '大学物理',
			teacher: '王老师',
			location: 'A101',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 2
		});

		await engine.saveCourse(course);
		expect(engine.state.currentTimetable?.courses.length).toBe(1);
		expect(engine.state.currentTimetable?.courses[0]!.name).toBe('大学物理');

		await engine.updateCourse('c1', { teacher: '李老师' });
		expect(engine.state.currentTimetable?.courses[0]!.teacher).toBe('李老师');

		await engine.deleteCourse('c1');
		expect(engine.state.currentTimetable?.courses.length).toBe(0);
	});

	it('updates preferences and switches theme', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const onPrefUpdated = vi.fn();
		const onThemeChanged = vi.fn();

		engine.on('preferences:updated', onPrefUpdated);
		engine.on('theme:changed', onThemeChanged);

		await engine.updatePreferences({ themeMode: 'dark' });
		expect(engine.state.userPreferences.themeMode).toBe('dark');
		expect(onPrefUpdated).toHaveBeenCalled();

		await engine.updatePreferences({ timetableLayoutMode: 'compact' });
		expect(engine.state.userPreferences.timetableLayoutMode).toBe('compact');
		expect(engine.state.userPreferences.themeMode).toBe('dark');

		engine.setTheme('catppuccin');
		expect(engine.state.activeThemeId).toBe('catppuccin');
		expect(onThemeChanged).toHaveBeenCalledWith({ themeId: 'catppuccin' });
	});

	it('loads and unloads plugins with ServiceContainer and HierarchicalSlotRegistry', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const applyFn = vi.fn();
		const disposeFn = vi.fn();

		interface PluginConfig {
			syncOnLaunch: boolean;
		}

		const plugin: ChronosPlugin<PluginConfig> = {
			id: 'sample-plugin',
			name: 'Sample Plugin',
			version: '1.0.0',
			configSchema: defineSchema<PluginConfig>({
				syncOnLaunch: {
					type: 'boolean',
					title: 'Sync on Launch',
					default: true
				}
			}),
			defaultConfig: {
				syncOnLaunch: true
			},
			apply: (ctx: ChronosContext<PluginConfig>) => {
				applyFn(ctx);

				// Capability service is accessible
				const http = ctx.service(IHttpService);
				expect(http).toBeDefined();

				// Register hierarchical slot
				ctx.registerSlot('import.source.tab', {
					id: 'sample-import-tab',
					title: 'Sample Source',
					executeImport: vi.fn()
				});
			},
			dispose: disposeFn
		};

		await engine.loadPlugin(plugin);
		expect(applyFn).toHaveBeenCalled();
		expect(engine.slots.get('import.source.tab').length).toBe(1);

		// Retrieve plugin context
		const ctx = engine.getPluginContext('sample-plugin');
		expect(ctx.config.syncOnLaunch).toBe(true);

		await engine.unloadPlugin('sample-plugin');
		expect(disposeFn).toHaveBeenCalled();
		expect(engine.slots.get('import.source.tab').length).toBe(0);
	});

	it('disposes all subsystems on engine.dispose()', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const pluginDispose = vi.fn();
		await engine.loadPlugin({
			id: 'p1',
			name: 'P1',
			version: '1.0.0',
			apply: () => {},
			dispose: pluginDispose
		});

		engine.dispose();
		expect(pluginDispose).toHaveBeenCalled();
	});

	it('derives the active icon theme from the active color scheme', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		expect(engine.state.activeIconThemeId).toBe('host-default');

		const onIconChanged = vi.fn();
		engine.on('iconTheme:changed', onIconChanged);

		const iconDisposable = engine.iconThemes.registerIconTheme({
			id: 'paired-icons',
			name: 'Paired icons'
		});
		// 注册图标主题本身不改变派生结果
		expect(engine.state.activeIconThemeId).toBe('host-default');

		engine.themes.registerTheme({
			id: 'paired',
			name: 'Paired Theme',
			workbenchColors: { light: {}, dark: {} },
			recommendedIconTheme: 'paired-icons',
			getTokens: () => ({
				surface: '#ffffff',
				onSurface: '#000000',
				primary: '#0000ff',
				onPrimary: '#ffffff',
				surfaceVariant: '#eeeeee',
				outline: '#cccccc'
			})
		});
		engine.setTheme('paired');
		expect(engine.state.activeIconThemeId).toBe('paired-icons');
		expect(onIconChanged).toHaveBeenLastCalledWith({ iconThemeId: 'paired-icons' });

		// 推荐的图标主题被注销时回退 host-default
		iconDisposable.dispose();
		expect(engine.state.activeIconThemeId).toBe('host-default');

		engine.dispose();
	});

	it('importTimetable saves, activates, and can overwrite the active id', async () => {
		const { env, timetables } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const existing = createTimetable({
			id: 'active-1',
			name: '现有课表',
			courses: []
		});
		await env.storage.saveTimetable(existing);
		await env.storage.setActiveTimetableId('active-1');
		await engine.init();

		const incoming = createTimetable({
			id: 'preview',
			name: '导入课表',
			courses: [
				createCourse({
					id: 'c1',
					name: '课程',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 1,
					weeks: [1]
				})
			],
			importMetadata: { source: 'FILE_HTML', campusId: 'huaxi' }
		});

		const saved = await engine.importTimetable(incoming, { overwriteActive: true });
		expect(saved.id).toBe('active-1');
		expect(timetables.get('active-1')?.name).toBe('导入课表');
		expect(engine.state.currentTimetable?.id).toBe('active-1');
		expect(await env.storage.getActiveTimetableId()).toBe('active-1');
	});

	it('saveCurrentTimetableDetails deep-merges academicConfig and preserves holidayCalendar', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const holidayCalendar = {
			holidays: [{ date: '2026-10-01', label: '国庆节' }],
			syncedAt: 1,
			syncedYears: [2026]
		};
		const timetable = createTimetable({
			id: 't1',
			name: '课表',
			courses: [],
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [],
				holidayCalendar
			}
		});
		await env.storage.saveTimetable(timetable);
		await engine.switchTimetable('t1');

		await engine.saveCurrentTimetableDetails({
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
			},
			viewPrefs: {
				showSaturday: true,
				showSunday: false,
				showNonCurrentWeekCourses: false
			}
		});

		expect(engine.state.currentTimetable?.academicConfig.holidayCalendar).toEqual(holidayCalendar);
		engine.dispose();
	});
});
