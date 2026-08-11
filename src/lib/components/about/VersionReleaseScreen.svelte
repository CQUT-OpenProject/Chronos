<script lang="ts">
	import { onMount } from 'svelte';
	import { parseMarkdown } from '$lib/content/markdown';
	import { formatPublishedDate } from '$lib/content/releases/release-display';
	import {
		createReleaseDetailState,
		type ReleaseDetailStateController
	} from '$lib/content/releases/catalog-state.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import AppHero from '$lib/components/AppHero.svelte';
	import HighlightRow from '$lib/components/ui/HighlightRow.svelte';
	import HighlightRowList from '$lib/components/ui/HighlightRowList.svelte';
	import { CalendarMonthFill, DescriptionFill, InfoFill } from '$lib/icons';

	let {
		tag,
		detailState = createReleaseDetailState(() => tag)
	}: {
		tag: string;
		detailState?: ReleaseDetailStateController;
	} = $props();

	onMount(() => {
		void detailState.load();
	});

	const htmlBody = $derived(
		detailState.state.release?.body ? parseMarkdown(detailState.state.release.body) : ''
	);
</script>

{#if detailState.state.loading}
	<div class="flex min-h-[300px] items-center justify-center py-12">
		<LoadingIndicator />
	</div>
{:else if detailState.state.release}
	<div class="flex flex-col gap-5 py-2">
		<AppHero title={detailState.state.release.name || detailState.state.release.tagName} />

		<HighlightRowList>
			<HighlightRow
				icon={DescriptionFill}
				title="版本标签"
				subtitle={detailState.state.release.tagName}
			/>
			<HighlightRow
				icon={CalendarMonthFill}
				title="发布日期"
				subtitle={formatPublishedDate(detailState.state.release.publishedAt)}
			/>
		</HighlightRowList>

		<MineSection title="更新内容">
			<div
				class="markdown-prose markdown-prose--release prose prose-sm max-w-none px-2 dark:prose-invert"
			>
				{@html htmlBody || '<p>此 Release 没有正文内容。</p>'}
			</div>
		</MineSection>
	</div>
{:else}
	<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
		<InfoFill class="h-8 w-8 text-on-surface-variant" />
		<p class="m3-body-medium text-danger">
			{detailState.state.errorMessage ?? '未获取到当前版本的 Release 信息'}
		</p>
	</Card>
{/if}
