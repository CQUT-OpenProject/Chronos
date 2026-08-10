import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const { snackbar } = vi.hoisted(() => ({
	snackbar: vi.fn()
}));

vi.mock('$lib/components/ui/snackbar-state.svelte', () => ({
	snackbar
}));

import { NetworkStatusController } from './network-status.svelte';

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

describe('NetworkStatusController', () => {
	let controller: NetworkStatusController;
	let windowStub: ReturnType<typeof createWindowStub>;

	beforeEach(() => {
		snackbar.mockClear();
		windowStub = createWindowStub();
		vi.stubGlobal('window', windowStub);
		vi.stubGlobal('navigator', { onLine: true });
		controller = new NetworkStatusController();
	});

	afterEach(() => {
		controller.destroy();
		vi.unstubAllGlobals();
	});

	it('reflects navigator.onLine on construction', () => {
		vi.stubGlobal('navigator', { onLine: false });
		const offlineController = new NetworkStatusController();
		expect(offlineController.isOnline).toBe(false);
		expect(offlineController.wasOffline).toBe(true);
		offlineController.destroy();
	});

	it('updates isOnline and shows snackbar when going offline', () => {
		controller.init();
		expect(controller.isOnline).toBe(true);

		windowStub.dispatchEvent(new Event('offline'));

		expect(controller.isOnline).toBe(false);
		expect(controller.wasOffline).toBe(true);
		expect(snackbar).toHaveBeenCalledWith('当前处于离线状态，课表可正常查看');
	});

	it('updates isOnline and shows snackbar when going back online', () => {
		vi.stubGlobal('navigator', { onLine: false });
		const offlineController = new NetworkStatusController();
		offlineController.init();

		windowStub.dispatchEvent(new Event('online'));

		expect(offlineController.isOnline).toBe(true);
		expect(snackbar).toHaveBeenCalledWith('网络已恢复', undefined, 2000);
		offlineController.destroy();
	});

	it('does not duplicate offline handling when already offline', () => {
		controller.init();
		windowStub.dispatchEvent(new Event('offline'));
		windowStub.dispatchEvent(new Event('offline'));

		expect(controller.isOnline).toBe(false);
		expect(snackbar).toHaveBeenCalledTimes(1);
	});

	it('does not duplicate online handling when already online', () => {
		controller.init();
		windowStub.dispatchEvent(new Event('online'));

		expect(controller.isOnline).toBe(true);
		expect(snackbar).not.toHaveBeenCalled();
	});
});
