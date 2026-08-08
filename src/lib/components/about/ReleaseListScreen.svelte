<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import type { GithubRelease } from '$lib/models/auth';
	import { createGithubServices } from '$lib/client/github-services';
	import { formatPublishedDate } from '$lib/content/releases/release-display';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { DescriptionFill, InfoFill } from '$lib/icons';

	const githubServices = createGithubServices();

	let loading = $state(true);
	let releases = $state<GithubRelease[]>([]);
	let errorMessage = $state<string | null>(null);

	onMount(async () => {
		const result = await githubServices.getAllReleases.invoke();
		loading = false;
		if (result.ok) {
			releases = result.value;
		} else {
			errorMessage = result.error.message;
		}
	});

	function releaseHref(tagName: string): Pathname {
		return `/about/releases/${tagName}` as Pathname;
	}
</script>

{#if loading}
	<div class="flex min-h-[300px] items-center justify-center py-12">
		<LoadingIndicator />
	</div>
{:else if releases.length > 0}
	<MineSection title="全部版本" accentColor="primary">
		{#each releases as release (release.tagName)}
			<MineRow
				title={release.name || release.tagName}
				supporting={formatPublishedDate(release.publishedAt)}
				href={resolve(releaseHref(release.tagName))}
				icon={DescriptionFill}
				iconTone="primary"
			/>
		{/each}
	</MineSection>
{:else}
	<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
		<InfoFill class="h-8 w-8 text-on-surface-variant" />
		<p class="m3-body-medium text-danger">
			{errorMessage ?? '暂无版本更新记录'}
		</p>
	</Card>
{/if}
