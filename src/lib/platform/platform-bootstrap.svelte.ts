import type { AppShellController } from '$lib/app/app-shell.svelte';
import { credentialEnvironment } from '$lib/client/credential-environment.svelte';
import { networkStatus } from '$lib/client/network-status.svelte';
import { onboardingController } from '$lib/client/onboarding.svelte';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';
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
		networkStatus.init();
		void credentialEnvironment.init();
		deps.shell.init();
		deps.timetableScreen.init(deps.shell);
		void pwaInstallController.init();
		initWebVitals();
		void ensureShareLinkBrotliReady();
		window.__chronosHideBootFallback?.();

		pwaInstallController.setInstallPromptGate(() => onboardingController.open);
		disposeOfflineUx = attachOfflineUx(networkStatus);

		disposeEffects = $effect.root(() => {
			$effect(() => {
				document.documentElement.classList.toggle('dark', deps.shell.state.isDark);
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
				pwaInstallController.dismiss();
			});
		});

		return () => {
			disposeEffects?.();
			disposeEffects = null;
			disposeOfflineUx?.();
			disposeOfflineUx = null;
			networkStatus.destroy();
			started = false;
		};
	}

	return { init };
}
