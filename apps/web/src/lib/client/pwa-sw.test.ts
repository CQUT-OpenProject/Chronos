import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

let probeSwUpdate: (typeof import('./pwa-sw'))['probeSwUpdate'];
let applyUpdateAndReload: (typeof import('./pwa-sw'))['applyUpdateAndReload'];
let waitForSwActivationAndReload: (typeof import('./pwa-sw'))['waitForSwActivationAndReload'];
let waitForWaitingWorker: (typeof import('./pwa-sw'))['waitForWaitingWorker'];
let SwUpdateError: (typeof import('./pwa-sw'))['SwUpdateError'];

beforeEach(async () => {
	vi.resetModules();
	const mod = await import('./pwa-sw');
	probeSwUpdate = mod.probeSwUpdate;
	applyUpdateAndReload = mod.applyUpdateAndReload;
	waitForSwActivationAndReload = mod.waitForSwActivationAndReload;
	waitForWaitingWorker = mod.waitForWaitingWorker;
	SwUpdateError = mod.SwUpdateError;
});

function createRegistrationStub(overrides: Record<string, unknown> = {}) {
	const listeners = new Map<string, Set<() => void>>();
	return {
		waiting: undefined,
		installing: undefined,
		update: vi.fn().mockResolvedValue(undefined),
		addEventListener: vi.fn((event: string, listener: () => void) => {
			if (!listeners.has(event)) listeners.set(event, new Set());
			listeners.get(event)!.add(listener);
		}),
		removeEventListener: vi.fn((event: string, listener: () => void) => {
			listeners.get(event)?.delete(listener);
		}),
		emit(event: string) {
			for (const listener of listeners.get(event) ?? []) {
				listener();
			}
		},
		...overrides
	};
}

describe('probeSwUpdate', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('returns false immediately when update check finds no waiting or installing worker', async () => {
		const registration = createRegistrationStub();
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration)
			}
		});

		await expect(probeSwUpdate()).resolves.toBe(false);
		expect(registration.update).toHaveBeenCalledOnce();
	});

	it('marks update pending when a waiting worker already exists', async () => {
		const registration = createRegistrationStub({ waiting: {} });
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration)
			}
		});

		await expect(probeSwUpdate()).resolves.toBe(true);
		expect(registration.update).not.toHaveBeenCalled();
	});

	it('waits for installing worker but not the full probe timeout when no update is found', async () => {
		vi.useFakeTimers();
		let stateChangeListener: (() => void) | undefined;
		const registration = createRegistrationStub({
			installing: {
				state: 'installing',
				addEventListener: vi.fn((event, listener) => {
					if (event === 'statechange') stateChangeListener = listener;
				})
			}
		});

		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration)
			}
		});

		const pending = probeSwUpdate();
		await vi.advanceTimersByTimeAsync(15_000);
		stateChangeListener?.();
		await expect(pending).resolves.toBe(false);
	});
});

