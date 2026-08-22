import type { IStorageService } from '@chronos/core';
import {
	deleteWallpaperBlob,
	loadWallpaperDataUrl,
	saveWallpaperBlob,
	WALLPAPER_PLUGIN_ID
} from './storage';

export const CHRONOS_MOUNTABLE = Symbol.for('chronos.mountable');

type WallpaperChangeListener = (uri: string | null) => void;

export interface WallpaperRuntime {
	readonly uri: string | null;
	readonly hasWallpaper: boolean;
	syncFromStorage(pluginActive: boolean): Promise<void>;
	setWallpaper(wallpaper: Blob | null): Promise<void>;
	setChangeHandler(handler: WallpaperChangeListener | null): void;
	dispose(): void;
}

const runtimeRegistry = new Map<string, WallpaperRuntime>();

export function getWallpaperRuntime(pluginId: string = WALLPAPER_PLUGIN_ID): WallpaperRuntime {
	const runtime = runtimeRegistry.get(pluginId);
	if (!runtime) {
		throw new Error(`[WallpaperRuntime] not initialized for plugin "${pluginId}"`);
	}
	return runtime;
}

export function createWallpaperRuntime(
	storage: IStorageService,
	pluginId: string = WALLPAPER_PLUGIN_ID
): WallpaperRuntime {
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

	const runtime: WallpaperRuntime = {
		get uri() {
			return wallpaperUri;
		},
		get hasWallpaper() {
			return Boolean(wallpaperUri);
		},
		async syncFromStorage(pluginActive: boolean): Promise<void> {
			if (!pluginActive) {
				notify(null);
				return;
			}
			const uri = await loadWallpaperDataUrl(storage, pluginId);
			notify(uri);
		},
		async setWallpaper(wallpaper: Blob | null): Promise<void> {
			if (!wallpaper) {
				await deleteWallpaperBlob(storage, pluginId);
				notify(null);
				return;
			}
			const uri = await saveWallpaperBlob(storage, wallpaper, pluginId);
			notify(uri);
		},
		setChangeHandler(handler: WallpaperChangeListener | null) {
			changeHandler = handler;
			if (handler) handler(wallpaperUri);
		},
		dispose() {
			notify(null);
			changeHandler = null;
			listeners.clear();
			if (runtimeRegistry.get(pluginId) === runtime) {
				runtimeRegistry.delete(pluginId);
			}
		}
	};

	runtimeRegistry.set(pluginId, runtime);
	return runtime;
}
