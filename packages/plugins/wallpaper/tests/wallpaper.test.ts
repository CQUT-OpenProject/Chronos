import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, type ChronosEnv, type UserPreferences } from '@chronos/core';
import { wallpaperPlugin } from '../src/index';
import { createWallpaperRuntime } from '../src/runtime.svelte';
import { WALLPAPER_IMAGE_KEY, WALLPAPER_PLUGIN_ID } from '../src/storage';

const STORED_WALLPAPER = {
	mimeType: 'image/png',
	base64: 'iVBORw0KGgo='
};
const EXPECTED_DATA_URI = 'data:image/png;base64,iVBORw0KGgo=';

function createMockEnv(
	getPluginData: (pluginId: string, key: string) => Promise<unknown> = async () => null
): ChronosEnv {
	return {
		platform: 'web',
		http: { request: vi.fn() },
		storage: {
			getTimetable: vi.fn(async () => null),
			listTimetables: vi.fn(async () => []),
			saveTimetable: vi.fn(async () => {}),
			patchTimetable: vi.fn(async () => {}),
			deleteTimetable: vi.fn(async () => {}),
			getActiveTimetableId: vi.fn(async () => null),
			setActiveTimetableId: vi.fn(async () => {}),
			queryCourses: vi.fn(async () => []),
			getPreferences: vi.fn(async (): Promise<UserPreferences> => ({
				schemaVersion: 1,
				themeMode: 'auto',
				paletteMode: 'vibrant',
				timetableLayoutMode: 'fixed',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true
			})),
			savePreferences: vi.fn(async () => {}),
			getPluginData: ((pluginId: string, key: string) =>
				getPluginData(pluginId, key)) as ChronosEnv['storage']['getPluginData'],
			setPluginData: vi.fn(async () => {}),
			deletePluginData: vi.fn(async () => {})
		},
		vault: {
			isSupported: vi.fn(async () => true),
			storeSecret: vi.fn(async () => {}),
			getSecret: vi.fn(async () => null),
			removeSecret: vi.fn(async () => {})
		},
		runtime: {
			setTimeout: vi.fn(),
			clearTimeout: vi.fn(),
			sha256: vi.fn(async () => ''),
			encodeUtf8: vi.fn(),
			decodeUtf8: vi.fn()
		}
	};
}

describe('@chronos/plugin-wallpaper', () => {
	it('has expected plugin metadata', () => {
		expect(wallpaperPlugin.id).toBe(WALLPAPER_PLUGIN_ID);
		expect(wallpaperPlugin.id).toBe('tool-wallpaper');
		expect(wallpaperPlugin.version).toBe('1.0.0');
		expect(wallpaperPlugin.category).toBe('tool');
		expect(
			typeof wallpaperPlugin.name === 'function' ? wallpaperPlugin.name() : wallpaperPlugin.name
		).toBe('自定义壁纸');
	});

	it('registers mine.item, screen slot, and theme when loaded', async () => {
		const env = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(wallpaperPlugin);

		const item = engine.slots.getSlotItem('mine.item', 'wallpaper');
		expect(item).toBeDefined();
		expect(item?.sectionId).toBe('appearance-feedback');
		expect(item?.href).toBe('/plugins/tool-wallpaper');
		expect(item?.icon).toBe('wallpaper');
		expect(typeof item?.title === 'function' ? item.title() : item?.title).toBe('设置课表壁纸');

		const screen = engine.slots.getSlotItem('shell.route.screen', 'tool-wallpaper');
		expect(screen).toBeDefined();
		expect(typeof screen?.title === 'function' ? screen.title() : screen?.title).toBe(
			'设置课表壁纸'
		);
		expect(screen?.schema).toBeDefined();

		const theme = engine.themes.getTheme('wallpaper');
		expect(theme).toBeDefined();
		expect(typeof theme?.name === 'function' ? theme.name() : theme?.name).toBe('壁纸');
		expect(theme?.supportsDynamicColor).toBe(true);

		handle.dispose();
		expect(engine.slots.getSlotItem('mine.item', 'wallpaper')).toBeUndefined();
		expect(engine.slots.getSlotItem('shell.route.screen', 'tool-wallpaper')).toBeUndefined();
		expect(engine.themes.getTheme('wallpaper')).toBeUndefined();
		engine.dispose();
	});

	it('emits dynamicColor:changed with null uri when unloaded', async () => {
		const getPluginData = vi.fn(async () => STORED_WALLPAPER);
		const env = createMockEnv(getPluginData);
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(wallpaperPlugin);
		await new Promise((resolve) => setTimeout(resolve, 0));

		const received: Array<string | null> = [];
		engine.on('dynamicColor:changed', ({ uri }) => {
			received.push(uri);
		});
		expect(received).toEqual([]);

		handle.dispose();
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(received).toEqual([null]);
		engine.dispose();
	});

	it('replays dynamicColor:changed on dynamicColor:hydrate after late subscription', async () => {
		const getPluginData = vi.fn(async (pluginId: string, key: string) => {
			if (pluginId === WALLPAPER_PLUGIN_ID && key === WALLPAPER_IMAGE_KEY) {
				return STORED_WALLPAPER;
			}
			return null;
		});
		const env = createMockEnv(getPluginData);
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(wallpaperPlugin);

		const received: Array<string | null> = [];
		engine.on('dynamicColor:changed', ({ uri }) => {
			received.push(uri);
		});

		engine.events.emit('dynamicColor:hydrate', undefined);

		expect(received).toEqual([EXPECTED_DATA_URI]);

		handle.dispose();
		engine.dispose();
	});

	it('isolates runtime state per createWallpaperRuntime instance', async () => {
		const storageA = {
			getPluginData: vi.fn(async () => STORED_WALLPAPER),
			setPluginData: vi.fn(async () => {}),
			deletePluginData: vi.fn(async () => {})
		};
		const storageB = {
			getPluginData: vi.fn(async () => null),
			setPluginData: vi.fn(async () => {}),
			deletePluginData: vi.fn(async () => {})
		};

		const runtimeA = createWallpaperRuntime(storageA as never, 'plugin-a');
		const runtimeB = createWallpaperRuntime(storageB as never, 'plugin-b');

		await runtimeA.syncFromStorage(true);
		await runtimeB.syncFromStorage(true);

		expect(runtimeA.uri).toBe(EXPECTED_DATA_URI);
		expect(runtimeB.uri).toBeNull();

		runtimeA.dispose();
		expect(runtimeA.uri).toBeNull();
		expect(runtimeB.uri).toBeNull();

		await runtimeB.syncFromStorage(true);
		expect(runtimeB.uri).toBeNull();

		runtimeB.dispose();
	});
});
