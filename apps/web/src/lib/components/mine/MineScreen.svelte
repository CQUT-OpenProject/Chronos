<script lang="ts">
	import { resolve } from '$app/paths';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow, { type MineIconTone } from '$lib/components/mine/MineRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';
	import { pwaInstallController } from '$lib/client/pwa-install.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import type { Component } from 'svelte';
	import {
		AddHomeFill,
		DownloadFill,
		InfoFill,
		IosShareFill,
		ListAltFill,
		MobileVibrateFill,
		PaletteFill,
		WallpaperFill,
		CodeFill
	} from '$lib/icons';

	let { shell }: { shell: AppShellController } = $props();

	const controller = getAppController();
	let searchQuery = $state('');

	type SettingItem = {
		id: string;
		title: string;
		supporting?: string;
		href?: string;
		onClick?: () => void | Promise<void>;
		icon?: Component<{ class?: string }>;
		iconTone?: MineIconTone;
		keywords?: string[];
		order?: number;
	};

	type SettingSection = {
		id: string;
		title: string;
		order?: number;
		items: SettingItem[];
	};

	function resolveText(text: string | (() => string) | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	const pluginSections = $derived(controller.getSlots('mine.section'));
	const pluginItems = $derived(controller.getSlots('mine.item'));

	const baseSections: SettingSection[] = [
		{
			id: 'timetable-management',
			title: '课表管理',
			order: 10,
			items: [
				{
					id: 'manage-timetables',
					title: '管理课程表',
					href: resolve('/manage-timetables'),
					icon: ListAltFill,
					iconTone: 'primary',
					keywords: ['课表', '管理', '切换', '编辑', '课程'],
					order: 10
				}
			]
		},
		{
			id: 'data-sync',
			title: '数据与分享',
			order: 20,
			items: [
				{
					id: 'import',
					title: '导入课程表',
					href: resolve('/transfer/import'),
					icon: DownloadFill,
					iconTone: 'secondary',
					keywords: ['导入', '数据', '共享', '文件', '扫码', '课表'],
					order: 10
				},
				{
					id: 'export',
					title: '分享课程表',
					href: resolve('/transfer/export'),
					icon: IosShareFill,
					iconTone: 'tertiary',
					keywords: ['导出', '分享', '备份', '数据', '链接', '二维码'],
					order: 20
				}
			]
		},
		{
			id: 'appearance-feedback',
			title: '个性化',
			order: 30,
			items: [
				{
					id: 'display',
					title: '显示设置',
					href: resolve('/display-settings'),
					icon: PaletteFill,
					iconTone: 'secondary',
					keywords: [
						'主题',
						'显示',
						'外观',
						'深色',
						'夜间',
						'亮色',
						'白天',
						'模式',
						'颜色',
						'跟随系统',
						'滚动',
						'一屏',
						'布局',
						'课表',
						'配色',
						'配色方案',
						'随机'
					],
					order: 10
				},
				{
					id: 'feedback',
					title: '反馈设置',
					href: resolve('/feedback-settings'),
					icon: MobileVibrateFill,
					iconTone: 'tertiary',
					keywords: ['反馈', '震动', '振动', '触感', '马达', '声音', '音效', 'haptic', 'feedback'],
					order: 20
				},
				{
					id: 'wallpaper',
					title: '设置课表壁纸',
					href: resolve('/wallpaper'),
					icon: WallpaperFill,
					iconTone: 'primary',
					keywords: ['壁纸', '背景', '图片', '自定义', '封面'],
					order: 30
				}
			]
		},
		{
			id: 'app-support',
			title: '应用与支持',
			order: 40,
			items: [
				{
					id: 'plugins',
					title: '插件中心',
					supporting: '管理已安装插件与在线市场',
					href: resolve('/plugins'),
					icon: CodeFill,
					iconTone: 'secondary',
					keywords: ['插件', '市场', '扩展', 'plugin', 'marketplace', '主题', '工具', '同步'],
					order: 5
				},
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
					keywords: ['安装', 'PWA', '桌面', '应用', '主屏幕', '快捷', '下载'],
					order: 10
				},
				{
					id: 'about',
					title: '关于 Chronos',
					href: resolve('/about'),
					icon: InfoFill,
					iconTone: 'tertiary',
					keywords: ['关于', '版本', '开源', '协议', '许可', '开发者', '更新', '说明'],
					order: 20
				}
			]
		}
	];

	const sections = $derived.by(() => {
		const sectionMap: Record<string, SettingSection> = {};
		for (const sec of baseSections) {
			sectionMap[sec.id] = {
				id: sec.id,
				title: sec.title,
				order: sec.order ?? 50,
				items: [...sec.items]
			};
		}

		for (const pSec of pluginSections) {
			if (!sectionMap[pSec.id]) {
				sectionMap[pSec.id] = {
					id: pSec.id,
					title: resolveText(pSec.title),
					order: pSec.order ?? 50,
					items: []
				};
			}
		}

		for (const item of pluginItems) {
			const targetSectionId = item.sectionId || 'app-support';
			let section = sectionMap[targetSectionId];
			if (!section) {
				section = {
					id: targetSectionId,
					title: '扩展设置',
					order: 35,
					items: []
				};
				sectionMap[targetSectionId] = section;
			}

			const context = controller.rawEngine.getPluginContext(item.id);
			section.items.push({
				id: item.id,
				title: resolveText(item.title),
				supporting: resolveText(item.supporting),
				href: item.href,
				onClick: item.onClick ? () => item.onClick!(context) : undefined,
				icon: CodeFill,
				iconTone: item.iconTone ?? 'neutral',
				order: item.order ?? 50,
				keywords: [resolveText(item.title), resolveText(item.supporting)]
			});
		}

		const sortedSections = Object.values(sectionMap).sort(
			(a, b) => (a.order ?? 50) - (b.order ?? 50)
		);

		for (const sec of sortedSections) {
			sec.items.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
		}

		return sortedSections;
	});

	const filteredSections = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return sections;

		return sections
			.map((section) => {
				const matchingItems = section.items.filter((item) => {
					const titleMatch = item.title.toLowerCase().includes(query);
					const supportingMatch = item.supporting?.toLowerCase().includes(query);
					const keywordMatch = item.keywords?.some((kw) => kw.toLowerCase().includes(query));
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

		<SearchField bind:value={searchQuery} placeholder="搜索设置..." ariaLabel="搜索设置" />
	</div>

	{#each filteredSections as section (section.id)}
		<MineSection title={section.title}>
			{#each section.items as item (item.id)}
				<MineRow
					title={item.title}
					supporting={item.supporting}
					href={item.href}
					onclick={item.onClick}
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
