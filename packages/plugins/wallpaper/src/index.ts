import WallpaperScreen from './WallpaperScreen.svelte';
import {
	createWallpaperPlugin,
	WALLPAPER_THEME_ID,
	wallpaperScreenSchema,
	wallpaperThemeContribution
} from './create-wallpaper-plugin';
import { WALLPAPER_PLUGIN_ID } from './storage';

export const wallpaperPlugin = createWallpaperPlugin({ screenComponent: WallpaperScreen });

export {
	WALLPAPER_PLUGIN_ID,
	WALLPAPER_THEME_ID,
	wallpaperScreenSchema,
	wallpaperThemeContribution,
	createWallpaperPlugin
};
export * from './storage';
export * from './wallpaper-theme';
export {
	bindWallpaperChangeEmitter,
	getWallpaperRuntime,
	subscribeWallpaperUri
} from './runtime.svelte';
