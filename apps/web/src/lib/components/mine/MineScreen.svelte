<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow, { type MineIconTone } from '$lib/components/mine/MineRow.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';
	import { getAppController } from '$lib/services/app-engine';

	import { DEFAULT_MINE_SECTION_ID, resolveLocalizedText } from '@chronos/core';
	import { CodeFill } from '$lib/icons';
	import { resolveShellIcon } from '$lib/shell/resolve-shell-icon';
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
	};

	type SettingSection = {
		id: string;
		title: string;
		items: SettingItem[];
	};

	function resolveIcon(
		icon: string | undefined,
		itemId: string
	): Component<{ class?: string }> | undefined {
		const resolved = resolveShellIcon(icon);
		if (resolved?.kind === 'component') {
			return resolved.component;
		}
		return itemId ? CodeFill : undefined;
	}

	const sections = $derived.by(() => {
		void controller.slotVersion;
		const pluginSections = controller.getSlots('mine.section');
		const pluginItems = controller.getSlots('mine.item');
		const sectionMap: Record<string, SettingSection> = {};

		for (const pSec of pluginSections) {
			sectionMap[pSec.id] = {
				id: pSec.id,
				title: resolveLocalizedText(pSec.title),
				items: []
			};
		}

		for (const item of pluginItems) {
			const targetSectionId = item.sectionId ?? DEFAULT_MINE_SECTION_ID;
			let section = sectionMap[targetSectionId];
			if (!section) {
				section = {
					id: targetSectionId,
					title: hostT('mine.section.fallback'),
					items: []
				};
				sectionMap[targetSectionId] = section;
			}

			const context = item.onClick
				? controller.getPluginContextForSlot('mine.item', item.id)
				: undefined;
			section.items.push({
				id: item.id,
				title: resolveLocalizedText(item.title),
				supporting: resolveLocalizedText(item.supporting),
				href: item.href,
				onClick: item.onClick && context ? () => item.onClick!(context) : undefined,
				icon: resolveIcon(item.icon, item.id),
				iconTone: item.iconTone ?? 'neutral',
				keywords:
					item.keywords ??
					[resolveLocalizedText(item.title), resolveLocalizedText(item.supporting)].filter(Boolean)
			});
		}

		// Registry `get()` already returns order-sorted contributions, so both
		// sections and items keep their sorted order through insertion here.
		return Object.values(sectionMap);
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
		<h1 class="text-page-title text-headline-medium font-medium">
			{hostT('mine.title')}
		</h1>

		<SearchField
			bind:value={searchQuery}
			placeholder={hostT('mine.search.placeholder')}
			ariaLabel={hostT('mine.search.ariaLabel')}
		/>
	</div>

	{#if sections.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="text-body-medium text-on-surface-variant">
				{hostT('mine.empty.noItems')}
			</p>
		</div>
	{:else if filteredSections.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="text-body-medium text-on-surface-variant">
				{hostT('mine.search.noResults', { query: searchQuery })}
			</p>
			<Button variant="text" class="mt-2" onclick={() => (searchQuery = '')}>
				{hostT('mine.search.clear')}
			</Button>
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
