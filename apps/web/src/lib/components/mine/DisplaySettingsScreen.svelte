<script lang="ts">
	import type { AppLocale } from '@chronos/core';
	import {
		DEFAULT_VISUAL_THEME_ID,
		resolveLocalizedText,
		type CapsuleCornerStyle,
		type ThemeMode,
		type TimetableLayoutMode
	} from '@chronos/core';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { getAppEngine } from '$lib/services/app-engine';
	import { APP_LOCALES, applyAppLocale, normalizeAppLocale } from '$lib/i18n/locale-sync';
	import { hostText, hostTextRead } from '$lib/i18n/host-text';
	import { BUILTIN_COLOR_SCHEME_VIBRANT, resolveColorSchemeId } from '$lib/appearance/color-scheme';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { haptic } from '$lib/haptic/haptic';

	let { shell }: { shell: AppShellController } = $props();
	const themeMode = $derived(shell.controller.userPreferences?.themeMode ?? 'auto');
	const layoutMode = $derived(shell.controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const paletteMode = $derived(shell.controller.userPreferences?.paletteMode ?? 'vibrant');
	const capsuleCornerStyle = $derived(
		shell.controller.userPreferences?.capsuleCornerStyle ?? 'rounded'
	);
	const hasDynamicColorBackground = $derived(shell.state.hasDynamicColorBackground);
	const visualThemeId = $derived(shell.controller.activeThemeId);
	const activeColorSchemeId = $derived(resolveColorSchemeId(paletteMode, visualThemeId));
	const activeLocale = $derived(
		normalizeAppLocale(shell.controller.userPreferences?.locale ?? shell.controller.currentLocale)
	);

	const colorSchemeOptions = $derived.by(() => {
		void shell.controller.slotVersion;
		void shell.controller.currentLocale;

		const builtin = [
			{
				id: BUILTIN_COLOR_SCHEME_VIBRANT,
				label: hostText('display.builtin.default'),
				description: hostText('display.colorScheme.builtinDesc'),
				disabled: false
			}
		];

		const pluginThemes = getAppEngine()
			.themes.getThemes()
			.filter((theme) => theme.id !== DEFAULT_VISUAL_THEME_ID)
			.map((theme) => {
				const isDynamicTheme = Boolean(theme.supportsDynamicColor);
				const isDisabled = isDynamicTheme
					? !hasDynamicColorBackground
					: typeof theme.disabled === 'function'
						? theme.disabled()
						: Boolean(theme.disabled);
				const defaultDesc = isDynamicTheme
					? hasDynamicColorBackground
						? hostText('display.colorScheme.dynamicReady')
						: hostText('display.colorScheme.dynamicBlocked')
					: undefined;
				const desc = resolveLocalizedText(theme.description, defaultDesc);

				return {
					id: theme.id,
					label: resolveLocalizedText(theme.name),
					description: desc,
					disabled: isDisabled
				};
			});

		return [...builtin, ...pluginThemes];
	});

	const themeOptions = $derived.by(() => {
		void shell.controller.currentLocale;
		return [
			{ mode: 'light' as const, label: hostText('display.theme.light') },
			{ mode: 'dark' as const, label: hostText('display.theme.dark') },
			{ mode: 'auto' as const, label: hostText('display.theme.auto') }
		] as const;
	});

	const layoutOptions = $derived.by(() => {
		void shell.controller.currentLocale;
		return [
			{
				mode: 'fixed' as const,
				label: hostText('display.layout.fixed.label'),
				description: hostText('display.layout.fixed.desc')
			},
			{
				mode: 'compact' as const,
				label: hostText('display.layout.compact.label'),
				description: hostText('display.layout.compact.desc')
			}
		] as const;
	});

	const capsuleCornerOptions = $derived.by(() => {
		void shell.controller.currentLocale;
		return [
			{
				mode: 'rounded' as const,
				label: hostText('display.capsule.rounded.label'),
				description: hostText('display.capsule.rounded.desc')
			},
			{
				mode: 'pill' as const,
				label: hostText('display.capsule.pill.label'),
				description: hostText('display.capsule.pill.desc')
			},
			{
				mode: 'sharp' as const,
				label: hostText('display.capsule.sharp.label'),
				description: hostText('display.capsule.sharp.desc')
			}
		] as const;
	});

	function localeLabel(locale: AppLocale): string {
		return hostTextRead(
			shell.controller,
			locale === 'en' ? 'display.locale.en' : 'display.locale.zh-cn'
		);
	}

	async function selectColorScheme(schemeId: string) {
		const option = colorSchemeOptions.find((entry) => entry.id === schemeId);
		if (!option || option.disabled) return;
		haptic.light();
		trackEvent('settings_color_scheme_change', { schemeId });
		await shell.setColorScheme(schemeId);
	}

	async function selectThemeMode(mode: ThemeMode) {
		haptic.light();
		trackEvent('settings_theme_change', { mode });
		await shell.setThemeMode(mode);
	}

	async function selectLayoutMode(mode: TimetableLayoutMode) {
		haptic.light();
		trackEvent('settings_layout_change', { mode });
		await shell.setTimetableLayoutMode(mode);
	}

	async function selectCapsuleCornerStyle(style: CapsuleCornerStyle) {
		haptic.light();
		trackEvent('settings_capsule_corner_change', { style });
		await shell.setCapsuleCornerStyle(style);
	}

	async function selectLocale(locale: AppLocale) {
		haptic.light();
		trackEvent('settings_locale_change', { locale });
		await applyAppLocale(getAppEngine(), locale);
	}
</script>

<div class="flex flex-col gap-5">
	<MineSection title={hostTextRead(shell.controller, 'display.section.locale')}>
		{#each APP_LOCALES as option (option.id)}
			{@const selected = activeLocale === option.id}
			<MineRow label={true} title={localeLabel(option.id)} onclick={() => selectLocale(option.id)}>
				{#snippet trailing()}
					<Radio name="app-locale" checked={selected} onchange={() => selectLocale(option.id)} />
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<MineSection title={hostTextRead(shell.controller, 'display.section.themeMode')}>
		{#each themeOptions as option (option.mode)}
			{@const selected = themeMode === option.mode}
			<MineRow label={true} title={option.label} onclick={() => selectThemeMode(option.mode)}>
				{#snippet trailing()}
					<Radio
						name="theme-mode"
						checked={selected}
						onchange={() => selectThemeMode(option.mode)}
					/>
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<MineSection title={hostTextRead(shell.controller, 'display.section.colorScheme')}>
		{#each colorSchemeOptions as option (option.id)}
			{@const selected = activeColorSchemeId === option.id}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
				onclick={() => !option.disabled && selectColorScheme(option.id)}
			>
				{#snippet trailing()}
					<Radio
						name="color-scheme"
						checked={selected}
						disabled={option.disabled}
						onchange={() => selectColorScheme(option.id)}
					/>
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<MineSection title={hostTextRead(shell.controller, 'display.section.layout')}>
		{#each layoutOptions as option (option.mode)}
			{@const selected = layoutMode === option.mode}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
				onclick={() => selectLayoutMode(option.mode)}
			>
				{#snippet trailing()}
					<Radio
						name="timetable-layout-mode"
						checked={selected}
						onchange={() => selectLayoutMode(option.mode)}
					/>
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<MineSection title={hostTextRead(shell.controller, 'display.section.capsule')}>
		{#each capsuleCornerOptions as option (option.mode)}
			{@const selected = capsuleCornerStyle === option.mode}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
				onclick={() => selectCapsuleCornerStyle(option.mode)}
			>
				{#snippet trailing()}
					<Radio
						name="capsule-corner-style"
						checked={selected}
						onchange={() => selectCapsuleCornerStyle(option.mode)}
					/>
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>
</div>
