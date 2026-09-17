import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine } from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import { wallpaperPlugin } from '../src/index';
import { createWallpaperRuntime } from '../src/runtime.svelte';
import { WALLPAPER_IMAGE_KEY, WALLPAPER_PLUGIN_ID } from '../src/storage';

const STORED_WALLPAPER_BLOB = new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], {
	type: 'image/png'
});

function createWallpaperMockEnv(
	getPluginData: (pluginId: string, key: string) => Promise<unknown> = async () => null
) {
	return createMockEnv({
		storage: {
			getPluginData: ((pluginId: string, key: string) =>
				getPluginData(
					pluginId,
					key
				)) as import('@chronos/core').ChronosEnv['storage']['getPluginData']
		}
	}).env;
}

describe('@chronos/plugin-wallpaper', () => {
	it('registers mine.item, screen slot, and theme when loaded', async () => {
		const env = createWallpaperMockEnv();
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
		const getPluginData = vi.fn(async () => STORED_WALLPAPER_BLOB);
		const env = createWallpaperMockEnv(getPluginData);
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
				return STORED_WALLPAPER_BLOB;
			}
			return null;
		});
		const env = createWallpaperMockEnv(getPluginData);
		const engine = new ChronosEngine({ env });
		await engine.init();

		const handle = await engine.loadPlugin(wallpaperPlugin);

		const received: Array<string | null> = [];
		engine.on('dynamicColor:changed', ({ uri }) => {
			received.push(uri);
		});

		engine.events.emit('dynamicColor:hydrate', undefined);

		expect(received).toHaveLength(1);
		expect(received[0]).toMatch(/^blob:/);

		handle.dispose();
		engine.dispose();
	});

	it('isolates runtime state per createWallpaperRuntime instance', async () => {
		const storageA = {
			getPluginData: vi.fn(async () => STORED_WALLPAPER_BLOB),
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

		expect(runtimeA.uri).toMatch(/^blob:/);
		expect(runtimeB.uri).toBeNull();

		runtimeA.dispose();
		expect(runtimeA.uri).toBeNull();
		expect(runtimeB.uri).toBeNull();

		await runtimeB.syncFromStorage(true);
		expect(runtimeB.uri).toBeNull();

		runtimeB.dispose();
	});
});
