import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

import { ConnectivityController } from './connectivity.svelte';

function createWindowStub() {
	const listeners = new Map<string, Set<EventListenerOrEventListenerObject>>();

	return {
		addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
			const set = listeners.get(type) ?? new Set();
			set.add(listener);
			listeners.set(type, set);
		},
		removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
			listeners.get(type)?.delete(listener);
		},
		dispatchEvent(event: Event) {
			const set = listeners.get(event.type);
			if (!set) return true;
			for (const listener of set) {
				if (typeof listener === 'function') {
					listener(event);
				} else {
					listener.handleEvent(event);
				}
			}
			return true;
		}
	};
}

describe('ConnectivityController', () => {
	let controller: ConnectivityController;
	let windowStub: ReturnType<typeof createWindowStub>;

	beforeEach(() => {
		windowStub = createWindowStub();
		vi.stubGlobal('window', windowStub);
		vi.stubGlobal('navigator', { onLine: true });
		controller = new ConnectivityController();
	});

	afterEach(() => {
		controller.destroy();
		vi.unstubAllGlobals();
	});

	it('reflects navigator.onLine on construction', () => {
		vi.stubGlobal('navigator', { onLine: false });
		const offlineController = new ConnectivityController();
		expect(offlineController.isOnline).toBe(false);
		offlineController.destroy();
	});

	it('updates isOnline when going offline', () => {
		controller.init();
		expect(controller.isOnline).toBe(true);

		windowStub.dispatchEvent(new Event('offline'));

		expect(controller.isOnline).toBe(false);
	});

	it('updates isOnline when going back online', () => {
		vi.stubGlobal('navigator', { onLine: false });
		const offlineController = new ConnectivityController();
		offlineController.init();

		windowStub.dispatchEvent(new Event('online'));

		expect(offlineController.isOnline).toBe(true);
		offlineController.destroy();
	});

	it('does not duplicate offline handling when already offline', () => {
		controller.init();
		windowStub.dispatchEvent(new Event('offline'));
		windowStub.dispatchEvent(new Event('offline'));

		expect(controller.isOnline).toBe(false);
	});

	it('does not duplicate online handling when already online', () => {
		controller.init();
		windowStub.dispatchEvent(new Event('online'));

		expect(controller.isOnline).toBe(true);
	});
});