describe('waitForWaitingWorker', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('returns immediately when a waiting worker already exists', async () => {
		const onProgress = vi.fn();
		const registration = createRegistrationStub({ waiting: {} });

		await expect(waitForWaitingWorker(registration as never, { onProgress })).resolves.toBe(
			'ready'
		);

		expect(onProgress).toHaveBeenCalledWith({ phase: 'installing', percent: 80 });
		expect(registration.update).not.toHaveBeenCalled();
	});

	it('waits for installing worker to reach waiting', async () => {
		vi.useFakeTimers();
		const onProgress = vi.fn();
		let stateChangeListener: (() => void) | undefined;
		const worker = {
			state: 'installing',
			addEventListener: vi.fn((event: string, listener: () => void) => {
				if (event === 'statechange') stateChangeListener = listener;
			}),
			removeEventListener: vi.fn()
		};
		const registration = createRegistrationStub({ installing: worker });

		const pending = waitForWaitingWorker(registration as never, {
			onProgress,
			timeoutMs: 1000
		});
		await Promise.resolve();

		expect(onProgress).toHaveBeenCalledWith({ phase: 'downloading', percent: 5 });
		expect(onProgress).toHaveBeenCalledWith({ phase: 'downloading', percent: 25 });

		Object.defineProperty(registration, 'waiting', { value: {}, configurable: true });
		worker.state = 'installed';
		stateChangeListener?.();

		await expect(pending).resolves.toBe('ready');
		expect(onProgress).toHaveBeenCalledWith({ phase: 'installing', percent: 80 });
	});

	it('returns update_failed when registration.update throws', async () => {
		const registration = createRegistrationStub({
			update: vi.fn().mockRejectedValue(new Error('offline'))
		});

		await expect(waitForWaitingWorker(registration as never)).resolves.toBe('update_failed');
	});

	it('returns timeout when no waiting worker appears', async () => {
		vi.useFakeTimers();
		const registration = createRegistrationStub();

		const pending = waitForWaitingWorker(registration as never, { timeoutMs: 1000 });
		await vi.advanceTimersByTimeAsync(1000);

		await expect(pending).resolves.toBe('timeout');
	});

	it('returns redundant when installing worker becomes redundant', async () => {
		vi.useFakeTimers();
		let stateChangeListener: (() => void) | undefined;
		const worker = {
			state: 'installing',
			addEventListener: vi.fn((event: string, listener: () => void) => {
				if (event === 'statechange') stateChangeListener = listener;
			}),
			removeEventListener: vi.fn()
		};
		const registration = createRegistrationStub({ installing: worker });

		const pending = waitForWaitingWorker(registration as never, { timeoutMs: 1000 });
		worker.state = 'redundant';
		stateChangeListener?.();

		await expect(pending).resolves.toBe('redundant');
	});
});

