<script lang="ts">
	import { resolve } from '$app/paths';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import {
		DownloadFill,
		InfoFill,
		IosShareFill,
		ListAltFill,
		PaletteFill,
		WallpaperFill
	} from '$lib/icons';

	let { shell }: { shell: AppShellController } = $props();
	const hasWallpaper = $derived(shell.state.hasWallpaper);
</script>

<div class="m3-page flex flex-col gap-5 p-4 pt-3 pb-7">
	<h1 class="m3-page-title m3-headline-medium font-medium">我的</h1>

	<MineSection title="课表管理" accentColor="primary">
		<MineRow
			title="管理课程表"
			href={resolve('/manage-timetables')}
			icon={ListAltFill}
			iconTone="primary"
		/>
	</MineSection>

	<MineSection title="数据与分享" accentColor="tertiary">
		<MineRow
			title="导入课程表"
			href={resolve('/transfer/import')}
			icon={DownloadFill}
			iconTone="secondary"
		/>
		<MineRow
			title="分享课程表（导出）"
			href={resolve('/transfer/export')}
			icon={IosShareFill}
			iconTone="tertiary"
		/>
	</MineSection>

	<MineSection title="个性化" accentColor="secondary">
		<MineRow
			title="主题设置"
			href={resolve('/theme-settings')}
			icon={PaletteFill}
			iconTone="secondary"
		/>
		<MineRow
			title={hasWallpaper ? '壁纸设置' : '设置课表壁纸'}
			href={resolve('/wallpaper')}
			icon={WallpaperFill}
			iconTone="primary"
		/>
	</MineSection>

	<MineSection title="关于与反馈" accentColor="tertiary">
		<MineRow title="关于 Chronos" href={resolve('/about')} icon={InfoFill} iconTone="tertiary" />
	</MineSection>
</div>
