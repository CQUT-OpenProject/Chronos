import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	applyUpdateAndReload,
	probeSwUpdate,
	resetPwaSwStateForTesting,
	waitForSwActivationAndReload
} from './pwa-sw';

describe('probeSwUpdate', () => {
	beforeEach(() => {
		resetPwaSwStateForTesting();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('returns false immediately when update check finds no waiting or installing worker', async () => {
		const update = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue({
					waiting: undefined,
					installing: undefined,
					update
				})
			}
		});

		await expect(probeSwUpdate()).resolves.toBe(false);
		expect(update).toHaveBeenCalledOnce();
	});

	it('marks update pending when a waiting worker already exists', async () => {
		const update = vi.fn();
		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue({
					waiting: {},
					installing: undefined,
					update
				})
			}
		});

		await expect(probeSwUpdate()).resolves.toBe(true);
		expect(update).not.toHaveBeenCalled();
	});

	it('waits for installing worker but not the full probe timeout when no update is found', async () => {
		vi.useFakeTimers();
		const update = vi.fn().mockResolvedValue(undefined);
		let stateChangeListener: (() => void) | undefined;

		vi.stubGlobal('window', {});
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue({
					waiting: undefined,
					installing: {
						state: 'installing',
						addEventListener: vi.fn((event, listener) => {
							if (event === 'statechange') stateChangeListener = listener;
						})
					},
					update
				})
			}
		});

		const pending = probeSwUpdate();
		await vi.advanceTimersByTimeAsync(5000);
		stateChangeListener?.();
		await expect(pending).resolves.toBe(false);
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
		// Mobile browsers may not emit controllerchange after skipWaiting.
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
	beforeEach(() => {
		resetPwaSwStateForTesting();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	it('keeps pages-cache when no worker is waiting (semver-only update)', async () => {
		const reload = vi.fn();
		const cachesDelete = vi.fn().mockResolvedValue(true);
		const cachesStub = { delete: cachesDelete };
		vi.stubGlobal('window', { location: { reload }, caches: cachesStub });
		vi.stubGlobal('caches', cachesStub);
		vi.stubGlobal('navigator', {
			serviceWorker: { getRegistration: vi.fn().mockResolvedValue({ waiting: undefined }) }
		});

		await applyUpdateAndReload();

		expect(cachesDelete).not.toHaveBeenCalled();
		expect(reload).toHaveBeenCalledOnce();
	});

	it('drops pages-cache only when activating a waiting worker', async () => {
		const reload = vi.fn();
		const cachesDelete = vi.fn().mockResolvedValue(true);
		const postMessage = vi.fn();
		let controllerListener: (() => void) | undefined;
		const cachesStub = { delete: cachesDelete };
		vi.stubGlobal('window', { location: { reload }, caches: cachesStub });
		vi.stubGlobal('caches', cachesStub);
		vi.stubGlobal('navigator', {
			serviceWorker: {
				getRegistration: vi.fn().mockResolvedValue({ waiting: { postMessage } }),
				addEventListener: vi.fn((event, listener) => {
					if (event === 'controllerchange') controllerListener = listener;
				})
			}
		});

		const pending = applyUpdateAndReload();
		await Promise.resolve();
		controllerListener?.();
		await pending;

		expect(cachesDelete).toHaveBeenCalledWith('pages-cache');
		expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
		expect(reload).toHaveBeenCalledOnce();
	});
});
