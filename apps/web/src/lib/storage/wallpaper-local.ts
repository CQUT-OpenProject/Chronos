import { db } from './db';

const WALLPAPER_ID = 'default';

export async function getWallpaperBlob(): Promise<Blob | null> {
	const row = await db.wallpapers.get(WALLPAPER_ID);
	return row?.blob ?? null;
}

export async function saveWallpaper(blob: Blob): Promise<void> {
	await db.wallpapers.put({
		id: WALLPAPER_ID,
		blob,
		updatedAt: Date.now()
	});
}

export async function deleteWallpaper(): Promise<void> {
	await db.wallpapers.delete(WALLPAPER_ID);
}