describe('waitForSwActivationAndReload', () => {
	const reload = vi.fn();

	beforeEach(() => {
		reload.mockReset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('reloads immediately when no service worker is waiting', async () => {
		await waitForSwActivationAndReload(async () => ({ waiting: undefined }) as never, reload);

		expect(reload).toHaveBeenCalledOnce();
	});

	it('calls updateServiceWorker and still reloads when no worker is waiting', async () => {
		const swUpdater = vi.fn().mockResolvedValue(undefined);

		await waitForSwActivationAndReload(
			async () => ({ waiting: undefined }) as never,
			reload,
			3000,
			swUpdater
		);

		expect(swUpdater).toHaveBeenCalledWith(true);
		expect(reload).toHaveBeenCalledOnce();
	});

	it('reloads after controllerchange when a waiting worker exists', async () => {
		vi.useFakeTimers();
		const postMessage = vi.fn();
		const swUpdater = vi.fn();
		let controllerListener: (() => void) | undefined;

		vi.stubGlobal('navigator', {
			serviceWorker: {
				addEventListener: vi.fn((event, listener) => {
					if (event === 'controllerchange') controllerListener = listener;
				})
			}
		});

		const pending = waitForSwActivationAndReload(
			async () => ({ waiting: { postMessage } }) as never,
			reload,
			3000,
			swUpdater
		);
		await Promise.resolve();

		expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
		expect(swUpdater).not.toHaveBeenCalled();
		expect(reload).not.toHaveBeenCalled();

		controllerListener?.();
		await pending;

		expect(reload).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});

	it('falls back to reload when controllerchange never fires', async () => {
		vi.useFakeTimers();
		const postMessage = vi.fn();
		const swUpdater = vi.fn();

		vi.stubGlobal('navigator', {
			serviceWorker: {
				addEventListener: vi.fn()
			}
		});

		const pending = waitForSwActivationAndReload(
			async () => ({ waiting: { postMessage } }) as never,
			reload,
			3000,
			swUpdater
		);

		await vi.advanceTimersByTimeAsync(3000);
		await pending;

		expect(reload).toHaveBeenCalledOnce();
		expect(swUpdater).not.toHaveBeenCalled();
		vi.useRealTimers();
	});
});

describe('applyUpdateAndReload', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('throws download_failed when registration.update fails during install', async () => {
		const registration = createRegistrationStub({
			update: vi.fn().mockRejectedValue(new Error('offline'))
		});
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration)
			}
		});

		await expect(applyUpdateAndReload()).rejects.toMatchObject({ code: 'download_failed' });
	});

	it('throws download_timeout when no waiting worker becomes available', async () => {
		vi.useFakeTimers();
		const registration = createRegistrationStub();
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration)
			}
		});

		const pending = applyUpdateAndReload();
		const assertion = expect(pending).rejects.toBeInstanceOf(SwUpdateError);
		await vi.advanceTimersByTimeAsync(120_000);
		await assertion;
	});

	it('drops pages-cache and reports progress when activating a waiting worker', async () => {
		const reload = vi.fn();
		const cachesDelete = vi.fn().mockResolvedValue(true);
		const postMessage = vi.fn();
		let controllerListener: (() => void) | undefined;
		const onProgress = vi.fn();
		const cachesStub = { delete: cachesDelete };
		const registration = createRegistrationStub({ waiting: { postMessage } });

		vi.stubGlobal('window', { location: { reload }, caches: cachesStub });
		vi.stubGlobal('caches', cachesStub);
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration),
				addEventListener: vi.fn((event, listener) => {
					if (event === 'controllerchange') controllerListener = listener;
				})
			}
		});

		const pending = applyUpdateAndReload({ onProgress });
		await vi.waitFor(() => expect(cachesDelete).toHaveBeenCalled());

		expect(onProgress).toHaveBeenCalledWith({ phase: 'installing', percent: 80 });
		expect(cachesDelete).toHaveBeenCalledWith('pages-cache');
		expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

		controllerListener?.();
		await pending;

		expect(onProgress).toHaveBeenCalledWith({ phase: 'restarting', percent: 92 });
		expect(onProgress).toHaveBeenCalledWith({ phase: 'restarting', percent: 100 });
		expect(reload).toHaveBeenCalledOnce();
	});

	it('waits for download before activating when waiting worker is not ready yet', async () => {
		vi.useFakeTimers();
		const reload = vi.fn();
		const cachesDelete = vi.fn().mockResolvedValue(true);
		const postMessage = vi.fn();
		let controllerListener: (() => void) | undefined;
		let stateChangeListener: (() => void) | undefined;
		const onProgress = vi.fn();
		const cachesStub = { delete: cachesDelete };
		const worker = {
			state: 'installing',
			addEventListener: vi.fn((event: string, listener: () => void) => {
				if (event === 'statechange') stateChangeListener = listener;
			}),
			removeEventListener: vi.fn()
		};
		const registration = createRegistrationStub({ installing: worker });

		vi.stubGlobal('window', { location: { reload }, caches: cachesStub });
		vi.stubGlobal('caches', cachesStub);
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue(registration),
				addEventListener: vi.fn((event, listener) => {
					if (event === 'controllerchange') controllerListener = listener;
				})
			}
		});

		const pending = applyUpdateAndReload({ onProgress });
		await vi.waitFor(() => expect(stateChangeListener).toBeDefined());

		Object.defineProperty(registration, 'waiting', { value: { postMessage }, configurable: true });
		worker.state = 'installed';
		stateChangeListener?.();
		await vi.waitFor(() => expect(cachesDelete).toHaveBeenCalled());

		controllerListener?.();
		await vi.advanceTimersByTimeAsync(3000);
		await pending;

		expect(onProgress).toHaveBeenCalledWith({ phase: 'downloading', percent: 5 });
		expect(onProgress).toHaveBeenCalledWith({ phase: 'installing', percent: 80 });
		expect(cachesDelete).toHaveBeenCalledWith('pages-cache');
		expect(reload).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});
});
