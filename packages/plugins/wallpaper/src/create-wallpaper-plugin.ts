import type { ChronosPlugin, ThemeContribution } from '@chronos/core';
import { createWorkbenchColorsFromTokens, defineSchema, IStorageService } from '@chronos/core';
import { createWallpaperRuntime, type WallpaperRuntime } from './runtime.svelte';
import { WALLPAPER_PLUGIN_ID } from './storage';
import { createWallpaperThemeAdapter } from './wallpaper-theme';

export const WALLPAPER_THEME_ID = 'wallpaper';

export const wallpaperScreenSchema = defineSchema({
	wallpaper: {
		type: 'wallpaper-preview',
		title: () => '选择壁纸图片',
		description: () => '支持 PNG、JPG、WebP 格式图片，自动提取并应用主题色彩',
		accept: 'image/*',
		required: false
	}
});

export function createWallpaperThemeContribution(): ThemeContribution {
	return {
		id: WALLPAPER_THEME_ID,
		name: () => '壁纸',
		description: () => '从当前壁纸提取配色',
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
	screenComponent?: unknown;
}

async function syncConfigWallpaper(
	runtime: WallpaperRuntime,
	config: Record<string, unknown>
): Promise<void> {
	const wallpaper = config.wallpaper;

	if (wallpaper instanceof Uint8Array) {
		await runtime.setWallpaper(new Blob([wallpaper]));
		return;
	}

	if (wallpaper === null) {
		await runtime.setWallpaper(null);
	}
}

export function createWallpaperPlugin(options: CreateWallpaperPluginOptions = {}): ChronosPlugin {
	const { screenComponent } = options;

	return {
		id: WALLPAPER_PLUGIN_ID,
		name: () => '自定义壁纸',
		version: '1.0.0',
		description: () => '自定义课表页壁纸，支持动态取色',
		category: 'tool',
		order: 40,
		author: 'Chronos Community',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		configSchema: wallpaperScreenSchema,
		defaultConfig: {},

		async apply(ctx) {
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

			ctx.registerSlot('mine.item', {
				id: 'wallpaper',
				sectionId: 'appearance-feedback',
				title: () => '设置课表壁纸',
				href: '/plugins/tool-wallpaper',
				icon: 'wallpaper',
				iconTone: 'primary',
				keywords: ['壁纸', '背景', '图片', '自定义', '封面'],
				order: 30
			});

			ctx.registerSlot('shell.route.screen', {
				id: WALLPAPER_PLUGIN_ID,
				title: () => '设置课表壁纸',
				...(screenComponent ? { component: screenComponent } : {}),
				schema: wallpaperScreenSchema
			});

			const themeContribution = createWallpaperThemeContribution();
			ctx.registerSlot('theme.definition', themeContribution);

			ctx.addDisposable({ dispose: () => runtime.dispose() });
		}
	};
}
