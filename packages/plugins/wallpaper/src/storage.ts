import type { IStorageService } from '@chronos/core';

export const WALLPAPER_PLUGIN_ID = 'tool-wallpaper';
export const WALLPAPER_IMAGE_KEY = 'wallpaper_image';

interface StoredWallpaperImage {
	mimeType: string;
	base64: string;
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i += 1) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function storedToDataUrl(stored: StoredWallpaperImage): string {
	const mime = stored.mimeType || 'image/jpeg';
	return `data:${mime};base64,${stored.base64}`;
}

async function blobToStored(blob: Blob): Promise<StoredWallpaperImage> {
	const buffer = await blob.arrayBuffer();
	return {
		mimeType: blob.type || 'image/jpeg',
		base64: bytesToBase64(new Uint8Array(buffer))
	};
}

export async function loadWallpaperDataUrl(
	storage: IStorageService,
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<string | null> {
	const stored = await storage.getPluginData<StoredWallpaperImage>(pluginId, WALLPAPER_IMAGE_KEY);
	if (!stored?.base64) return null;
	return storedToDataUrl(stored);
}

export async function saveWallpaperBlob(
	storage: IStorageService,
	blob: Blob,
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<string> {
	const stored = await blobToStored(blob);
	await storage.setPluginData(pluginId, WALLPAPER_IMAGE_KEY, stored);
	return storedToDataUrl(stored);
}

export async function deleteWallpaperBlob(
	storage: IStorageService,
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<void> {
	await storage.deletePluginData(pluginId, WALLPAPER_IMAGE_KEY);
}

export async function saveWallpaperBytes(
	storage: IStorageService,
	bytes: Uint8Array,
	mimeType = 'image/jpeg',
	pluginId = WALLPAPER_PLUGIN_ID
): Promise<string> {
	const blob = new Blob([bytes], { type: mimeType });
	return saveWallpaperBlob(storage, blob, pluginId);
}
