import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test';
import { createHistoryOverlaySync } from './history-overlay';

const { pushStateMock } = vi.hoisted(() => ({
	pushStateMock: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	pushState: pushStateMock
}));

describe('createHistoryOverlaySync', () => {
	let isOpen = false;
	const setOpen = vi.fn((open: boolean) => {
		isOpen = open;
	});
	const back = vi.fn();
	const listeners = new Map<string, Set<EventListener>>();

	beforeEach(() => {
		isOpen = false;
		setOpen.mockClear();
		pushStateMock.mockClear();
		back.mockClear();
		listeners.clear();

		vi.stubGlobal('history', { back });
		vi.stubGlobal('window', {
			addEventListener(type: string, listener: EventListener) {
				if (!listeners.has(type)) listeners.set(type, new Set());
				listeners.get(type)!.add(listener);
			},
			removeEventListener(type: string, listener: EventListener) {
				listeners.get(type)?.delete(listener);
			},
			dispatchEvent(event: Event) {
				listeners.get(event.type)?.forEach((listener) => listener(event));
				return true;
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('pushes history when overlay opens', () => {
		const sync = createHistoryOverlaySync({
			isOpen: () => isOpen,
			setOpen
		});

		isOpen = true;
		sync.syncOpenState(true);

		expect(pushStateMock).toHaveBeenCalledWith('', { chronosOverlay: 1 });
		sync.dispose();
	});

	it('closes overlay on popstate without calling history.back again', () => {
		const sync = createHistoryOverlaySync({
			isOpen: () => isOpen,
			setOpen
		});

		isOpen = true;
		sync.syncOpenState(true);
		isOpen = true;
		window.dispatchEvent(new Event('popstate'));

		expect(setOpen).toHaveBeenCalledWith(false);
		expect(back).not.toHaveBeenCalled();
		sync.dispose();
	});

	it('calls history.back when overlay closes programmatically', () => {
		const sync = createHistoryOverlaySync({
			isOpen: () => isOpen,
			setOpen
		});

		isOpen = true;
		sync.syncOpenState(true);
		isOpen = false;
		sync.syncOpenState(false);

		expect(back).toHaveBeenCalledTimes(1);
		sync.dispose();
	});
});
