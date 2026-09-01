import { registerSW } from 'virtual:pwa-register';

let registered = false;
let needRefresh = false;

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;

const CONTROLLER_CHANGE_TIMEOUT_MS = 3000;

export function isSwUpdatePending(): boolean {
	return needRefresh;
}

function registerServiceWorker() {
	updateServiceWorker = registerSW({
		immediate: true,
		onNeedRefresh() {
			needRefresh = true;
		}
	});
}

export function ensurePwaSwRegistered() {
	if (registered || typeof window === 'undefined') return;
	registered = true;

	const schedule = () => registerServiceWorker();
	if (typeof requestIdleCallback !== 'undefined') {
		requestIdleCallback(schedule);
	} else {
		requestAnimationFrame(schedule);
	}
}

export async function checkAndApplySwUpdate(): Promise<boolean> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
	try {
		const registration = await navigator.serviceWorker.getRegistration();
		if (registration) {
			await registration.update();
			if (registration.waiting) {
				needRefresh = true;
				return true;
			}
		}
	} catch {
		// ignore
	}
	return needRefresh;
}

function reloadPage(): void {
	needRefresh = false;
	window.location.reload();
}

export async function waitForSwActivationAndReload(
	getRegistration: () => Promise<ServiceWorkerRegistration | undefined>,
	reload: () => void = reloadPage,
	timeoutMs = CONTROLLER_CHANGE_TIMEOUT_MS
): Promise<void> {
	const registration = await getRegistration();
	const waiting = registration?.waiting;

	if (!waiting) {
		void updateServiceWorker?.(true);
		reload();
		return;
	}

	await new Promise<void>((resolve) => {
		let settled = false;
		const finish = () => {
			if (settled) return;
			settled = true;
			resolve();
			reload();
		};

		navigator.serviceWorker.addEventListener('controllerchange', finish, { once: true });
		waiting.postMessage({ type: 'SKIP_WAITING' });
		void updateServiceWorker?.(true);
		setTimeout(finish, timeoutMs);
	});
}

export async function applyUpdateAndReload(): Promise<void> {
	if (typeof window === 'undefined') return;

	try {
		if ('caches' in window) {
			await caches.delete('pages-cache');
		}
	} catch {
		// ignore cache deletion errors
	}

	if (!('serviceWorker' in navigator)) {
		reloadPage();
		return;
	}

	try {
		await waitForSwActivationAndReload(() => navigator.serviceWorker.getRegistration());
	} catch {
		reloadPage();
	}
}
