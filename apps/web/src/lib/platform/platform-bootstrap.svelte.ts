import type { AppShellController } from '$lib/app/app-shell.svelte';
import { connectivity } from '$lib/platform/connectivity.svelte';
import { onboardingController } from '$lib/client/onboarding.svelte';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';
import { initAnalytics } from '$lib/client/analytics';
import { initNavigationStack } from '$lib/navigation/navigation-direction';
import { attachOfflineUx } from '$lib/platform/offline-ux.svelte';
import { ensureEngineReady } from '$lib/services/app-engine';
import { configureHostI18n } from '$lib/i18n/host-i18n.svelte';
import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
import { registerHyperellipse } from 'hyperellipse';

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
		registerHyperellipse();
		connectivity.init();

		void ensureEngineReady().then((engine) => {
			configureHostI18n({
				onLocaleChanged: (handler) => engine.events.on('i18n:localeChanged', handler)
			});
			deps.shell.init();
			deps.timetableScreen.init(deps.shell);
			void pwaInstallController.init();
			initAnalytics();
			window.__chronosHideBootFallback?.();

			pwaInstallController.setInstallPromptGate(() => onboardingController.open);
			disposeOfflineUx = attachOfflineUx(connectivity);

			disposeEffects = $effect.root(() => {
				$effect(() => {
					const week = deps.timetableScreen.state.displayedWeek;
					deps.shell.controller.setDisplayedWeek(week);
				});

				$effect(() => {
					if (deps.timetableScreen.state.hasLoadedAppState) {
						onboardingController.maybeShow(Boolean(deps.timetableScreen.state.currentTimetable));
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
		});

		return () => {
			disposeEffects?.();
			disposeEffects = null;
			deps.shell.appearance.destroy();
			disposeOfflineUx?.();
			disposeOfflineUx = null;
			connectivity.destroy();
			started = false;
		};
	}

	return { init };
}
