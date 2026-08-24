<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import { formatPublishedDate } from '$lib/content/releases/release-display';
	import {
		createReleaseListState,
		type ReleaseListStateController
	} from '$lib/content/releases/catalog-state.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { InfoFill } from '$lib/icons';

	let { listState = createReleaseListState() }: { listState?: ReleaseListStateController } =
		$props();

	const controller = getAppController();

	onMount(() => {
		void listState.load();
	});

	function releaseHref(tagName: string): Pathname {
		return `/about/releases/${tagName}` as Pathname;
	}
</script>

{#if listState.state.loading}
	<div class="flex min-h-[300px] items-center justify-center py-12">
		<LoadingIndicator />
	</div>
{:else if listState.state.releases.length > 0}
	<MineSection title={hostTextRead(controller, 'about.release.list.heading')}>
		{#each listState.state.releases as release (release.tagName)}
			<MineRow
				title={release.name || release.tagName}
				supporting={formatPublishedDate(release.publishedAt)}
				href={resolve(releaseHref(release.tagName) as any)}
			/>
		{/each}
	</MineSection>
{:else}
	<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
		<InfoFill class="h-8 w-8 text-on-surface-variant" />
		<p class="m3-body-medium text-danger">
			{listState.state.errorMessage ?? hostTextRead(controller, 'about.release.list.empty')}
		</p>
	</Card>
{/if}
