import { registerSW } from 'virtual:pwa-register';

let registered = false;
let needRefresh = false;

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;
const updateAvailableListeners = new Set<() => void>();

const CONTROLLER_CHANGE_TIMEOUT_MS = 3000;
const SW_PROBE_TIMEOUT_MS = 5000;

export function isSwUpdatePending(): boolean {
	return needRefresh;
}

/** @internal Resets module state between unit tests. */
export function resetPwaSwStateForTesting(): void {
	needRefresh = false;
}

/** @internal Emits the SW update-available event for unit tests. */
export function emitSwUpdateAvailableForTesting(): void {
	notifyUpdateAvailable();
}

export function onSwUpdateAvailable(listener: () => void): () => void {
	updateAvailableListeners.add(listener);
	return () => {
		updateAvailableListeners.delete(listener);
	};
}

function notifyUpdateAvailable() {
	needRefresh = true;
	for (const listener of updateAvailableListeners) {
		listener();
	}
}

function registerServiceWorker() {
	updateServiceWorker = registerSW({
		immediate: true,
		onNeedRefresh() {
			notifyUpdateAvailable();
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

function markUpdatePending(): boolean {
	notifyUpdateAvailable();
	return true;
}

function waitForInstallingWorker(
	registration: ServiceWorkerRegistration,
	timeoutMs = SW_PROBE_TIMEOUT_MS
): Promise<boolean> {
	return new Promise((resolve) => {
		const worker = registration.installing;
		if (!worker) {
			resolve(false);
			return;
		}

		let settled = false;
		const finish = (value: boolean) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			resolve(value);
		};

		const onStateChange = () => {
			if (worker.state === 'installed' && registration.waiting) {
				finish(markUpdatePending());
			}
			if (worker.state === 'redundant') {
				finish(false);
			}
		};

		worker.addEventListener('statechange', onStateChange);
		onStateChange();

		const timeoutId = setTimeout(() => finish(false), timeoutMs);
	});
}

export async function probeSwUpdate(): Promise<boolean> {
	if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return false;
	if (needRefresh) return true;

	try {
		const registration = await navigator.serviceWorker.getRegistration();
		if (!registration) return false;

		if (registration.waiting) {
			return markUpdatePending();
		}

		await registration.update();
		if (registration.waiting) {
			return markUpdatePending();
		}

		if (registration.installing) {
			return (await waitForInstallingWorker(registration)) || needRefresh;
		}

		return false;
	} catch {
		return needRefresh;
	}
}

function reloadPage(): void {
	needRefresh = false;
	window.location.reload();
}

export async function waitForSwActivationAndReload(
	getRegistration: () => Promise<ServiceWorkerRegistration | undefined>,
	reload: () => void = reloadPage,
	timeoutMs = CONTROLLER_CHANGE_TIMEOUT_MS,
	swUpdater: ((reloadPage?: boolean) => Promise<void>) | undefined = updateServiceWorker
): Promise<void> {
	const registration = await getRegistration();
	const waiting = registration?.waiting;

	if (!waiting) {
		try {
			await swUpdater?.(true);
		} catch {
			// ignore updater errors; reload below still applies cache-bust update
		}
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
