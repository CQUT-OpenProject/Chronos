<script lang="ts">
	import type { CapsuleCornerStyle, ThemeMode, TimetableLayoutMode } from '@chronos/core';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import { getAppEngine } from '$lib/services/app-engine';
	import {
		BUILTIN_COLOR_SCHEME_VIBRANT,
		BUILTIN_COLOR_SCHEME_WALLPAPER,
		resolveColorSchemeId
	} from '$lib/appearance/color-scheme';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { haptic } from '$lib/haptic/haptic';

	let { shell }: { shell: AppShellController } = $props();
	const themeMode = $derived(shell.state.appState.themeMode);
	const layoutMode = $derived(shell.state.appState.timetableLayoutMode);
	const paletteMode = $derived(shell.state.appState.paletteMode);
	const capsuleCornerStyle = $derived(shell.state.appState.capsuleCornerStyle);
	const hasWallpaper = $derived(shell.state.hasWallpaper);
	const visualThemeId = $derived(shell.controller.activeThemeId);
	const activeColorSchemeId = $derived(resolveColorSchemeId(paletteMode, visualThemeId));

	const colorSchemeOptions = $derived.by(() => {
		const builtin = [
			{
				id: BUILTIN_COLOR_SCHEME_VIBRANT,
				label: '默认',
				description: '使用 Chronos 品牌配色',
				disabled: false
			},
			{
				id: BUILTIN_COLOR_SCHEME_WALLPAPER,
				label: '壁纸',
				description: hasWallpaper ? '从当前壁纸提取配色' : '请先设置壁纸后再使用',
				disabled: !hasWallpaper
			}
		];

		const pluginThemes = getAppEngine()
			.themes.getThemes()
			.filter((theme) => theme.id !== 'm3-default')
			.map((theme) => ({
				id: theme.id,
				label: theme.name(),
				description: undefined as string | undefined,
				disabled: false
			}));

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
</script>

<div class="flex flex-col gap-5">
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
