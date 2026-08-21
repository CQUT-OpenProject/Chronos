import { deleteWallpaperBlob, loadWallpaperDataUrl, saveWallpaperBlob } from './wallpaper-storage';

function createWallpaperController() {
	let wallpaperUri = $state<string | null>(null);

	function clearLocal() {
		wallpaperUri = null;
	}

	async function syncFromStorage(pluginActive: boolean): Promise<void> {
		if (!pluginActive) {
			wallpaperUri = null;
			return;
		}
		wallpaperUri = await loadWallpaperDataUrl();
	}

	async function setWallpaper(wallpaper: Blob | null): Promise<void> {
		if (!wallpaper) {
			await deleteWallpaperBlob();
			wallpaperUri = null;
			return;
		}
		wallpaperUri = await saveWallpaperBlob(wallpaper);
	}

	return {
		get uri() {
			return wallpaperUri;
		},
		get hasWallpaper() {
			return Boolean(wallpaperUri);
		},
		clearLocal,
		syncFromStorage,
		setWallpaper
	};
}

const wallpaperController = createWallpaperController();

export function getWallpaperController() {
	return wallpaperController;
}

/** Remove persisted wallpaper and in-memory preview state when the wallpaper plugin is unloaded. */
export async function clearWallpaperForPluginUnload(): Promise<void> {
	await deleteWallpaperBlob();
	getWallpaperController().clearLocal();
}
