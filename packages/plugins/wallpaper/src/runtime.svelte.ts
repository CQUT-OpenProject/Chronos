import type { IStorageService } from '@chronos/core';
import {
	deleteWallpaperBlob,
	loadWallpaperDataUrl,
	saveWallpaperBlob,
	WALLPAPER_PLUGIN_ID
} from './storage';

type WallpaperChangeListener = (uri: string | null) => void;

let storageRef: IStorageService | null = null;
let wallpaperUri = $state<string | null>(null);
let changeHandler: WallpaperChangeListener | null = null;
const listeners = new Set<WallpaperChangeListener>();

function notify(uri: string | null) {
	wallpaperUri = uri;
	for (const listener of listeners) {
		try {
			listener(uri);
		} catch (err) {
			console.error('[WallpaperRuntime] listener error:', err);
		}
	}
	changeHandler?.(uri);
}

export function setWallpaperChangeHandler(handler: WallpaperChangeListener | null): void {
	changeHandler = handler;
	if (handler) {
		handler(wallpaperUri);
	}
}

export function getWallpaperRuntime() {
	return {
		get uri() {
			return wallpaperUri;
		},
		get hasWallpaper() {
			return Boolean(wallpaperUri);
		},
		clearLocal() {
			notify(null);
		},
		async syncFromStorage(pluginActive: boolean): Promise<void> {
			if (!pluginActive || !storageRef) {
				notify(null);
				return;
			}
			const uri = await loadWallpaperDataUrl(storageRef, WALLPAPER_PLUGIN_ID);
			notify(uri);
		},
		async setWallpaper(wallpaper: Blob | null): Promise<void> {
			if (!storageRef) return;
			if (!wallpaper) {
				await deleteWallpaperBlob(storageRef, WALLPAPER_PLUGIN_ID);
				notify(null);
				return;
			}
			const uri = await saveWallpaperBlob(storageRef, wallpaper, WALLPAPER_PLUGIN_ID);
			notify(uri);
		},
		async clearPersisted(): Promise<void> {
			if (!storageRef) return;
			await deleteWallpaperBlob(storageRef, WALLPAPER_PLUGIN_ID);
			notify(null);
		}
	};
}

export function initWallpaperRuntime(storage: IStorageService): void {
	storageRef = storage;
}

export function resetWallpaperRuntime(): void {
	storageRef = null;
	changeHandler = null;
	notify(null);
}
