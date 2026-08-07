<script lang="ts">
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { Download, Info, IosShare, ListAlt, Palette, Wallpaper } from '$lib/icons';

	const shell = getContext<AppShellController>('appShell');
	const hasWallpaper = $derived(shell.state.hasWallpaper);
</script>

<div class="m3-page p-4 pb-7">
	<h1 class="m3-page-title m3-headline-medium">我的</h1>

	<MineSection title="课表管理" accentColor="primary">
		<MineRow
			title="管理课程表"
			href={resolve('/manage-timetables')}
			icon={ListAlt}
			iconTone="primary"
		/>
	</MineSection>

	<MineSection title="数据与分享" accentColor="tertiary">
		<MineRow
			title="导入课程表"
			href={resolve('/transfer/import')}
			icon={Download}
			iconTone="secondary"
		/>
		<MineRow
			title="分享课程表（导出）"
			href={resolve('/transfer/export')}
			icon={IosShare}
			iconTone="tertiary"
		/>
	</MineSection>

	<MineSection title="个性化" accentColor="secondary">
		<MineRow
			title="主题设置"
			href={resolve('/theme-settings')}
			icon={Palette}
			iconTone="secondary"
		/>
		<MineRow
			title={hasWallpaper ? '壁纸设置' : '设置课表壁纸'}
			href={resolve('/wallpaper')}
			icon={Wallpaper}
			iconTone="primary"
		/>
	</MineSection>

	<MineSection title="关于与反馈" accentColor="tertiary">
		<MineRow title="关于 Chronos" href={resolve('/about')} icon={Info} iconTone="tertiary" />
	</MineSection>
</div>
