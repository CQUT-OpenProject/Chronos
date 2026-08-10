import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

const OFFLINE_SNACKBAR_MESSAGE = '当前处于离线状态';
const ONLINE_SNACKBAR_MESSAGE = '网络已恢复';
const ONLINE_SNACKBAR_DURATION = 2000;

export class NetworkStatusController {
	isOnline = $state(true);
	wasOffline = $state(false);

	private initialized = false;

	constructor() {
		if (typeof window !== 'undefined') {
			this.isOnline = navigator.onLine;
			this.wasOffline = !navigator.onLine;
		}
	}

	init() {
		if (this.initialized || typeof window === 'undefined') return;
		this.initialized = true;

		this.isOnline = navigator.onLine;
		this.wasOffline = !navigator.onLine;
		if (!this.isOnline) {
			snackbar(OFFLINE_SNACKBAR_MESSAGE);
		}

		window.addEventListener('online', this.handleOnline);
		window.addEventListener('offline', this.handleOffline);
	}

	destroy() {
		if (!this.initialized || typeof window === 'undefined') return;
		this.initialized = false;

		window.removeEventListener('online', this.handleOnline);
		window.removeEventListener('offline', this.handleOffline);
	}

	private handleOffline = () => {
		if (!this.isOnline) return;

		this.isOnline = false;
		this.wasOffline = true;
		snackbar(OFFLINE_SNACKBAR_MESSAGE);
	};

	private handleOnline = () => {
		if (this.isOnline) return;

		this.isOnline = true;
		snackbar(ONLINE_SNACKBAR_MESSAGE, undefined, ONLINE_SNACKBAR_DURATION);
	};
}

export const networkStatus = new NetworkStatusController();

export function isOffline(): boolean {
	return !networkStatus.isOnline;
}
