import { createWallpaperPlugin } from '@chronos/plugin-wallpaper';

/** Rich UI lives at host `/wallpaper`; plugin slot stays schema-only for cqut profile builtins. */
export const wallpaperPlugin = createWallpaperPlugin();
