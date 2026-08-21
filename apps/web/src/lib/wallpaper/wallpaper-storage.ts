import { getAppEngine } from '$lib/services/app-engine';

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

export async function loadWallpaperDataUrl(): Promise<string | null> {
	const stored = await getAppEngine().storage.getPluginData<StoredWallpaperImage>(
		WALLPAPER_PLUGIN_ID,
		WALLPAPER_IMAGE_KEY
	);
	if (!stored?.base64) return null;
	return storedToDataUrl(stored);
}

export async function saveWallpaperBlob(blob: Blob): Promise<string> {
	const stored = await blobToStored(blob);
	await getAppEngine().storage.setPluginData(WALLPAPER_PLUGIN_ID, WALLPAPER_IMAGE_KEY, stored);
	return storedToDataUrl(stored);
}

export async function deleteWallpaperBlob(): Promise<void> {
	await getAppEngine().storage.deletePluginData(WALLPAPER_PLUGIN_ID, WALLPAPER_IMAGE_KEY);
}
