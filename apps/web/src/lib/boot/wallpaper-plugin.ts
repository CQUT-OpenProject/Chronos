import { createWallpaperPlugin } from '@chronos/plugin-wallpaper';
import WallpaperScreen from '@chronos/plugin-wallpaper/WallpaperScreen';

export const wallpaperPlugin = createWallpaperPlugin({ screenComponent: WallpaperScreen });
