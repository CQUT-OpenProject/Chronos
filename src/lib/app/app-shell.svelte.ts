import { createAppearance } from '$lib/appearance/appearance.svelte';
import {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode,
	type AppState,
	type UserPreferences,
	emptyAppState
} from '$lib/models/app-state';
import { createAppServices, type AppServices } from '$lib/client/app-services';
import { clearAllAppData } from '$lib/client/repository';

function resolveDark(themeMode: ThemeMode, systemPrefersDark: boolean): boolean {
	if (themeMode === ThemeMode.DARK) return true;
	if (themeMode === ThemeMode.LIGHT) return false;
	return systemPrefersDark;
}

export function createAppShell() {
	let appState = $state<AppState>(emptyAppState());
	let initialized = $state(false);
	let systemPrefersDark = $state(false);
	let unsubscribe: (() => void) | null = null;
	let mediaQueryCleanup: (() => void) | null = null;
	const appearance = createAppearance();
	let services: AppServices | null = null;

	function getServices() {
		services ??= createAppServices();
		return services;
	}

	const isDark = $derived(resolveDark(appState.themeMode, systemPrefersDark));
	const hasWallpaper = $derived(Boolean(appState.wallpaperUri));

	function init() {
		if (unsubscribe) return;

		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			systemPrefersDark = mediaQuery.matches;
			const onChange = (event: MediaQueryListEvent) => {
				systemPrefersDark = event.matches;
			};
			mediaQuery.addEventListener('change', onChange);
			mediaQueryCleanup = () => mediaQuery.removeEventListener('change', onChange);
		}

		unsubscribe = getServices().repository.subscribeAppState((state) => {
			appState = state;
			initialized = true;
		});
	}

	function destroy() {
		unsubscribe?.();
		unsubscribe = null;
		mediaQueryCleanup?.();
		mediaQueryCleanup = null;
	}

	async function updatePreferences(patch: Partial<UserPreferences>) {
		await getServices().preferences.update(patch);
	}

	async function setThemeMode(mode: ThemeMode) {
		await updatePreferences({ themeMode: mode });
	}

	async function setTimetableLayoutMode(mode: TimetableLayoutMode) {
		await updatePreferences({ timetableLayoutMode: mode });
	}

	async function setPaletteMode(mode: PaletteMode) {
		await updatePreferences({ paletteMode: mode });
	}

	async function setCapsuleCornerStyle(style: CapsuleCornerStyle) {
		await updatePreferences({ capsuleCornerStyle: style });
	}

	async function setHapticFeedbackEnabled(enabled: boolean) {
		await updatePreferences({ hapticFeedbackEnabled: enabled });
	}

	async function setWallpaper(wallpaper: Blob | null) {
		await getServices().preferences.setWallpaper(wallpaper);
	}

	async function clearAllData() {
		await clearAllAppData();
	}

	return {
		get state() {
			return {
				appState,
				initialized,
				isDark,
				hasWallpaper
			};
		},
		get appearance() {
			return appearance;
		},
		init,
		destroy,
		updatePreferences,
		setThemeMode,
		setTimetableLayoutMode,
		setPaletteMode,
		setCapsuleCornerStyle,
		setHapticFeedbackEnabled,
		setWallpaper,
		clearAllData,
		get services() {
			return getServices();
		}
	};
}

export type AppShellController = ReturnType<typeof createAppShell>;
