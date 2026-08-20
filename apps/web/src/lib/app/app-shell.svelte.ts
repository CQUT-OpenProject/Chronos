import { createAppearance } from '$lib/appearance/appearance.svelte';
import {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode,
	type AppState,
	type UserPreferences,
	themeModeFromStorage,
	timetableLayoutModeFromStorage,
	paletteModeFromStorage,
	capsuleCornerStyleFromStorage
} from '$lib/models/app-state';
import { getAppController } from '$lib/services/app-engine';
import type {
	ThemeMode as CoreThemeMode,
	PaletteMode as CorePaletteMode,
	TimetableLayoutMode as CoreLayoutMode,
	CapsuleCornerStyle as CoreCornerStyle
} from '@chronos/core';

function resolveDark(themeMode: ThemeMode, systemPrefersDark: boolean): boolean {
	if (themeMode === ThemeMode.DARK) return true;
	if (themeMode === ThemeMode.LIGHT) return false;
	return systemPrefersDark;
}

export function createAppShell() {
	let systemPrefersDark = $state(false);
	let mediaQueryCleanup: (() => void) | null = null;
	const appearance = createAppearance();
	const controller = getAppController();

	const themeMode = $derived(themeModeFromStorage(controller.userPreferences?.themeMode));
	const timetableLayoutMode = $derived(
		timetableLayoutModeFromStorage(
			controller.userPreferences?.timetableLayoutMode === 'compact' ? 'fit' : 'scroll'
		)
	);
	const paletteMode = $derived(
		paletteModeFromStorage(
			controller.userPreferences?.paletteMode === 'wallpaper' ? 'wallpaper' : 'default'
		)
	);
	const capsuleCornerStyle = $derived(
		capsuleCornerStyleFromStorage(controller.userPreferences?.capsuleCornerStyle)
	);
	const hapticFeedbackEnabled = $derived(controller.userPreferences?.hapticFeedbackEnabled ?? true);

	const isDark = $derived(resolveDark(themeMode, systemPrefersDark));
	const hasWallpaper = $derived(Boolean(controller.wallpaperUri));

	const appState = $derived<AppState>({
		timetables: controller.timetables.map((t) => ({
			id: t.id,
			name: t.name,
			courseCount: t.courseCount ?? 0,
			createdAt: 0,
			updatedAt: t.updatedAt
		})),
		currentTimetableId: controller.currentTimetable?.id ?? null,
		wallpaperUri: controller.wallpaperUri,
		currentTimetable: controller.currentTimetable as unknown as
			| import('$lib/models/timetable').Timetable
			| null,
		themeMode,
		timetableLayoutMode,
		paletteMode,
		capsuleCornerStyle,
		hapticFeedbackEnabled
	});

	const initialized = $derived(
		Boolean(
			controller.userPreferences !== null ||
			controller.currentTimetable !== null ||
			controller.timetables.length > 0
		)
	);

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
		void controller.loadWallpaper();
	}

	function destroy() {
		mediaQueryCleanup?.();
		mediaQueryCleanup = null;
	}

	async function updatePreferences(patch: Partial<UserPreferences>) {
		const corePatch: Partial<import('@chronos/core').UserPreferences> = {};
		if (patch.themeMode !== undefined) {
			corePatch.themeMode = (
				patch.themeMode === ThemeMode.DARK
					? 'dark'
					: patch.themeMode === ThemeMode.LIGHT
						? 'light'
						: 'auto'
			) as CoreThemeMode;
		}
		if (patch.timetableLayoutMode !== undefined) {
			corePatch.timetableLayoutMode = (
				patch.timetableLayoutMode === TimetableLayoutMode.FIT ? 'compact' : 'fixed'
			) as CoreLayoutMode;
		}
		if (patch.paletteMode !== undefined) {
			corePatch.paletteMode = (
				patch.paletteMode === PaletteMode.WALLPAPER ? 'wallpaper' : 'vibrant'
			) as CorePaletteMode;
		}
		if (patch.capsuleCornerStyle !== undefined) {
			corePatch.capsuleCornerStyle = (
				patch.capsuleCornerStyle === CapsuleCornerStyle.SQUARE
					? 'sharp'
					: patch.capsuleCornerStyle === CapsuleCornerStyle.MERGE
						? 'pill'
						: 'rounded'
			) as CoreCornerStyle;
		}
		if (patch.hapticFeedbackEnabled !== undefined) {
			corePatch.hapticFeedbackEnabled = patch.hapticFeedbackEnabled;
		}
		await controller.updatePreferences(corePatch);
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
		await controller.setWallpaper(wallpaper);
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
