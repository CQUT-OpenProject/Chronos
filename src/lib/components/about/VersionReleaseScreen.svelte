<script lang="ts">
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import type { GithubRelease } from '$lib/models/auth';
	import { APP_VERSION } from '$lib/config/app-meta';
	import { createGithubServices } from '$lib/client/github-services';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	const githubServices = createGithubServices();

	let loading = $state(true);
	let release = $state<GithubRelease | null>(null);
	let errorMessage = $state<string | null>(null);

	onMount(async () => {
		const result = await githubServices.getReleaseByTag.invoke(APP_VERSION);
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
	<div class="m3-stack">
		<h2 class="m3-title-large font-bold">{release.name || release.tagName}</h2>
		<p class="m3-body-medium text-on-surface-variant">Tag：{release.tagName}</p>
		<p class="m3-body-medium text-on-surface-variant">
			发布时间：{release.publishedAt || '-'}
		</p>
		<div class="prose prose-sm max-w-none dark:prose-invert">
			{@html htmlBody || '<p>此 Release 没有正文内容。</p>'}
		</div>
	</div>
{:else}
	<p class="m3-body-medium text-danger">{errorMessage ?? '未获取到当前版本的 Release 信息'}</p>
{/if}

<style>
	h2,
	p {
		margin: 0;
	}
</style>
