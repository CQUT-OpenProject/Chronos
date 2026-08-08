<script lang="ts">
	import { ThemeMode } from '$lib/models/app-state';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import Radio from '$lib/components/ui/Radio.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { AutoModeFill, DarkModeFill, LightModeFill } from '$lib/icons';

	let { shell }: { shell: AppShellController } = $props();
	const themeMode = $derived(shell.state.appState.themeMode);

	const options = [
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

	async function selectMode(mode: ThemeMode) {
		await shell.setThemeMode(mode);
	}
</script>

<MineSection title="主题模式" accentColor="primary">
	{#each options as option (option.mode)}
		{@const selected = themeMode === option.mode}
		<MineRow
			label={true}
			title={option.label}
			supporting={option.description}
			icon={option.Icon}
			iconTone={option.iconTone}
			onclick={() => selectMode(option.mode)}
		>
			{#snippet trailing()}
				<Radio name="theme-mode" checked={selected} onchange={() => selectMode(option.mode)} />
			{/snippet}
		</MineRow>
	{/each}
</MineSection>
