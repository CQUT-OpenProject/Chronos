import type { IStorageService } from '@chronos/core';

export const WALLPAPER_PLUGIN_ID = 'tool-wallpaper';
export const WALLPAPER_IMAGE_KEY = 'wallpaper_image';

export async function loadWallpaperObjectUrl(
	storage: IStorageService,
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<string | null> {
	const blob = await storage.getPluginData<Blob>(pluginId, WALLPAPER_IMAGE_KEY);
	if (!(blob instanceof Blob)) return null;
	return URL.createObjectURL(blob);
}

export async function saveWallpaperBlob(
	storage: IStorageService,
	blob: Blob,
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<string> {
	await storage.setPluginData(pluginId, WALLPAPER_IMAGE_KEY, blob);
	return URL.createObjectURL(blob);
}

export async function deleteWallpaperBlob(
	storage: IStorageService,
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<void> {
	await storage.deletePluginData(pluginId, WALLPAPER_IMAGE_KEY);
}
