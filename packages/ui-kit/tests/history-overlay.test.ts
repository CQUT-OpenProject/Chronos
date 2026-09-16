import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createHistoryOverlaySync, type OverlayHistoryPort } from '../src/overlay/history-overlay';

describe('createHistoryOverlaySync in ui-kit', () => {
	const back = vi.fn();
	const pushState = vi.fn();
	let setOpen: ReturnType<typeof vi.fn<(open: boolean) => void>>;
	let isOpen = false;

	beforeEach(() => {
		isOpen = false;
		setOpen = vi.fn((open: boolean) => {
			isOpen = open;
		});
		back.mockClear();
		pushState.mockClear();
		vi.stubGlobal('history', { back, pushState });
		vi.stubGlobal('window', {
			location: { href: 'https://example.com/app' }
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('pushes history when overlay opens without a port', () => {
		const sync = createHistoryOverlaySync({
			overlayId: 'bottom-sheet',
			isOpen: () => isOpen,
			setOpen
		});

		sync.syncOpenState(true);

		expect(pushState).toHaveBeenCalledWith(
			{ chronosOverlay: 'bottom-sheet' },
			'',
			'https://example.com/app'
		);
	});

	it('uses the injected port when provided', () => {
		const pushOverlay = vi.fn();
		const port: OverlayHistoryPort = {
			pushOverlay,
			closeOverlay: vi.fn(),
			dismissWithoutPop: vi.fn(),
			onPopOverlay: vi.fn(() => () => {})
		};

		const sync = createHistoryOverlaySync({
			overlayId: 'bottom-sheet',
			port,
			isOpen: () => isOpen,
			setOpen
		});

		sync.syncOpenState(true);
		expect(pushOverlay).toHaveBeenCalledWith('bottom-sheet');
	});

	it('closes overlay on popstate without calling history.back again', () => {
		const popHandlers: Array<() => void> = [];
		const closeOverlay = vi.fn();
		const port: OverlayHistoryPort = {
			pushOverlay: vi.fn(),
			closeOverlay,
			dismissWithoutPop: vi.fn(),
			onPopOverlay: vi.fn((handler) => {
				popHandlers.push(handler);
				return () => {};
			})
		};

		const sync = createHistoryOverlaySync({
			overlayId: 'bottom-sheet',
			port,
			isOpen: () => isOpen,
			setOpen
		});

		sync.syncOpenState(true);
		isOpen = true;
		popHandlers.forEach((handler) => handler());

		expect(setOpen).toHaveBeenCalledWith(false);
		expect(closeOverlay).not.toHaveBeenCalled();
	});

	it('calls port.closeOverlay when overlay closes programmatically', () => {
		const closeOverlay = vi.fn();
		const port: OverlayHistoryPort = {
			pushOverlay: vi.fn(),
			closeOverlay,
			dismissWithoutPop: vi.fn(),
			onPopOverlay: vi.fn(() => () => {})
		};

		const sync = createHistoryOverlaySync({
			overlayId: 'bottom-sheet',
			port,
			isOpen: () => isOpen,
			setOpen
		});

		sync.syncOpenState(true);
		isOpen = true;
		sync.syncOpenState(false);

		expect(closeOverlay).toHaveBeenCalledWith('bottom-sheet');
	});

	it('skips history pop once when skipNextHistoryBack was called before close', () => {
		const closeOverlay = vi.fn();
		const dismissWithoutPop = vi.fn();
		const port: OverlayHistoryPort = {
			pushOverlay: vi.fn(),
			closeOverlay,
			dismissWithoutPop,
			onPopOverlay: vi.fn(() => () => {})
		};

		const sync = createHistoryOverlaySync({
			overlayId: 'bottom-sheet',
			port,
			isOpen: () => isOpen,
			setOpen
		});

		sync.syncOpenState(true);
		isOpen = true;
		sync.skipNextHistoryBack();
		sync.syncOpenState(false);

		expect(dismissWithoutPop).toHaveBeenCalledWith('bottom-sheet');
		expect(closeOverlay).not.toHaveBeenCalled();
	});
});
