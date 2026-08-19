import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine } from '../src/runtime/engine';
import { createTimetable } from '../src/domain/timetable';
import type { Timetable } from '../src/domain/timetable';
import { createCourse } from '../src/domain/course';
import { DEFAULT_USER_PREFERENCES } from '../src/domain/preferences';
import type { ChronosEnv, StorageChangeEvent } from '../src/types/env';
import type { ChronosContext, ChronosPlugin } from '../src/types/context';

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
			patchTimetable: async (id: string, patch: Partial<Timetable>) => {
				const existing = timetables.get(id);
				if (existing) timetables.set(id, { ...existing, ...patch });
			},
			deleteTimetable: async (id: string) => {
				timetables.delete(id);
			},
			getActiveTimetableId: async () => activeId,
			setActiveTimetableId: async (id: string) => {
				activeId = id || null;
			},
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
			setTimeout: (fn: () => void, ms: number) => setTimeout(fn, ms) as unknown as number,
			clearTimeout: (h: number) => clearTimeout(h),
			sha256: async () => 'hash',
			encodeUtf8: (s: string) => new TextEncoder().encode(s),
			decodeUtf8: (b: Uint8Array) => new TextDecoder().decode(b)
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
	it('initializes and loads active timetable from storage', async () => {
		const { env, timetables } = createMockEnv();
		const tt = createTimetable({ id: 't1', name: '我的课表' });
		timetables.set('t1', tt);
		await env.storage.setActiveTimetableId('t1');

		const engine = new ChronosEngine({ env });
		const onLoaded = vi.fn();
		engine.on('timetable:loaded', onLoaded);

		await engine.init();

		expect(engine.state.currentTimetable?.id).toBe('t1');
		expect(onLoaded).toHaveBeenCalledWith({ timetable: tt });
	});

	it('creates and switches timetable', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const tt = await engine.actions.createTimetable('新课表');
		expect(engine.state.currentTimetable?.id).toBe(tt.id);
		expect(engine.state.currentTimetable?.name).toBe('新课表');

		const tt2 = await engine.actions.createTimetable('第二张课表');
		await engine.actions.switchTimetable(tt2.id);
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

		await engine.actions.saveCourse(course);
		expect(engine.state.currentTimetable?.courses.length).toBe(1);
		expect(engine.state.currentTimetable?.courses[0]!.name).toBe('大学物理');

		await engine.actions.updateCourse('c1', { teacher: '李老师' });
		expect(engine.state.currentTimetable?.courses[0]!.teacher).toBe('李老师');

		await engine.actions.deleteCourse('c1');
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

		await engine.actions.updatePreferences({ themeMode: 'dark' });
		expect(engine.state.userPreferences.themeMode).toBe('dark');
		expect(onPrefUpdated).toHaveBeenCalled();

		engine.actions.setTheme('catppuccin');
		expect(engine.state.activeThemeId).toBe('catppuccin');
		expect(onThemeChanged).toHaveBeenCalledWith({ themeId: 'catppuccin' });
	});

	it('loads and unloads plugins with lifecycle hooks', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const applyFn = vi.fn();
		const disposeFn = vi.fn();

		const plugin: ChronosPlugin = {
			id: 'sample-plugin',
			name: '测试插件',
			version: '1.0.0',
			apply: (ctx: ChronosContext) => {
				applyFn(ctx);
				ctx.registerTheme({
					id: 'sample-theme',
					name: 'Sample Theme',
					getTokens: () => ({
						surface: '#fff',
						onSurface: '#000',
						primary: '#123',
						onPrimary: '#fff',
						surfaceVariant: '#eee',
						outline: '#ccc'
					})
				});
			},
			dispose: disposeFn
		};

		await engine.loadPlugin(plugin);
		expect(applyFn).toHaveBeenCalled();
		expect(engine.themes.getTheme('sample-theme')).toBeDefined();

		await engine.unloadPlugin('sample-plugin');
		expect(disposeFn).toHaveBeenCalled();
		expect(engine.themes.getTheme('sample-theme')).toBeUndefined();
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
});
