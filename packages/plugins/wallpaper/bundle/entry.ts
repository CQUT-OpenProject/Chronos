import { mountableSvelteComponent } from '@chronos/ui-kit';
import { createWallpaperPlugin } from '../src/create-wallpaper-plugin.ts';
import WallpaperScreen from '../src/WallpaperScreen.svelte';

export default createWallpaperPlugin({
	screenComponent: mountableSvelteComponent(WallpaperScreen)
});
