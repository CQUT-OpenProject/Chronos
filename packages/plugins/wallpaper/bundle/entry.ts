import { createWallpaperPlugin } from '../src/create-wallpaper-plugin.ts';
import WallpaperScreen from '../src/WallpaperScreen.svelte';

export default createWallpaperPlugin({ screenComponent: WallpaperScreen });
