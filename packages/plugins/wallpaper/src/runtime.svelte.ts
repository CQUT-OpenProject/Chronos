import type { IStorageService } from '@chronos/core';
import {
	deleteWallpaperBlob,
	loadWallpaperDataUrl,
	saveWallpaperBlob,
	WALLPAPER_PLUGIN_ID
} from './storage';

export const CHRONOS_MOUNTABLE = Symbol.for('chronos.mountable');

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
		}
	};
}

export function initWallpaperRuntime(storage: IStorageService): void {
	storageRef = storage;
}

export function resetWallpaperRuntime(): void {
	storageRef = null;
	notify(null);
	changeHandler = null;
}

/**
 * 工厂化运行时：随 ScopedContext 生命周期创建/销毁，避免模块级单例跨插件实例串扰。
 * 当前为兼容实现，仍委托全局单例；下迭代将改为完全隔离的实例状态。
 */
export function createWallpaperRuntime(
	storage: IStorageService,
	_pluginId: string = WALLPAPER_PLUGIN_ID
) {
	initWallpaperRuntime(storage);
	const runtime = getWallpaperRuntime();
	return {
		get uri() {
			return runtime.uri;
		},
		get hasWallpaper() {
			return runtime.hasWallpaper;
		},
		syncFromStorage: (active: boolean) => runtime.syncFromStorage(active),
		setWallpaper: (blob: Blob | null) => runtime.setWallpaper(blob),
		dispose: () => resetWallpaperRuntime()
	};
}
