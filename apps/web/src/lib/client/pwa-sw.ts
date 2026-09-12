import { registerSW } from 'virtual:pwa-register';

let registered = false;
let needRefresh = false;

let updateServiceWorker: ((reloadPage?: boolean) => Promise<void>) | undefined;
const updateAvailableListeners = new Set<() => void>();

const CONTROLLER_CHANGE_TIMEOUT_MS = 3000;
const SW_PROBE_TIMEOUT_MS = 15_000;
const SW_DOWNLOAD_TIMEOUT_MS = 120_000;

export type SwUpdatePhase = 'downloading' | 'installing' | 'restarting';

export interface SwUpdateProgress {
	phase: SwUpdatePhase;
	percent: number;
}

export type SwUpdateErrorCode = 'download_timeout' | 'download_failed' | 'no_registration';

export type WaitForWaitingWorkerResult = 'ready' | 'update_failed' | 'timeout' | 'redundant';

export class SwUpdateError extends Error {
	readonly code: SwUpdateErrorCode;

	constructor(code: SwUpdateErrorCode) {
		super(code);
		this.name = 'SwUpdateError';
		this.code = code;
	}
}

export interface ApplyUpdateOptions {
	onProgress?: (progress: SwUpdateProgress) => void;
}

export function isSwUpdatePending(): boolean {
	return needRefresh;
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

	// Register immediately: installability requires an active SW with a
	// fetch handler, idle-deferral delays beforeinstallprompt eligibility.
	registerServiceWorker();
}

function markUpdatePending(): boolean {
	notifyUpdateAvailable();
	return true;
}

function reportProgress(
	onProgress: ApplyUpdateOptions['onProgress'],
	progress: SwUpdateProgress
): void {
	onProgress?.(progress);
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

export async function waitForWaitingWorker(
	registration: ServiceWorkerRegistration,
	options?: { onProgress?: (progress: SwUpdateProgress) => void; timeoutMs?: number }
): Promise<WaitForWaitingWorkerResult> {
	const onProgress = options?.onProgress;
	const timeoutMs = options?.timeoutMs ?? SW_DOWNLOAD_TIMEOUT_MS;

	if (registration.waiting) {
		reportProgress(onProgress, { phase: 'installing', percent: 80 });
		markUpdatePending();
		return 'ready';
	}

	reportProgress(onProgress, { phase: 'downloading', percent: 5 });

	try {
		await registration.update();
	} catch {
		return 'update_failed';
	}

	if (registration.waiting) {
		reportProgress(onProgress, { phase: 'installing', percent: 80 });
		markUpdatePending();
		return 'ready';
	}

	return new Promise((resolve) => {
		let settled = false;
		let stateChangeListener: (() => void) | undefined;
		let timeoutId: ReturnType<typeof setTimeout>;

		const cleanup = () => {
			if (stateChangeListener && registration.installing) {
				registration.installing.removeEventListener('statechange', stateChangeListener);
			}
			registration.removeEventListener('updatefound', onUpdateFound);
		};

		const finish = (result: WaitForWaitingWorkerResult) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			cleanup();
			resolve(result);
		};

		const attachInstallingWorker = (worker: ServiceWorker) => {
			reportProgress(onProgress, { phase: 'downloading', percent: 25 });

			stateChangeListener = () => {
				if (worker.state === 'installed' && registration.waiting) {
					reportProgress(onProgress, { phase: 'installing', percent: 80 });
					markUpdatePending();
					finish('ready');
				}
				if (worker.state === 'redundant') {
					finish('redundant');
				}
			};

			worker.addEventListener('statechange', stateChangeListener);
			stateChangeListener();
		};

		const onUpdateFound = () => {
			if (registration.installing) {
				attachInstallingWorker(registration.installing);
			}
		};

		registration.addEventListener('updatefound', onUpdateFound);

		if (registration.installing) {
			attachInstallingWorker(registration.installing);
		}

		timeoutId = setTimeout(() => finish('timeout'), timeoutMs);
	});
}

function mapWaitingWorkerResultToError(result: WaitForWaitingWorkerResult): SwUpdateError {
	switch (result) {
		case 'update_failed':
		case 'redundant':
			return new SwUpdateError('download_failed');
		case 'timeout':
			return new SwUpdateError('download_timeout');
		default:
			return new SwUpdateError('download_failed');
	}
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

export async function applyUpdateAndReload(options?: ApplyUpdateOptions): Promise<void> {
	if (typeof window === 'undefined') return;

	const onProgress = options?.onProgress;

	if (!('serviceWorker' in navigator)) {
		throw new SwUpdateError('download_failed');
	}

	const registration = await navigator.serviceWorker.getRegistration();
	if (!registration) {
		throw new SwUpdateError('no_registration');
	}

	if (!registration.waiting) {
		const result = await waitForWaitingWorker(registration, { onProgress });
		if (result !== 'ready') {
			throw mapWaitingWorkerResultToError(result);
		}
	} else {
		reportProgress(onProgress, { phase: 'installing', percent: 80 });
		markUpdatePending();
	}

	if (!registration.waiting) {
		throw new SwUpdateError('download_failed');
	}

	// Only drop the pages runtime cache when a waiting worker will actually
	// take over; a semver-only update has nothing to activate and a bare
	// reload would needlessly force every page back to network.
	if ('caches' in window) {
		try {
			await caches.delete('pages-cache');
		} catch {
			// ignore cache deletion errors
		}
	}

	reportProgress(onProgress, { phase: 'restarting', percent: 92 });

	await waitForSwActivationAndReload(
		() => Promise.resolve(registration),
		() => {
			reportProgress(onProgress, { phase: 'restarting', percent: 100 });
			reloadPage();
		}
	);
}
