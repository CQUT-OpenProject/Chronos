<script lang="ts">
	import type { AppLocale } from '@chronos/core';
	import {
		HOST_DEFAULT_ICON_THEME_ID,
		resolveLocalizedText,
		type CapsuleCornerStyle,
		type ThemeMode,
		type TimetableLayoutMode
	} from '@chronos/core';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { getAppEngine } from '$lib/services/app-engine';
	import { APP_LOCALES, applyAppLocale, normalizeAppLocale } from '$lib/i18n/locale-sync';
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
	const activeIconThemeId = $derived(
		shell.controller.userPreferences?.visualIconThemeId ?? HOST_DEFAULT_ICON_THEME_ID
	);
	const activeColorSchemeId = $derived(resolveColorSchemeId(paletteMode, visualThemeId));
	const activeLocale = $derived(
		normalizeAppLocale(shell.controller.userPreferences?.locale ?? shell.controller.currentLocale)
	);

	const iconThemeOptions = $derived.by(() => {
		void shell.controller.slotVersion;
		const builtin = {
			id: HOST_DEFAULT_ICON_THEME_ID,
			label: '默认',
			description: '使用应用内置导航图标'
		};
		const pluginIconThemes = getAppEngine()
			.iconThemes.getIconThemes()
			.map((theme) => ({
				id: theme.id,
				label: resolveLocalizedText(theme.name),
				description:
					typeof theme.description === 'function'
						? theme.description()
						: (theme.description ?? undefined)
			}));
		return [builtin, ...pluginIconThemes];
	});

	const colorSchemeOptions = $derived.by(() => {
		void shell.controller.slotVersion;

		const builtin = [
			{
				id: BUILTIN_COLOR_SCHEME_VIBRANT,
				label: '默认',
				description: '使用 Chronos 品牌配色',
				disabled: false
			}
		];

		const pluginThemes = getAppEngine()
			.themes.getThemes()
			.filter((theme) => theme.id !== 'm3-default')
			.map((theme) => {
				const isDynamicTheme = Boolean(theme.supportsDynamicColor);
				const isDisabled = isDynamicTheme
					? !hasDynamicColorBackground
					: typeof theme.disabled === 'function'
						? theme.disabled()
						: Boolean(theme.disabled);
				const defaultDesc = isDynamicTheme
					? hasDynamicColorBackground
						? '从当前壁纸提取配色'
						: '请先设置壁纸后再使用'
					: undefined;
				const desc =
					typeof theme.description === 'function'
						? theme.description()
						: (theme.description ?? defaultDesc);

				return {
					id: theme.id,
					label: resolveLocalizedText(theme.name),
					description: desc,
					disabled: isDisabled
				};
			});

		return [...builtin, ...pluginThemes];
	});

	const themeOptions = [
		{
			mode: 'light' as const,
			label: '亮色主题'
		},
		{
			mode: 'dark' as const,
			label: '暗色主题'
		},
		{
			mode: 'auto' as const,
			label: '跟随系统'
		}
	] as const;

	const layoutOptions = [
		{
			mode: 'fixed' as const,
			label: '滚动查看',
			description: '上下滚动查看完整课表，字体更大'
		},
		{
			mode: 'compact' as const,
			label: '一屏显示',
			description: '一屏展示全天课程，无需滚动'
		}
	] as const;

	const capsuleCornerOptions = [
		{
			mode: 'rounded' as const,
			label: '保留圆角',
			description: '四周保留完整圆角，保持原生样式'
		},
		{
			mode: 'pill' as const,
			label: '合并圆角',
			description: '相邻接触的课程边缘合并去圆角'
		},
		{
			mode: 'sharp' as const,
			label: '移除圆角',
			description: '移除四周圆角，呈现利落直角'
		}
	] as const;

	async function selectIconTheme(iconThemeId: string) {
		haptic.light();
		trackEvent('settings_icon_theme_change', { iconThemeId });
		await shell.setIconTheme(iconThemeId);
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
	<MineSection title="语言">
		{#each APP_LOCALES as option (option.id)}
			{@const selected = activeLocale === option.id}
			<MineRow label={true} title={option.label} onclick={() => selectLocale(option.id)}>
				{#snippet trailing()}
					<Radio name="app-locale" checked={selected} onchange={() => selectLocale(option.id)} />
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<MineSection title="主题模式">
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

	<MineSection title="配色方案">
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

	<MineSection title="图标主题">
		{#each iconThemeOptions as option (option.id)}
			{@const selected = activeIconThemeId === option.id}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
				onclick={() => selectIconTheme(option.id)}
			>
				{#snippet trailing()}
					<Radio name="icon-theme" checked={selected} onchange={() => selectIconTheme(option.id)} />
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>

	<MineSection title="主页显示样式">
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

	<MineSection title="课程胶囊样式">
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
