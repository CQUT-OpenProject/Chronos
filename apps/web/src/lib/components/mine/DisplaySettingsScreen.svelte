<script lang="ts">
	import {
		CapsuleCornerStyle,
		PaletteMode,
		ThemeMode,
		TimetableLayoutMode
	} from '$lib/models/app-state';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import {
		AutoModeFill,
		CasinoFill,
		DarkModeFill,
		LightModeFill,
		PaletteFill,
		WallpaperFill
	} from '$lib/icons';
	import { haptic } from '$lib/haptic/haptic';

	let { shell }: { shell: AppShellController } = $props();
	const themeMode = $derived(shell.state.appState.themeMode);
	const layoutMode = $derived(shell.state.appState.timetableLayoutMode);
	const paletteMode = $derived(shell.state.appState.paletteMode);
	const capsuleCornerStyle = $derived(shell.state.appState.capsuleCornerStyle);

	const themeOptions = [
		{
			mode: ThemeMode.LIGHT,
			label: '亮色主题',
			Icon: LightModeFill,
			iconTone: 'primary' as const
		},
		{
			mode: ThemeMode.DARK,
			label: '暗色主题',
			Icon: DarkModeFill,
			iconTone: 'primary' as const
		},
		{
			mode: ThemeMode.SYSTEM,
			label: '跟随系统',
			Icon: AutoModeFill,
			iconTone: 'primary' as const
		}
	] as const;

	const paletteOptions = [
		{
			mode: PaletteMode.DEFAULT,
			label: '默认',
			description: '使用 Chronos 品牌配色',
			Icon: PaletteFill,
			iconTone: 'primary' as const
		},
		{
			mode: PaletteMode.WALLPAPER,
			label: '壁纸',
			description: '从当前壁纸提取配色',
			Icon: WallpaperFill,
			iconTone: 'primary' as const
		},
		{
			mode: PaletteMode.RANDOM,
			label: '随机',
			description: '随机生成的配色方案，不定时变更',
			Icon: CasinoFill,
			iconTone: 'primary' as const
		}
	] as const;

	const layoutOptions = [
		{
			mode: TimetableLayoutMode.SCROLL,
			label: '滚动查看',
			description: '上下滚动查看完整课表，字体更大'
		},
		{
			mode: TimetableLayoutMode.FIT,
			label: '一屏显示',
			description: '一屏展示全天课程，无需滚动'
		}
	] as const;

	const capsuleCornerOptions = [
		{
			mode: CapsuleCornerStyle.ROUNDED,
			label: '保留圆角',
			description: '四周保留完整圆角，保持原生样式'
		},
		{
			mode: CapsuleCornerStyle.MERGE,
			label: '合并圆角',
			description: '相邻接触的课程边缘合并去圆角'
		},
		{
			mode: CapsuleCornerStyle.SQUARE,
			label: '移除圆角',
			description: '移除四周圆角，呈现利落直角'
		}
	] as const;

	async function selectThemeMode(mode: ThemeMode) {
		haptic.light();
		trackEvent('settings_theme_change', { mode });
		await shell.setThemeMode(mode);
	}

	async function selectPaletteMode(mode: PaletteMode) {
		haptic.light();
		trackEvent('settings_color_scheme_change', { mode });
		await shell.setPaletteMode(mode);
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
			<MineRow
				label={true}
				title={option.label}
				icon={option.Icon}
				iconTone={option.iconTone}
				onclick={() => selectThemeMode(option.mode)}
			>
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
		{#each paletteOptions as option (option.mode)}
			{@const selected = paletteMode === option.mode}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
				icon={option.Icon}
				iconTone={option.iconTone}
				onclick={() => selectPaletteMode(option.mode)}
			>
				{#snippet trailing()}
					<Radio
						name="palette-mode"
						checked={selected}
						onchange={() => selectPaletteMode(option.mode)}
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
