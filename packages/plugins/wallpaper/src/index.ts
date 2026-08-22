import {
	createWallpaperPlugin,
	WALLPAPER_THEME_ID,
	wallpaperScreenSchema,
	wallpaperThemeContribution
} from './create-wallpaper-plugin';
import { WALLPAPER_PLUGIN_ID } from './storage';

/** 默认插件实例（仅供单测/离线使用）；在线分发经 catalog → ESM bundle 自包含 screenComponent */
export const wallpaperPlugin = createWallpaperPlugin();

export {
	WALLPAPER_PLUGIN_ID,
	WALLPAPER_THEME_ID,
	wallpaperScreenSchema,
	wallpaperThemeContribution,
	createWallpaperPlugin
};
export * from './storage';
export * from './wallpaper-theme';
export { getWallpaperRuntime } from './runtime.svelte';
