import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createHistoryOverlaySync } from '../src/overlay/history-overlay';

describe('createHistoryOverlaySync in ui-kit', () => {
	let isOpen = false;
	const setOpen = vi.fn((open: boolean) => {
		isOpen = open;
	});
	const back = vi.fn();
	const pushState = vi.fn();
	const listeners = new Map<string, Set<EventListener>>();

	beforeEach(() => {
		isOpen = false;
		setOpen.mockClear();
		back.mockClear();
		pushState.mockClear();
		listeners.clear();

		vi.stubGlobal('history', { back, pushState });
		vi.stubGlobal('window', {
			location: { href: 'https://example.com/app' },
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

	it('pushes history state when overlay opens', () => {
		const sync = createHistoryOverlaySync({
			isOpen: () => isOpen,
			setOpen
		});

		isOpen = true;
		sync.syncOpenState(true);

		expect(pushState).toHaveBeenCalledWith({ chronosOverlay: 1 }, '', 'https://example.com/app');
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

	it('skips history.back once when skipNextHistoryBack was called before close', () => {
		const sync = createHistoryOverlaySync({
			isOpen: () => isOpen,
			setOpen
		});

		isOpen = true;
		sync.syncOpenState(true);
		sync.skipNextHistoryBack();
		isOpen = false;
		sync.syncOpenState(false);

		expect(back).not.toHaveBeenCalled();
		sync.dispose();
	});
});
