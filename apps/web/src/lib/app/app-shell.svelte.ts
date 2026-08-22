import { createAppearance } from '$lib/appearance/appearance.svelte';
import { buildColorSchemePatch } from '$lib/appearance/color-scheme';
import { getAppController, getAppEngine } from '$lib/services/app-engine';
import type {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode,
	UserPreferences
} from '@chronos/core';

const WALLPAPER_PLUGIN_ID = 'tool-wallpaper';

function resolveDark(themeMode: ThemeMode, systemPrefersDark: boolean): boolean {
	if (themeMode === 'dark') return true;
	if (themeMode === 'light') return false;
	return systemPrefersDark;
}

export function createAppShell() {
	let systemPrefersDark = $state(false);
	let mediaQueryCleanup: (() => void) | null = null;
	let wallpaperChangeCleanup: (() => void) | null = null;
	let wallpaperUri = $state<string | null>(null);
	const appearance = createAppearance();
	const controller = getAppController();
	const engine = getAppEngine();

	const themeMode = $derived(controller.userPreferences?.themeMode ?? 'auto');
	const isDark = $derived(resolveDark(themeMode, systemPrefersDark));

	const initialized = $derived(
		Boolean(
			controller.userPreferences !== null ||
			controller.currentTimetable !== null ||
			controller.timetables.length > 0
		)
	);
	const hasWallpaperPlugin = $derived.by(() => {
		void controller.slotVersion;
		return engine.isPluginLoaded(WALLPAPER_PLUGIN_ID);
	});
	const hasWallpaper = $derived(hasWallpaperPlugin && Boolean(wallpaperUri));

	function init() {
		if (typeof window !== 'undefined' && !mediaQueryCleanup) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			systemPrefersDark = mediaQuery.matches;
			const onChange = (event: MediaQueryListEvent) => {
				systemPrefersDark = event.matches;
			};
			mediaQuery.addEventListener('change', onChange);
			mediaQueryCleanup = () => mediaQuery.removeEventListener('change', onChange);
		}

		wallpaperChangeCleanup?.();
		wallpaperChangeCleanup = engine.on('wallpaper:changed', ({ uri }) => {
			wallpaperUri = uri;
		}).dispose;
		engine.events.emit('wallpaper:hydrate');
	}

	function destroy() {
		mediaQueryCleanup?.();
		mediaQueryCleanup = null;
		wallpaperChangeCleanup?.();
		wallpaperChangeCleanup = null;
	}

	async function updatePreferences(patch: Partial<UserPreferences>) {
		await controller.updatePreferences(patch);
	}

	async function setColorScheme(schemeId: string) {
		const patch = buildColorSchemePatch(schemeId);
		controller.setTheme(patch.themeId);
		await updatePreferences({
			paletteMode: patch.paletteMode,
			visualThemeId: patch.visualThemeId
		});
	}

	async function setVisualTheme(themeId: string) {
		controller.setTheme(themeId);
		await updatePreferences({ visualThemeId: themeId });
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

	async function setWallpaper(wallpaperBlob: Blob | null) {
		engine.events.emit('wallpaper:set', { blob: wallpaperBlob });
	}

	async function switchTimetable(id: string) {
		await controller.switchTimetable(id);
	}

	async function deleteTimetable(id: string) {
		await controller.deleteTimetable(id);
	}

	async function clearAllData() {
		await controller.clearAllData();
	}

	return {
		get state() {
			return {
				initialized,
				isDark,
				hasWallpaperPlugin,
				hasWallpaper,
				wallpaperUri
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
		setColorScheme,
		setVisualTheme,
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
