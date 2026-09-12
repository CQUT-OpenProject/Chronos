import {
	probeSwUpdate,
	applyUpdateAndReload,
	isSwUpdatePending,
	type ApplyUpdateOptions,
	type SwUpdateProgress
} from '$lib/client/pwa-sw';

/**
 * Seam for ServiceWorker update lifecycle operations.
 */
export interface ServiceWorkerAdapter {
	isSupported(): boolean;
	isUpdatePending(): boolean;
	checkForUpdate(): Promise<boolean>;
	applyUpdateAndReload(options?: ApplyUpdateOptions): Promise<void>;
}

export type { SwUpdateProgress };

export function createDefaultServiceWorkerAdapter(): ServiceWorkerAdapter {
	return {
		isSupported() {
			return typeof window !== 'undefined' && 'serviceWorker' in navigator;
		},
		isUpdatePending() {
			return isSwUpdatePending();
		},
		async checkForUpdate() {
			return probeSwUpdate();
		},
		async applyUpdateAndReload(options?: ApplyUpdateOptions) {
			return applyUpdateAndReload(options);
		}
	};
}
