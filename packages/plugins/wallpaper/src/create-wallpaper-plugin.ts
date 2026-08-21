import type { ChronosContext, ChronosPlugin, ThemeContribution } from '@chronos/core';
import { defineSchema, IStorageService } from '@chronos/core';
import { deleteWallpaperBlob, WALLPAPER_PLUGIN_ID } from './storage';
import {
	bindWallpaperChangeEmitter,
	getWallpaperRuntime,
	initWallpaperRuntime,
	resetWallpaperRuntime
} from './runtime.svelte';

export const WALLPAPER_THEME_ID = 'wallpaper';

export const wallpaperScreenSchema = defineSchema({
	wallpaper: {
		type: 'file',
		title: () => '选择壁纸图片',
		description: () => '支持 PNG、JPG、WebP 格式图片，自动提取并应用主题色彩',
		accept: 'image/*',
		required: false
	}
});

export const wallpaperThemeContribution: ThemeContribution = {
	id: WALLPAPER_THEME_ID,
	name: () => '壁纸',
	description: () => '从当前壁纸提取配色',
	supportsDynamicColor: true,
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

export interface CreateWallpaperPluginOptions {
	screenComponent?: unknown;
}

async function syncConfigWallpaper(
	ctx: ChronosContext<{ wallpaper?: Uint8Array | string }>,
	config: Record<string, unknown>
): Promise<void> {
	const wallpaper = config.wallpaper;
	const runtime = getWallpaperRuntime();

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
	let storageService: IStorageService | null = null;

	return {
		id: WALLPAPER_PLUGIN_ID,
		name: () => '课表壁纸',
		version: '1.0.0',
		description: () => '自定义课表背景壁纸与主题取色',
		category: 'tool',
		order: 40,
		author: 'Chronos Community',
		homepage: 'https://github.com/CQUT-OpenProject/Chronos',
		configSchema: wallpaperScreenSchema,
		defaultConfig: {},

		apply(ctx) {
			storageService = ctx.service(IStorageService);
			initWallpaperRuntime(storageService);

			ctx.on('config:changed', async ({ pluginId, config }) => {
				if (pluginId !== WALLPAPER_PLUGIN_ID) return;
				await syncConfigWallpaper(ctx, config);
			});

			void getWallpaperRuntime().syncFromStorage(true);

			ctx.registerSlot('mine.item', {
				id: 'wallpaper',
				sectionId: 'appearance-feedback',
				title: () => '设置课表壁纸',
				href: '/plugins/tool-wallpaper',
				icon: 'wallpaper',
				iconTone: 'primary',
				order: 30
			});

			ctx.registerSlot('shell.route.screen', {
				id: WALLPAPER_PLUGIN_ID,
				title: () => '设置课表壁纸',
				...(screenComponent ? { component: screenComponent } : {}),
				schema: wallpaperScreenSchema
			});

			ctx.registerSlot('theme.definition', wallpaperThemeContribution);
		},

		async dispose() {
			if (storageService) {
				await deleteWallpaperBlob(storageService, WALLPAPER_PLUGIN_ID);
			}
			resetWallpaperRuntime();
			storageService = null;
			bindWallpaperChangeEmitter(null);
		}
	};
}
