import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHistoryOverlaySync } from '../src/overlay/history-overlay';
afterEach(() => vi.unstubAllGlobals());
describe('overlay lifecycle', () => {
	it('without a port never changes browser history', () => {
		const pushState = vi.fn();
		const back = vi.fn();
		vi.stubGlobal('history', { pushState, back });
		const sync = createHistoryOverlaySync({ overlayId: 'sheet', setOpen: vi.fn() });
		sync.syncOpenState(true);
		sync.syncOpenState(false);
		sync.dispose();
		expect(pushState).not.toHaveBeenCalled();
		expect(back).not.toHaveBeenCalled();
	});
	it('owns one instance per opening and closes/disposes once', () => {
		const close = vi.fn();
		const dispose = vi.fn();
		const openOverlay = vi.fn(() => ({ close, dispose }));
		const sync = createHistoryOverlaySync({
			overlayId: 'sheet',
			setOpen: vi.fn(),
			port: { openOverlay }
		});
		sync.syncOpenState(true);
		sync.syncOpenState(true);
		sync.syncOpenState(false);
		sync.syncOpenState(false);
		expect(openOverlay).toHaveBeenCalledOnce();
		expect(close).toHaveBeenCalledOnce();
		sync.syncOpenState(true);
		sync.dispose();
		sync.dispose();
		expect(dispose).toHaveBeenCalledOnce();
		expect(openOverlay).toHaveBeenCalledTimes(2);
	});
	it('system dismissal cancels UI without consuming history again', () => {
		let dismiss = () => {};
		const close = vi.fn();
		const dispose = vi.fn();
		const setOpen = vi.fn();
		const sync = createHistoryOverlaySync({
			overlayId: 'sheet',
			setOpen,
			port: {
				openOverlay: (_id, callback) => {
					dismiss = callback;
					return { close, dispose };
				}
			}
		});
		sync.syncOpenState(true);
		dismiss();
		sync.syncOpenState(false);
		sync.dispose();
		expect(setOpen).toHaveBeenCalledWith(false);
		expect(close).not.toHaveBeenCalled();
		expect(dispose).not.toHaveBeenCalled();
	});
});
