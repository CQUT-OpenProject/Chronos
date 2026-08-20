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
import { getRepository, getPreferencesRepository, clearAllAppData } from '$lib/client/repository';
import { getAppController } from '$lib/services/app-engine';

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
	const controller = getAppController();

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

		const repo = getRepository();
		unsubscribe = repo.subscribeAppState((state) => {
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
		await getPreferencesRepository().update(patch);
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
		const env = controller.rawEngine.env;
		if (env.storage.setWallpaper) {
			const bytes = wallpaper ? new Uint8Array(await wallpaper.arrayBuffer()) : null;
			await env.storage.setWallpaper(bytes);
		}
	}

	async function switchTimetable(id: string) {
		await controller.switchTimetable(id);
	}

	async function deleteTimetable(id: string) {
		await controller.deleteTimetable(id);
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
		get controller() {
			return controller;
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
		switchTimetable,
		deleteTimetable,
		clearAllData
	};
}

export type AppShellController = ReturnType<typeof createAppShell>;
