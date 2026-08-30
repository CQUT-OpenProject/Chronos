import { describe, expect, it, vi } from 'vite-plus/test';
import type { ThemeContribution } from '@chronos/core';
import { m3DefaultTheme } from '@chronos/ui-kit';
import { wallpaperPlugin } from '@chronos/plugin-wallpaper';

function assertThemeContract(theme: ThemeContribution) {
	expect(Object.keys(theme.workbenchColors.light).length).toBeGreaterThan(0);
	expect(Object.keys(theme.workbenchColors.dark).length).toBeGreaterThan(0);

	if (theme.paletteEntries) {
		const entries =
			typeof theme.paletteEntries === 'function'
				? theme.paletteEntries('light')
				: theme.paletteEntries;
		expect(entries.length).toBeGreaterThan(0);
	}

	if (theme.supportsDynamicColor && theme.dynamicColorAdapter) {
		const adapter = theme.dynamicColorAdapter;
		expect(typeof adapter.extractWallpaperSeed).toBe('function');
		expect(typeof adapter.paintWallpaperTheme).toBe('function');
		expect(typeof adapter.clearWallpaperTheme).toBe('function');
	}
}

describe('ThemeContribution contract', () => {
	it('m3-default theme satisfies contract', () => {
		assertThemeContract(m3DefaultTheme);
		expect(m3DefaultTheme.supportsDynamicColor).toBe(true);
		expect(m3DefaultTheme.dynamicColorAdapter).toBeUndefined();
	});

	it('wallpaper theme satisfies contract with dynamicColorAdapter', async () => {
		const registered = new Map<string, unknown>();
		const disposable = { dispose: () => {} };
		await wallpaperPlugin.apply({
			pluginId: 'tool-wallpaper',
			config: {},
			i18n: {
				locale: 'zh-cn',
				t: (key: string) => key,
				registerMessages: () => disposable
			},
			storage: {
				delete: vi.fn(async () => {}),
				getPluginData: vi.fn(async () => null),
				setPluginData: vi.fn(async () => {}),
				deletePluginData: vi.fn(async () => {})
			},
			service: () => ({
				getPluginData: vi.fn(async () => null),
				setPluginData: vi.fn(async () => {}),
				deletePluginData: vi.fn(async () => {})
			}),
			on: () => disposable,
			emit: () => {},
			registerSlot: ((name: string, contribution: unknown) => {
				registered.set(name, contribution);
				return disposable;
			}) as never,
			addDisposable: () => {}
		} as never);

		const contribution = registered.get('theme.definition') as ThemeContribution;
		expect(contribution).toBeDefined();
		assertThemeContract(contribution);
		expect(contribution.supportsDynamicColor).toBe(true);
		expect(contribution.dynamicColorAdapter).toBeDefined();
	});
});
