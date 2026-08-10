<script lang="ts">
	import { resolve } from '$app/paths';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow, { type MineIconTone } from '$lib/components/mine/MineRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import type { Component } from 'svelte';
	import {
		AddHomeFill,
		DownloadFill,
		InfoFill,
		IosShareFill,
		ListAltFill,
		PaletteFill,
		WallpaperFill
	} from '$lib/icons';

	let { shell }: { shell: AppShellController } = $props();

	let searchQuery = $state('');

	type SettingItem = {
		id: string;
		title: string;
		supporting?: string;
		href: string;
		icon: Component<{ class?: string }>;
		iconTone: MineIconTone;
		keywords: string[];
	};

	type SettingSection = {
		title: string;
		items: SettingItem[];
	};

	const sections = $derived<SettingSection[]>([
		{
			title: '课表管理',
			items: [
				{
					id: 'manage-timetables',
					title: '管理课程表',
					href: resolve('/manage-timetables'),
					icon: ListAltFill,
					iconTone: 'primary',
					keywords: ['课表', '管理', '切换', '编辑', '课程']
				}
			]
		},
		{
			title: '数据与分享',
			items: [
				{
					id: 'import',
					title: '导入课程表',
					href: resolve('/transfer/import'),
					icon: DownloadFill,
					iconTone: 'secondary',
					keywords: ['导入', '数据', '共享', '文件', '扫码', '课表']
				},
				{
					id: 'export',
					title: '分享课程表',
					href: resolve('/transfer/export'),
					icon: IosShareFill,
					iconTone: 'tertiary',
					keywords: ['导出', '分享', '备份', '数据', '链接', '二维码']
				}
			]
		},
		{
			title: '个性化',
			items: [
				{
					id: 'theme',
					title: '主题设置',
					href: resolve('/theme-settings'),
					icon: PaletteFill,
					iconTone: 'secondary',
					keywords: ['主题', '外观', '深色', '夜间', '亮色', '白天', '模式', '颜色', '跟随系统']
				},
				{
					id: 'wallpaper',
					title: '设置课表壁纸',
					href: resolve('/wallpaper'),
					icon: WallpaperFill,
					iconTone: 'primary',
					keywords: ['壁纸', '背景', '图片', '自定义', '封面']
				}
			]
		},
		{
			title: '应用与支持',
			items: [
				{
					id: 'install',
					title: '安装 Chronos',
					supporting: pwaInstallController.isStandalone
						? '已安装为桌面应用'
						: pwaInstallController.isInstalledLocally
							? '已安装，可在应用中打开'
							: '添加到主屏幕，快捷打开应用',
					href: resolve('/about/install'),
					icon: AddHomeFill,
					iconTone: 'primary',
					keywords: ['安装', 'PWA', '桌面', '应用', '主屏幕', '快捷', '下载']
				},
				{
					id: 'about',
					title: '关于 Chronos',
					href: resolve('/about'),
					icon: InfoFill,
					iconTone: 'tertiary',
					keywords: ['关于', '版本', '开源', '协议', '许可', '开发者', '更新', '说明']
				}
			]
		}
	]);

	const filteredSections = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return sections;

		return sections
			.map((section) => {
				const matchingItems = section.items.filter((item) => {
					const titleMatch = item.title.toLowerCase().includes(query);
					const supportingMatch = item.supporting?.toLowerCase().includes(query);
					const keywordMatch = item.keywords.some((kw) => kw.toLowerCase().includes(query));
					return titleMatch || supportingMatch || keywordMatch;
				});

				return {
					...section,
					items: matchingItems
				};
			})
			.filter((section) => section.items.length > 0);
	});
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 p-4 pt-3 pb-7 text-on-surface">
	<div class="flex flex-col gap-3">
		<h1 class="m3-page-title m3-headline-medium font-medium">我的</h1>

		<SearchField bind:value={searchQuery} placeholder="搜索设置..." />
	</div>

	{#each filteredSections as section (section.title)}
		<MineSection title={section.title}>
			{#each section.items as item (item.id)}
				<MineRow
					title={item.title}
					supporting={item.supporting}
					href={item.href}
					icon={item.icon}
					iconTone={item.iconTone}
				/>
			{/each}
		</MineSection>
	{:else}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="m3-body-medium text-on-surface-variant">未找到“{searchQuery}”相关设置</p>
			<Button variant="text" class="mt-2" onclick={() => (searchQuery = '')}>清空搜索词</Button>
		</div>
	{/each}
</div>
