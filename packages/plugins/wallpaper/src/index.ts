import { createWallpaperPlugin, WALLPAPER_THEME_ID } from './create-wallpaper-plugin';
import { createWallpaperScreenSchema, WALLPAPER_MESSAGES } from './messages';
import { WALLPAPER_PLUGIN_ID } from './storage';

const fallbackT = (key: string) =>
	WALLPAPER_MESSAGES['zh-cn'][key as keyof (typeof WALLPAPER_MESSAGES)['zh-cn']];
export const wallpaperScreenSchema = createWallpaperScreenSchema(fallbackT);

/** 默认插件实例（仅供单测/离线使用）；在线分发经 catalog → ESM bundle 自包含 screenComponent */
export const wallpaperPlugin = createWallpaperPlugin();

export { WALLPAPER_PLUGIN_ID, WALLPAPER_THEME_ID, createWallpaperPlugin };
export * from './storage';
export * from './wallpaper-theme';
export { getWallpaperRuntime } from './runtime.svelte';
