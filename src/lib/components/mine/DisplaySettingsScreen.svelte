<script lang="ts">
	import { ThemeMode, TimetableLayoutMode } from '$lib/models/app-state';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { trackEvent } from '$lib/client/analytics';
	import Radio from '$lib/components/ui/Radio.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import {
		AutoModeFill,
		DarkModeFill,
		FullscreenFill,
		LightModeFill,
		PaletteFill,
		ScheduleFill
	} from '$lib/icons';

	let { shell }: { shell: AppShellController } = $props();
	const themeMode = $derived(shell.state.appState.themeMode);
	const layoutMode = $derived(shell.state.appState.timetableLayoutMode);
	const randomTheme = $derived(shell.state.appState.randomTheme);

	const themeOptions = [
		{
			mode: ThemeMode.LIGHT,
			label: '亮色主题',
			description: '始终使用浅色界面',
			Icon: LightModeFill,
			iconTone: 'primary' as const
		},
		{
			mode: ThemeMode.DARK,
			label: '暗色主题',
			description: '始终使用深色界面',
			Icon: DarkModeFill,
			iconTone: 'primary' as const
		},
		{
			mode: ThemeMode.SYSTEM,
			label: '跟随系统',
			description: '根据系统外观自动切换',
			Icon: AutoModeFill,
			iconTone: 'primary' as const
		}
	] as const;

	const layoutOptions = [
		{
			mode: TimetableLayoutMode.SCROLL,
			label: '滚动查看',
			description: '上下滚动查看完整课表，字体更大',
			Icon: ScheduleFill,
			iconTone: 'secondary' as const
		},
		{
			mode: TimetableLayoutMode.FIT,
			label: '一屏显示',
			description: '无需滚动，一屏展示全天课程',
			Icon: FullscreenFill,
			iconTone: 'secondary' as const
		}
	] as const;

	async function selectThemeMode(mode: ThemeMode) {
		trackEvent('settings_theme_change', { mode });
		await shell.setThemeMode(mode);
	}

	async function selectLayoutMode(mode: TimetableLayoutMode) {
		trackEvent('settings_layout_change', { mode });
		await shell.setTimetableLayoutMode(mode);
	}

	async function selectRandomTheme(enabled: boolean) {
		await shell.setRandomTheme(enabled);
	}
</script>

<div class="flex flex-col gap-5">
	<MineSection title="主题模式">
		{#each themeOptions as option (option.mode)}
			{@const selected = themeMode === option.mode}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
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

	<MineSection title="配色">
		<MineRow
			label
			title="随机主题"
			supporting="随机生成的配色方案，不定时变更"
			icon={PaletteFill}
			iconTone="primary"
		>
			{#snippet trailing()}
				<Switch checked={randomTheme} onCheckedChange={selectRandomTheme} />
			{/snippet}
		</MineRow>
	</MineSection>

	<MineSection title="课表显示样式">
		{#each layoutOptions as option (option.mode)}
			{@const selected = layoutMode === option.mode}
			<MineRow
				label={true}
				title={option.label}
				supporting={option.description}
				icon={option.Icon}
				iconTone={option.iconTone}
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
</div>
