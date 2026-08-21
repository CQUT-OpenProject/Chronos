import type { AppShellController } from '$lib/app/app-shell.svelte';
import { credentialEnvironment } from '$lib/client/credential-environment.svelte';
import { connectivity } from '$lib/platform/connectivity.svelte';
import { onboardingController } from '$lib/client/onboarding.svelte';
import { pwaInstallController } from '$lib/client/pwa-install.svelte';
import { initAnalytics } from '$lib/client/analytics';
import { initWebVitals } from '$lib/client/web-vitals';
import { initNavigationStack } from '$lib/navigation/navigation-direction';
import { attachOfflineUx } from '$lib/platform/offline-ux.svelte';
import { applyActiveTheme } from '$lib/appearance/apply-active-theme';
import { ensureEngineReady, getAppEngine } from '$lib/services/app-engine';
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

		void ensureEngineReady().then(() => {
			deps.shell.init();
			deps.timetableScreen.init(deps.shell);
			void pwaInstallController.init();
			initWebVitals();
			initAnalytics();
			window.__chronosHideBootFallback?.();

			pwaInstallController.setInstallPromptGate(() => onboardingController.open);
			disposeOfflineUx = attachOfflineUx(connectivity);

			disposeEffects = $effect.root(() => {
				$effect(() => {
					const palette = deps.shell.appearance.coursePalette;
					deps.shell.controller.setCoursePalette(palette);
				});

				$effect(() => {
					const week = deps.timetableScreen.state.displayedWeek;
					deps.shell.controller.setDisplayedWeek(week);
				});

				$effect(() => {
					const isDark = deps.shell.state.isDark;
					const paletteMode = deps.shell.controller.userPreferences?.paletteMode ?? 'vibrant';
					const wallpaperUri = deps.shell.state.wallpaperUri;
					const activeThemeId = deps.shell.controller.activeThemeId;
					const engine = getAppEngine();

					applyActiveTheme(engine, activeThemeId, isDark, { paletteMode });

					const theme = engine.themes.getTheme(activeThemeId);
					const mode = isDark ? 'dark' : 'light';
					const themePaletteEntries =
						typeof theme?.paletteEntries === 'function'
							? theme.paletteEntries(mode)
							: (theme?.paletteEntries ?? null);

					const ac = new AbortController();
					void deps.shell.appearance.apply(
						{ isDark, paletteMode, wallpaperUri, activeThemeId, themePaletteEntries },
						ac.signal
					);
					return () => ac.abort();
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
			deps.shell.appearance.reset();
			disposeOfflineUx?.();
			disposeOfflineUx = null;
			connectivity.destroy();
			started = false;
		};
	}

	return { init };
}
