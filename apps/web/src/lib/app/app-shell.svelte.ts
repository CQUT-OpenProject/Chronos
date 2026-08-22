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

function resolveDark(themeMode: ThemeMode, systemPrefersDark: boolean): boolean {
	if (themeMode === 'dark') return true;
	if (themeMode === 'light') return false;
	return systemPrefersDark;
}

export function createAppShell() {
	let systemPrefersDark = $state(false);
	let mediaQueryCleanup: (() => void) | null = null;
	let dynamicColorCleanup: (() => void) | null = null;
	let dynamicColorUri = $state<string | null>(null);
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
	const hasDynamicColorBackground = $derived(Boolean(dynamicColorUri));

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

		dynamicColorCleanup?.();
		dynamicColorCleanup = engine.on('dynamicColor:changed', ({ uri }) => {
			dynamicColorUri = uri;
		}).dispose;
		engine.events.emit('dynamicColor:hydrate');
	}

	function destroy() {
		mediaQueryCleanup?.();
		mediaQueryCleanup = null;
		dynamicColorCleanup?.();
		dynamicColorCleanup = null;
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

	async function setDynamicColorAsset(assetBlob: Blob | null) {
		engine.events.emit('dynamicColor:set', { blob: assetBlob });
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
				hasDynamicColorBackground,
				dynamicColorUri
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
		setDynamicColorAsset,
		switchTimetable,
		deleteTimetable,
		clearAllData
	};
}

export type AppShellController = ReturnType<typeof createAppShell>;
