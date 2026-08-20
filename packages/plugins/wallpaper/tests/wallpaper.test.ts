import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine, type ChronosEnv, type UserPreferences } from '@chronos/core';
import { wallpaperPlugin, WALLPAPER_PLUGIN_ID } from '../src/index';

function createMockEnv(): ChronosEnv {
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
			getPreferences: vi.fn(async (): Promise<UserPreferences> => ({
				schemaVersion: 1,
				themeMode: 'auto',
				paletteMode: 'vibrant',
				timetableLayoutMode: 'fixed',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true
			})),
			savePreferences: vi.fn(async () => {}),
			getPluginData: vi.fn(async () => null),
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
		).toBe('课表壁纸');
	});

	it('registers mine.item and theme.definition slots when loaded and revokes on dispose', async () => {
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
});
