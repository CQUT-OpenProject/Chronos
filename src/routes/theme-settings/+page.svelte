<script lang="ts">
	import { getContext } from 'svelte';
	import { ThemeMode } from '$lib/models/app-state';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { RadioAnim1 } from 'm3-svelte';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { AutoModeFill, DarkModeFill, LightModeFill } from '$lib/icons';

	const shell = getContext<AppShellController>('appShell');
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

<SecondaryPageShell title="主题设置" backHref="/mine">
	<MineSection title="主题模式" accentColor="primary">
		{#each options as option (option.mode)}
			<MineRow
				title={option.label}
				supporting={option.description}
				icon={option.Icon}
				iconTone={option.iconTone}
				onclick={() => selectMode(option.mode)}
			>
				{#snippet trailing()}
					<RadioAnim1>
						<input
							type="radio"
							name="theme-mode"
							checked={themeMode === option.mode}
							onchange={() => selectMode(option.mode)}
						/>
					</RadioAnim1>
				{/snippet}
			</MineRow>
		{/each}
	</MineSection>
</SecondaryPageShell>
