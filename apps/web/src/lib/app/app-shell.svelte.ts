import { createAppearance } from '$lib/appearance/appearance.svelte';
import { applyActiveTheme } from '$lib/appearance/apply-active-theme';
import { buildColorSchemePatch } from '$lib/appearance/color-scheme';
import { getAppController, getAppEngine, resetAppToInitialState } from '$lib/services/app-engine';
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
	let disposeAppearanceEffects: (() => void) | null = null;
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
		const dynamicColorSub = engine.on('dynamicColor:changed', ({ uri }) => {
			dynamicColorUri = uri;
		});
		dynamicColorCleanup = () => dynamicColorSub.dispose();
		engine.events.emit('dynamicColor:hydrate', undefined);

		// The appearance pipeline lives here (not in platform-bootstrap): this
		// controller already owns engine/theme/preference reactivity, so the
		// effects read their inputs locally instead of being relayed across
		// controllers.
		disposeAppearanceEffects?.();
		disposeAppearanceEffects = $effect.root(() => {
			$effect(() => {
				controller.setCoursePalette(appearance.coursePalette);
			});

			$effect(() => {
				const dark = isDark;
				const paletteMode = controller.userPreferences?.paletteMode ?? 'vibrant';
				const activeThemeId = controller.activeThemeId;

				applyActiveTheme(engine, activeThemeId, dark, { paletteMode });

				const theme = engine.themes.getTheme(activeThemeId);
				const mode = dark ? 'dark' : 'light';
				const themePaletteEntries =
					typeof theme?.paletteEntries === 'function'
						? theme.paletteEntries(mode)
						: (theme?.paletteEntries ?? null);

				const ac = new AbortController();
				void appearance.apply(
					{
						isDark: dark,
						paletteMode,
						dynamicColorUri,
						activeThemeId,
						themePaletteEntries
					},
					ac.signal
				);
				return () => ac.abort();
			});
		});
	}

	function destroy() {
		mediaQueryCleanup?.();
		mediaQueryCleanup = null;
		dynamicColorCleanup?.();
		dynamicColorCleanup = null;
		disposeAppearanceEffects?.();
		disposeAppearanceEffects = null;
	}

	async function updatePreferences(patch: Partial<UserPreferences>) {
		await controller.updatePreferences(patch);
	}

	async function setColorScheme(schemeId: string) {
		const patch = buildColorSchemePatch(schemeId);
		const engine = getAppEngine();
		const theme = engine.themes.getTheme(patch.visualThemeId);
		const iconPatch: Partial<UserPreferences> = {
			paletteMode: patch.paletteMode,
			visualThemeId: patch.visualThemeId
		};
		if (theme?.recommendedIconTheme && engine.iconThemes.getIconTheme(theme.recommendedIconTheme)) {
			iconPatch.visualIconThemeId = theme.recommendedIconTheme;
		}
		controller.setTheme(patch.themeId);
		await updatePreferences(iconPatch);
	}

	async function setIconTheme(iconThemeId: string) {
		await updatePreferences({ visualIconThemeId: iconThemeId });
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

	async function switchTimetable(id: string) {
		await controller.switchTimetable(id);
	}

	async function deleteTimetable(id: string) {
		await controller.deleteTimetable(id);
	}

	async function clearAllData() {
		await resetAppToInitialState();
		dynamicColorUri = null;
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
		setIconTheme,
		setVisualTheme,
		setTimetableLayoutMode,
		setPaletteMode,
		setCapsuleCornerStyle,
		setHapticFeedbackEnabled,
		switchTimetable,
		deleteTimetable,
		clearAllData
	};
}

export type AppShellController = ReturnType<typeof createAppShell>;
