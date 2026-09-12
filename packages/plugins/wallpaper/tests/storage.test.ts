import { describe, expect, it, vi } from 'vite-plus/test';
import {
	deleteWallpaperBlob,
	loadWallpaperObjectUrl,
	saveWallpaperBlob,
	WALLPAPER_IMAGE_KEY,
	WALLPAPER_PLUGIN_ID
} from '../src/storage';

function createStorage() {
	const store = new Map<string, unknown>();
	return {
		getPluginData: vi.fn(async <T>(pluginId: string, key: string) => {
			return (store.get(`${pluginId}:${key}`) as T) ?? null;
		}),
		setPluginData: vi.fn(async (pluginId: string, key: string, value: unknown) => {
			store.set(`${pluginId}:${key}`, value);
		}),
		deletePluginData: vi.fn(async (pluginId: string, key: string) => {
			store.delete(`${pluginId}:${key}`);
		})
	};
}

describe('wallpaper storage', () => {
	it('saves and loads wallpaper as blob URLs', async () => {
		const storage = createStorage();
		const blob = new Blob([new Uint8Array([1, 2, 3])], { type: 'image/png' });

		const savedUrl = await saveWallpaperBlob(storage as never, blob);
		expect(savedUrl).toMatch(/^blob:/);
		expect(storage.setPluginData).toHaveBeenCalledWith(
			WALLPAPER_PLUGIN_ID,
			WALLPAPER_IMAGE_KEY,
			blob
		);

		const loadedUrl = await loadWallpaperObjectUrl(storage as never);
		expect(loadedUrl).toMatch(/^blob:/);

		URL.revokeObjectURL(savedUrl);
		if (loadedUrl) URL.revokeObjectURL(loadedUrl);
	});

	it('deletes wallpaper data', async () => {
		const storage = createStorage();
		await saveWallpaperBlob(
			storage as never,
			new Blob([new Uint8Array([1])], { type: 'image/png' })
		);
		await deleteWallpaperBlob(storage as never);
		expect(storage.deletePluginData).toHaveBeenCalledWith(WALLPAPER_PLUGIN_ID, WALLPAPER_IMAGE_KEY);
		expect(await loadWallpaperObjectUrl(storage as never)).toBeNull();
	});
});
