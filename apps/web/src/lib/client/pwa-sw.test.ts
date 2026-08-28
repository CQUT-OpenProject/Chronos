import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { waitForSwActivationAndReload } from './pwa-sw';

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

	it('reloads after controllerchange when a waiting worker exists', async () => {
		vi.useFakeTimers();
		const postMessage = vi.fn();
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
			reload
		);
		await Promise.resolve();

		expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
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

		vi.stubGlobal('navigator', {
			serviceWorker: {
				addEventListener: vi.fn()
			}
		});

		const pending = waitForSwActivationAndReload(
			async () => ({ waiting: { postMessage } }) as never,
			reload,
			3000
		);

		await vi.advanceTimersByTimeAsync(3000);
		await pending;

		expect(reload).toHaveBeenCalledOnce();
		vi.useRealTimers();
	});
});
