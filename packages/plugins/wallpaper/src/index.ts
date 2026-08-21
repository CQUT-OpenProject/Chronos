import {
	createWallpaperPlugin,
	WALLPAPER_THEME_ID,
	wallpaperScreenSchema,
	wallpaperThemeContribution
} from './create-wallpaper-plugin';
import { WALLPAPER_PLUGIN_ID } from './storage';

/** Package default without host screen; web app uses `$lib/boot/wallpaper-plugin`. */
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
export { getWallpaperRuntime, setWallpaperChangeHandler } from './runtime.svelte';
