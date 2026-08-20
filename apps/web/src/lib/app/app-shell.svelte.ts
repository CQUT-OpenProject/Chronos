import { createAppearance } from '$lib/appearance/appearance.svelte';
import { buildColorSchemePatch } from '$lib/appearance/color-scheme';
import { type AppState } from '$lib/models/app-state';
import { getAppController, getAppEngine } from '$lib/services/app-engine';
import { createCredentialVault } from '$lib/client/credential-vault';
import { IVaultService } from '@chronos/core';
import type {
	CapsuleCornerStyle,
	PaletteMode,
	ThemeMode,
	TimetableLayoutMode,
	UserPreferences
} from '@chronos/core';

function resolveDark(themeMode: ThemeMode, systemPrefersDark: boolean): boolean {
	if (themeMode === 'dark') return true;
	if (themeMode === 'light') return false;
	return systemPrefersDark;
}

export function createAppShell() {
	let systemPrefersDark = $state(false);
	let mediaQueryCleanup: (() => void) | null = null;
	const appearance = createAppearance();
	const controller = getAppController();

	const themeMode = $derived(controller.userPreferences?.themeMode ?? 'auto');
	const timetableLayoutMode = $derived(controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const paletteMode = $derived(controller.userPreferences?.paletteMode ?? 'vibrant');
	const capsuleCornerStyle = $derived(controller.userPreferences?.capsuleCornerStyle ?? 'rounded');
	const hapticFeedbackEnabled = $derived(controller.userPreferences?.hapticFeedbackEnabled ?? true);

	const isDark = $derived(resolveDark(themeMode, systemPrefersDark));

	const hasWallpaperSlot = $derived.by(() => {
		void controller.slotVersion;
		return controller.getSlots('mine.item').some((s) => s.id === 'wallpaper');
	});
	const effectiveWallpaperUri = $derived(hasWallpaperSlot ? controller.wallpaperUri : null);
	const hasWallpaper = $derived(Boolean(effectiveWallpaperUri));

	const appState = $derived<AppState>({
		timetables: controller.timetables.map((t) => ({
			id: t.id,
			name: t.name,
			courseCount: t.courseCount ?? 0,
			createdAt: 0,
			updatedAt: t.updatedAt
		})),
		currentTimetableId: controller.currentTimetable?.id ?? null,
		wallpaperUri: effectiveWallpaperUri,
		currentTimetable: controller.currentTimetable,
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
		const engine = getAppEngine();
		const credentialVault = createCredentialVault({
			vault: engine.services.get(IVaultService)
		});
		await credentialVault.clear();
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
