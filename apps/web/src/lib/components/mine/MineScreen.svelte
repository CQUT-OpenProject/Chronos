<script lang="ts">
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow, { type MineIconTone } from '$lib/components/mine/MineRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { MINE_ITEM_ICON_MAP, MINE_ITEM_KEYWORDS } from '$lib/boot/mine-icons';
	import { CodeFill } from '$lib/icons';
	import type { Component } from 'svelte';

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

	function resolveIcon(
		iconKey: string | undefined,
		itemId: string
	): Component<{ class?: string }> | undefined {
		if (iconKey && iconKey in MINE_ITEM_ICON_MAP) {
			return MINE_ITEM_ICON_MAP[iconKey as keyof typeof MINE_ITEM_ICON_MAP];
		}
		return MINE_ITEM_KEYWORDS[itemId] ? CodeFill : undefined;
	}

	const sections = $derived.by(() => {
		void controller.slotVersion;
		const pluginSections = controller.getSlots('mine.section');
		const pluginItems = controller.getSlots('mine.item');
		const sectionMap: Record<string, SettingSection> = {};

		for (const pSec of pluginSections) {
			sectionMap[pSec.id] = {
				id: pSec.id,
				title: resolveText(pSec.title),
				order: pSec.order ?? 50,
				items: []
			};
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

			const context = item.onClick
				? controller.getPluginContextForSlot('mine.item', item.id)
				: undefined;
			section.items.push({
				id: item.id,
				title: resolveText(item.title),
				supporting: resolveText(item.supporting),
				href: item.href,
				onClick: item.onClick && context ? () => item.onClick!(context) : undefined,
				icon: resolveIcon(item.icon, item.id),
				iconTone: item.iconTone ?? 'neutral',
				order: item.order ?? 50,
				keywords: MINE_ITEM_KEYWORDS[item.id] ?? [
					resolveText(item.title),
					resolveText(item.supporting)
				]
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

	{#if sections.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="m3-body-medium text-on-surface-variant">暂无设置项</p>
		</div>
	{:else if filteredSections.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="m3-body-medium text-on-surface-variant">未找到“{searchQuery}”相关设置</p>
			<Button variant="text" class="mt-2" onclick={() => (searchQuery = '')}>清空搜索词</Button>
		</div>
	{:else}
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
		{/each}
	{/if}
</div>
