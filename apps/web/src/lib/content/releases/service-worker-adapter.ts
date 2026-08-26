import { checkAndApplySwUpdate, applyUpdateAndReload, isSwUpdatePending } from '$lib/client/pwa-sw';

/**
 * Seam for ServiceWorker update lifecycle operations.
 */
export interface ServiceWorkerAdapter {
	isSupported(): boolean;
	isUpdatePending(): boolean;
	checkForUpdate(): Promise<boolean>;
	applyUpdateAndReload(): Promise<void>;
}

export function createDefaultServiceWorkerAdapter(): ServiceWorkerAdapter {
	return {
		isSupported() {
			return typeof window !== 'undefined' && 'serviceWorker' in navigator;
		},
		isUpdatePending() {
			return isSwUpdatePending();
		},
		async checkForUpdate() {
			return checkAndApplySwUpdate();
		},
		async applyUpdateAndReload() {
			return applyUpdateAndReload();
		}
	};
}
