import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const snackbarKey = vi.fn();

vi.mock('$lib/components/ui/snackbar-state.svelte', () => ({
	snackbarKey: (...args: unknown[]) => snackbarKey(...args)
}));

vi.mock('$lib/i18n/host-i18n.svelte', () => ({
	hostT: (key: string) => key
}));

vi.mock('$app/paths', () => ({
	resolve: (path: string) => path
}));

describe('initPwaUpdateUx', () => {
	const storage = new Map<string, string>();

	beforeEach(() => {
		storage.clear();
		snackbarKey.mockClear();
		vi.resetModules();
		vi.stubGlobal('window', { location: { assign: vi.fn() } });
		vi.stubGlobal('sessionStorage', {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => {
				storage.set(key, value);
			},
			removeItem: (key: string) => {
				storage.delete(key);
			},
			clear: () => {
				storage.clear();
			}
		});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('shows the update snackbar only once per session', async () => {
		const { resetPwaSwStateForTesting, emitSwUpdateAvailableForTesting } = await import('./pwa-sw');
		const { initPwaUpdateUx } = await import('./pwa-update-ux.svelte');

		resetPwaSwStateForTesting();
		initPwaUpdateUx();
		emitSwUpdateAvailableForTesting();
		emitSwUpdateAvailableForTesting();

		expect(snackbarKey).toHaveBeenCalledOnce();
	});
});
