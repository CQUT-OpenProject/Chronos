import type { AppShellController } from '$lib/app/app-shell.svelte';
import { credentialEnvironment } from '$lib/client/credential-environment.svelte';
import { connectivity } from '$lib/platform/connectivity.svelte';
import { onboardingController } from '$lib/client/onboarding.svelte';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';
import { initAnalytics } from '$lib/client/analytics';
import { initWebVitals } from '$lib/client/web-vitals';
import { initNavigationStack } from '$lib/navigation/navigation-direction';
import { attachOfflineUx } from '$lib/platform/offline-ux.svelte';
import { ensureShareLinkBrotliReady } from '$lib/parsers/share-link/share-link-brotli';
import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';

export type PlatformBootstrapDeps = {
	shell: AppShellController;
	timetableScreen: TimetableScreenController;
};

export type PlatformBootstrapController = {
	init(pathname: string): () => void;
};

export function createPlatformBootstrap(deps: PlatformBootstrapDeps): PlatformBootstrapController {
	let started = false;
	let disposeEffects: (() => void) | null = null;
	let disposeOfflineUx: (() => void) | null = null;

	function init(pathname: string): () => void {
		if (started) return () => {};
		started = true;

		initNavigationStack(pathname);
		connectivity.init();
		void credentialEnvironment.init();
		deps.shell.init();
		deps.timetableScreen.init(deps.shell);
		void pwaInstallController.init();
		initWebVitals();
		initAnalytics();
		void ensureShareLinkBrotliReady();
		window.__chronosHideBootFallback?.();

		pwaInstallController.setInstallPromptGate(() => onboardingController.open);
		disposeOfflineUx = attachOfflineUx(connectivity);

		disposeEffects = $effect.root(() => {
			$effect(() => {
				document.documentElement.classList.toggle('dark', deps.shell.state.isDark);
				document.documentElement.classList.toggle(
					'theme-random',
					Boolean(deps.shell.state.appState.randomTheme)
				);
				document.documentElement.style.colorScheme = deps.shell.state.isDark ? 'dark' : 'light';
			});

			$effect(() => {
				if (deps.timetableScreen.state.hasLoadedAppState) {
					onboardingController.maybeShow(
						Boolean(deps.timetableScreen.state.appState.currentTimetable)
					);
				}
			});

			$effect(() => {
				if (!onboardingController.open) return;
				pwaInstallController.cancelScheduledDialog();
				pwaInstallController.dismiss({ track: false });
			});

			$effect(() => {
				if (onboardingController.open) return;
				pwaInstallController.tryScheduleInstallDialog();
			});
		});

		return () => {
			disposeEffects?.();
			disposeEffects = null;
			disposeOfflineUx?.();
			disposeOfflineUx = null;
			connectivity.destroy();
			started = false;
		};
	}

	return { init };
}
