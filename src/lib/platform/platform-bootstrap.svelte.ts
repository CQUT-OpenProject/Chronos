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
import { PaletteMode } from '$lib/models/app-state';
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
	let wallpaperTheme: typeof import('$lib/m3/apply-wallpaper-theme') | null = null;

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
				const isDark = deps.shell.state.isDark;
				const paletteMode = deps.shell.state.appState.paletteMode;
				const wallpaperUri = deps.shell.state.appState.wallpaperUri;

				document.documentElement.classList.toggle('dark', isDark);
				document.documentElement.classList.toggle(
					'theme-random',
					paletteMode === PaletteMode.RANDOM
				);
				document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

				if (paletteMode !== PaletteMode.WALLPAPER || !wallpaperUri) {
					wallpaperTheme?.clearWallpaperTheme();
					deps.shell.setWallpaperCoursePalette(null);
					return;
				}

				let cancelled = false;
				void (async () => {
					try {
						wallpaperTheme ??= await import('$lib/m3/apply-wallpaper-theme');
						if (cancelled) return;
						const { seed, coursePalette } = await wallpaperTheme.extractWallpaperSeed(wallpaperUri);
						if (cancelled) return;
						wallpaperTheme.paintWallpaperTheme(seed, isDark);
						deps.shell.setWallpaperCoursePalette(coursePalette);
					} catch {
						if (cancelled) return;
						wallpaperTheme?.clearWallpaperTheme();
						deps.shell.setWallpaperCoursePalette(null);
					}
				})();

				return () => {
					cancelled = true;
				};
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
			wallpaperTheme?.clearWallpaperTheme();
			disposeOfflineUx?.();
			disposeOfflineUx = null;
			connectivity.destroy();
			started = false;
		};
	}

	return { init };
}
