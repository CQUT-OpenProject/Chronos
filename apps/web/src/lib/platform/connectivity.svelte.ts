export class ConnectivityController {
	isOnline = $state(true);

	private initialized = false;

	constructor() {
		if (typeof window !== 'undefined') {
			this.isOnline = navigator.onLine;
		}
	}

	init() {
		if (this.initialized || typeof window === 'undefined') return;
		this.initialized = true;

		this.isOnline = navigator.onLine;

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
	};

	private handleOnline = () => {
		if (this.isOnline) return;
		this.isOnline = true;
	};
}

export const connectivity = new ConnectivityController();

export type ConnectivityReader = Pick<ConnectivityController, 'isOnline'>;
