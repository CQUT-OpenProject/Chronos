import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';

vi.mock('$lib/client/analytics', () => ({
	trackEvent: vi.fn()
}));

const snackbarKey = vi.fn();
vi.mock('$lib/components/ui/snackbar-state.svelte', () => ({
	snackbarKey: (...args: unknown[]) => snackbarKey(...args)
}));

function stubBrowser(options: { standalone?: boolean; userAgent?: string } = {}) {
	const listeners = new Map<string, Set<(...args: never[]) => void>>();
	const storage = new Map<string, string>();
	const localStorageStub = {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => {
			storage.set(key, String(value));
		},
		removeItem: (key: string) => {
			storage.delete(key);
		},
		clear: () => storage.clear()
	};

	vi.stubGlobal('localStorage', localStorageStub);
	vi.stubGlobal('window', {
		__chronosInstallPrompt: null,
		matchMedia: (query: string) => ({
			matches: options.standalone === true && query === '(display-mode: standalone)',
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		}),
		navigator: {
			userAgent: options.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
			maxTouchPoints: 0
		},
		addEventListener: (type: string, listener: (...args: never[]) => void) => {
			const set = listeners.get(type) ?? new Set();
			set.add(listener);
			listeners.set(type, set);
		},
		removeEventListener: (type: string, listener: (...args: never[]) => void) => {
			listeners.get(type)?.delete(listener);
		},
		location: { origin: 'https://example.com', pathname: '/', search: '' },
		open: vi.fn()
	});

	return { listeners, storage };
}

function fakePrompt(outcome: 'accepted' | 'dismissed', promptImpl?: () => Promise<void>) {
	const prompt = vi.fn(promptImpl ?? (() => Promise.resolve()));
	return {
		preventDefault: vi.fn(),
		prompt,
		userChoice: Promise.resolve({ outcome, platform: 'web' })
	} as unknown as BeforeInstallPromptEvent & { preventDefault: () => void };
}

describe('PWAInstallController', () => {
	beforeEach(() => {
		vi.resetModules();
		snackbarKey.mockClear();
		vi.unstubAllGlobals();
	});

	it('clears the deferred prompt after accept (single-use event)', async () => {
		stubBrowser();
		const { PWAInstallController } = await import('./pwa-install.svelte');
		const controller = new PWAInstallController();
		controller.resetForTesting();
		controller.deferredPrompt = fakePrompt('accepted');

		await expect(controller.install()).resolves.toBe(true);
		expect(controller.deferredPrompt).toBeNull();
		expect(controller.canPrompt).toBe(false);
		// Second call must not reuse the consumed event.
		await expect(controller.install()).resolves.toBe(false);
	});

	it('clears the deferred prompt after dismiss so it cannot be reused', async () => {
		stubBrowser();
		const { PWAInstallController } = await import('./pwa-install.svelte');
		const controller = new PWAInstallController();
		controller.resetForTesting();
		const prompt = fakePrompt('dismissed');
		controller.deferredPrompt = prompt;

		await expect(controller.install()).resolves.toBe(false);
		expect(controller.deferredPrompt).toBeNull();
		expect(prompt.prompt).toHaveBeenCalledOnce();
	});

	it('survives prompt() rejection without unhandled errors', async () => {
		stubBrowser();
		const { PWAInstallController } = await import('./pwa-install.svelte');
		const controller = new PWAInstallController();
		controller.resetForTesting();
		controller.deferredPrompt = fakePrompt('accepted', () =>
			Promise.reject(new DOMException('NotAllowedError'))
		);

		await expect(controller.install()).resolves.toBe(false);
		expect(controller.deferredPrompt).toBeNull();
	});

	it('openInApp never opens a new browser tab', async () => {
		const { storage } = stubBrowser();
		storage.set('chronos:pwa-installed', '1');
		const { PWAInstallController } = await import('./pwa-install.svelte');
		const controller = new PWAInstallController();
		controller.resetForTesting();
		controller.openInAppDialogOpen = true;

		controller.openInApp();

		expect(window.open).not.toHaveBeenCalled();
		expect(controller.openInAppDialogOpen).toBe(false);
		expect(snackbarKey).toHaveBeenCalledWith('pwa.openInApp.hint');
	});

	it('ignores getInstalledRelatedApps without manifest related_applications', async () => {
		stubBrowser();
		vi.stubGlobal('navigator', {
			getInstalledRelatedApps: vi.fn().mockResolvedValue([{ platform: 'webapp' }])
		});
		const { PWAInstallController } = await import('./pwa-install.svelte');
		const controller = new PWAInstallController();
		controller.resetForTesting();

		await controller.init();

		expect(controller.isInstalledLocally).toBe(false);
	});

	it('skips auto-popup on unsupported browsers', async () => {
		vi.useFakeTimers();
		try {
			stubBrowser({
				userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) Gecko/20100101 Firefox/126.0'
			});
			const { PWAInstallController } = await import('./pwa-install.svelte');
			const controller = new PWAInstallController();
			controller.resetForTesting();
			controller.checkEnvironment();

			expect(controller.canShowInstallEntry()).toBe(false);
			controller.tryScheduleInstallDialog();
			await vi.advanceTimersByTimeAsync(3500);

			expect(controller.installDialogOpen).toBe(false);
			expect(controller.iosGuideOpen).toBe(false);
			expect(controller.openInAppDialogOpen).toBe(false);
		} finally {
			vi.useRealTimers();
		}
	});

	it('dedups rapid appinstalled events', async () => {
		const { listeners } = stubBrowser({
			userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126'
		});
		const { PWAInstallController } = await import('./pwa-install.svelte');
		const controller = new PWAInstallController();
		controller.resetForTesting();
		controller.deferredPrompt = fakePrompt('accepted');

		const handlers = listeners.get('appinstalled') ?? new Set();
		expect(handlers.size).toBeGreaterThanOrEqual(1);
		const all = [...handlers] as (() => void)[];
		const handler = all[all.length - 1];
		handler();
		handler();

		expect(controller.isInstalledLocally).toBe(true);
		expect(controller.deferredPrompt).toBeNull();
	});
});
