<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import type { GithubRelease } from '$lib/models/auth';
	import { createGithubServices } from '$lib/client/github-services';
	import { formatPublishedDate } from '$lib/content/releases/release-display';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import AppHero from '$lib/components/AppHero.svelte';
	import { CalendarMonthFill, DescriptionFill, InfoFill } from '$lib/icons';

	let { tag }: { tag: string } = $props();

	const githubServices = createGithubServices();

	let loading = $state(true);
	let release = $state<GithubRelease | null>(null);
	let errorMessage = $state<string | null>(null);

	onMount(async () => {
		const result = await githubServices.getReleaseByTag.invoke(tag);
		loading = false;
		if (result.ok) {
			release = result.value;
		} else {
			errorMessage = result.error.message;
		}
	});

	const htmlBody = $derived(
		release?.body ? (marked.parse(release.body, { async: false }) as string) : ''
	);
</script>

{#if loading}
	<div class="flex min-h-[300px] items-center justify-center py-12">
		<LoadingIndicator />
	</div>
{:else if release}
	<div class="m3-stack gap-5 py-2">
		<AppHero title={release.name || release.tagName} />

		<Card variant="outlined">
			<ul class="flex flex-col gap-4 text-on-surface-variant">
				<li class="flex items-center gap-3.5">
					<div
						class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
					>
						<DescriptionFill class="h-5 w-5" />
					</div>
					<div class="flex min-w-0 flex-1 flex-col justify-center">
						<p class="m3-body-large font-normal text-on-surface">版本标签</p>
						<p class="m3-body-medium text-xs text-on-surface-variant">{release.tagName}</p>
					</div>
				</li>
				<li class="flex items-center gap-3.5">
					<div
						class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
					>
						<CalendarMonthFill class="h-5 w-5" />
					</div>
					<div class="flex min-w-0 flex-1 flex-col justify-center">
						<p class="m3-body-large font-normal text-on-surface">发布日期</p>
						<p class="m3-body-medium text-xs text-on-surface-variant">
							{formatPublishedDate(release.publishedAt)}
						</p>
					</div>
				</li>
			</ul>
		</Card>

		<MineSection title="更新日志" accentColor="primary">
			<div class="release-prose prose prose-sm max-w-none px-2 dark:prose-invert">
				{@html htmlBody || '<p>此 Release 没有正文内容。</p>'}
			</div>
		</MineSection>
	</div>
{:else}
	<Card variant="filled" class="flex flex-col items-center gap-3 py-8 text-center">
		<InfoFill class="h-8 w-8 text-on-surface-variant" />
		<p class="m3-body-medium text-danger">
			{errorMessage ?? '未获取到当前版本的 Release 信息'}
		</p>
	</Card>
{/if}

<style>
	.release-prose :global(h2) {
		margin: 0 0 0.75rem;
		font-family: var(--m3-font);
		font-size: 1rem;
		line-height: 1.5;
		font-weight: 500;
		color: var(--color-on-surface);
	}

	.release-prose :global(p) {
		margin: 0 0 0.75rem;
		color: var(--color-on-surface-variant);
	}

	.release-prose :global(p:last-child) {
		margin-bottom: 0;
	}

	.release-prose :global(ul) {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding-left: 1.25rem;
	}

	.release-prose :global(li::marker) {
		color: var(--color-brand);
	}

	.release-prose :global(a) {
		color: var(--color-brand);
		text-underline-offset: 0.125rem;
	}
</style>
