import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';

const mocks = vi.hoisted(() => ({
	initNavigationStack: vi.fn(),
	connectivityInit: vi.fn(),
	connectivityDestroy: vi.fn(),
	credentialEnvironmentInit: vi.fn().mockResolvedValue(undefined),
	pwaInstallInit: vi.fn().mockResolvedValue(undefined),
	setInstallPromptGate: vi.fn(),
	tryScheduleInstallDialog: vi.fn(),
	initWebVitals: vi.fn(),
	initAnalytics: vi.fn(),
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
		dismiss: vi.fn(),
		tryScheduleInstallDialog: mocks.tryScheduleInstallDialog
	}
}));

vi.mock('$lib/client/web-vitals', () => ({
	initWebVitals: mocks.initWebVitals
}));

vi.mock('$lib/client/analytics', () => ({
	initAnalytics: mocks.initAnalytics
}));

vi.mock('$lib/services/app-engine', () => ({
	ensureEngineReady: vi.fn().mockResolvedValue({}),
	getAppEngine: vi.fn(() => ({
		themes: { getTheme: vi.fn() },
		state: { activeThemeId: 'm3-default' }
	}))
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
	const appearance = {
		apply: vi.fn(),
		reset: vi.fn(),
		coursePalette: []
	};
	const shell = {
		init: vi.fn(),
		appearance,
		controller: { activeThemeId: 'm3-default', userPreferences: { paletteMode: 'vibrant' } },
		state: { isDark: false, initialized: false }
	};
	const timetableScreen = {
		init: vi.fn(),
		state: {
			hasLoadedAppState: false,
			currentTimetable: null
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

	it('runs startup sequence in order', async () => {
		const platform = createPlatformBootstrap(deps);
		const teardown = platform.init('/');

		await vi.waitFor(() => {
			expect(shell.init).toHaveBeenCalled();
		});

		expect(mocks.initNavigationStack).toHaveBeenCalledWith('/');
		expect(mocks.connectivityInit).toHaveBeenCalled();
		expect(mocks.credentialEnvironmentInit).toHaveBeenCalled();
		expect(timetableScreen.init).toHaveBeenCalledWith(shell);
		expect(mocks.pwaInstallInit).toHaveBeenCalled();
		expect(mocks.initWebVitals).toHaveBeenCalled();
		expect(mocks.initAnalytics).toHaveBeenCalled();
		expect(mocks.setInstallPromptGate).toHaveBeenCalled();
		expect(mocks.attachOfflineUx).toHaveBeenCalled();
		expect(window.__chronosHideBootFallback).toHaveBeenCalled();

		teardown();
		expect(mocks.connectivityDestroy).toHaveBeenCalled();
		expect(appearance.reset).toHaveBeenCalled();
	});

	it('is idempotent on repeated init', () => {
		const platform = createPlatformBootstrap(deps);
		platform.init('/');
		platform.init('/mine');

		expect(mocks.initNavigationStack).toHaveBeenCalledTimes(1);
	});
});
