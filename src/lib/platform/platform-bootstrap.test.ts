import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => ({
	initNavigationStack: vi.fn(),
	connectivityInit: vi.fn(),
	connectivityDestroy: vi.fn(),
	credentialEnvironmentInit: vi.fn().mockResolvedValue(undefined),
	pwaInstallInit: vi.fn().mockResolvedValue(undefined),
	setInstallPromptGate: vi.fn(),
	initWebVitals: vi.fn(),
	ensureShareLinkBrotliReady: vi.fn().mockResolvedValue(undefined),
	attachOfflineUx: vi.fn(() => vi.fn())
}));

vi.mock('$lib/navigation/navigation-direction', () => ({
	initNavigationStack: mocks.initNavigationStack
}));

vi.mock('$lib/platform/connectivity.svelte', () => ({
	connectivity: {
		init: mocks.connectivityInit,
		destroy: mocks.connectivityDestroy,
		isOnline: true
	}
}));

vi.mock('$lib/client/credential-environment.svelte', () => ({
	credentialEnvironment: {
		init: mocks.credentialEnvironmentInit
	}
}));

vi.mock('$lib/client/pwa-install.svelte', () => ({
	pwaInstallController: {
		init: mocks.pwaInstallInit,
		setInstallPromptGate: mocks.setInstallPromptGate,
		cancelScheduledDialog: vi.fn(),
		dismiss: vi.fn()
	}
}));

vi.mock('$lib/client/web-vitals', () => ({
	initWebVitals: mocks.initWebVitals
}));

vi.mock('$lib/parsers/share-link/share-link-brotli', () => ({
	ensureShareLinkBrotliReady: mocks.ensureShareLinkBrotliReady
}));

vi.mock('$lib/platform/offline-ux.svelte', () => ({
	attachOfflineUx: mocks.attachOfflineUx
}));

vi.mock('$lib/client/onboarding.svelte', () => ({
	onboardingController: {
		open: false,
		maybeShow: vi.fn()
	}
}));

import { createPlatformBootstrap, type PlatformBootstrapDeps } from './platform-bootstrap.svelte';

describe('createPlatformBootstrap', () => {
	const shell = {
		init: vi.fn(),
		state: { isDark: false, appState: {}, initialized: false, hasWallpaper: false }
	};
	const timetableScreen = {
		init: vi.fn(),
		state: {
			hasLoadedAppState: false,
			appState: { currentTimetable: null }
		}
	};
	const deps = { shell, timetableScreen } as unknown as PlatformBootstrapDeps;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal('window', { __chronosHideBootFallback: vi.fn() });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('runs startup sequence in order', () => {
		const platform = createPlatformBootstrap(deps);
		const teardown = platform.init('/');

		expect(mocks.initNavigationStack).toHaveBeenCalledWith('/');
		expect(mocks.connectivityInit).toHaveBeenCalled();
		expect(mocks.credentialEnvironmentInit).toHaveBeenCalled();
		expect(shell.init).toHaveBeenCalled();
		expect(timetableScreen.init).toHaveBeenCalledWith(shell);
		expect(mocks.pwaInstallInit).toHaveBeenCalled();
		expect(mocks.initWebVitals).toHaveBeenCalled();
		expect(mocks.ensureShareLinkBrotliReady).toHaveBeenCalled();
		expect(mocks.setInstallPromptGate).toHaveBeenCalled();
		expect(mocks.attachOfflineUx).toHaveBeenCalled();
		expect(window.__chronosHideBootFallback).toHaveBeenCalled();

		teardown();
		expect(mocks.connectivityDestroy).toHaveBeenCalled();
	});

	it('is idempotent on repeated init', () => {
		const platform = createPlatformBootstrap(deps);
		platform.init('/');
		platform.init('/mine');

		expect(mocks.initNavigationStack).toHaveBeenCalledTimes(1);
	});
});
