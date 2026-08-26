import {
	defineChronosPlugin,
	createWorkbenchColorsFromTokens,
	IStorageService
} from '@chronos/core';
import type { ChronosMountable, ThemeContribution } from '@chronos/core';
import { createWallpaperRuntime, type WallpaperRuntime } from './runtime.svelte';
import { WALLPAPER_PLUGIN_ID } from './storage';
import { createWallpaperThemeAdapter } from './wallpaper-theme';
import { createWallpaperScreenSchema, WALLPAPER_MESSAGES } from './messages';

export const WALLPAPER_THEME_ID = 'wallpaper';

function createWallpaperThemeContribution(t: (key: string) => string): ThemeContribution {
	return {
		id: WALLPAPER_THEME_ID,
		name: () => t('theme.name'),
		description: () => t('theme.description'),
		supportsDynamicColor: true,
		workbenchColors: createWorkbenchColorsFromTokens(
			{
				surface: '#f9f9fe',
				onSurface: '#2e333a',
				primary: '#0068b7',
				onPrimary: '#ffffff',
				surfaceVariant: '#eceef5',
				outline: '#aeb2bb'
			},
			{
				surface: '#1e2026',
				onSurface: '#f8fafc',
				primary: '#0068b7',
				onPrimary: '#ffffff',
				surfaceVariant: '#24262e',
				outline: '#334155'
			}
		),
		dynamicColorAdapter: createWallpaperThemeAdapter(),
		getTokens: (mode: 'light' | 'dark') => {
			return {
				surface: mode === 'dark' ? '#1e2026' : '#f9f9fe',
				onSurface: mode === 'dark' ? '#f8fafc' : '#2e333a',
				primary: '#0068b7',
				onPrimary: '#ffffff',
				surfaceVariant: mode === 'dark' ? '#24262e' : '#eceef5',
				outline: mode === 'dark' ? '#334155' : '#aeb2bb'
			};
		}
	};
}

export interface CreateWallpaperPluginOptions {
	screenComponent?: ChronosMountable;
}

async function syncConfigWallpaper(
	runtime: WallpaperRuntime,
	config: Record<string, unknown>
): Promise<void> {
	const wallpaper = config.wallpaper;

	if (wallpaper instanceof Uint8Array) {
		await runtime.setWallpaper(new Blob([new Uint8Array(wallpaper)]));
		return;
	}

	if (wallpaper === null) {
		await runtime.setWallpaper(null);
	}
}

export function createWallpaperPlugin(options: CreateWallpaperPluginOptions = {}) {
	const { screenComponent } = options;

	return defineChronosPlugin({
		id: WALLPAPER_PLUGIN_ID,
		messages: WALLPAPER_MESSAGES,
		nameKey: 'plugin.name',
		descriptionKey: 'plugin.description',
		category: 'tool',
		order: 40,
		author: 'Chronos Community',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		configSchema: createWallpaperScreenSchema(
			(key) => WALLPAPER_MESSAGES['zh-cn'][key as keyof (typeof WALLPAPER_MESSAGES)['zh-cn']]
		),
		defaultConfig: { wallpaper: null },

		async apply(ctx, t) {
			const wallpaperScreenSchema = createWallpaperScreenSchema(t);
			const runtime = createWallpaperRuntime(ctx.service(IStorageService), WALLPAPER_PLUGIN_ID);

			runtime.setChangeHandler((uri) => {
				ctx.emit('dynamicColor:changed', { uri });
			});

			ctx.on('dynamicColor:set', async ({ blob }) => {
				await runtime.setWallpaper(blob);
			});

			ctx.on('dynamicColor:hydrate', () => {
				ctx.emit('dynamicColor:changed', { uri: runtime.uri });
			});

			ctx.on('config:changed', async ({ pluginId, config }) => {
				if (pluginId !== WALLPAPER_PLUGIN_ID) return;
				await syncConfigWallpaper(runtime, config);
			});

			await runtime.syncFromStorage(true);

			const keywords = t('mine.keywords')
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean);

			ctx.registerSlot('mine.item', {
				id: 'wallpaper',
				sectionId: 'appearance-feedback',
				title: () => t('mine.title'),
				href: '/plugins/tool-wallpaper',
				icon: 'wallpaper',
				iconTone: 'primary',
				keywords,
				order: 30
			});

			ctx.registerSlot('shell.route.screen', {
				id: WALLPAPER_PLUGIN_ID,
				title: () => t('screen.title'),
				...(screenComponent ? { component: screenComponent } : {}),
				schema: wallpaperScreenSchema
			});

			const themeContribution = createWallpaperThemeContribution(t);
			ctx.registerSlot('theme.definition', themeContribution);

			ctx.addDisposable({ dispose: () => runtime.dispose() });
		}
	});
}
