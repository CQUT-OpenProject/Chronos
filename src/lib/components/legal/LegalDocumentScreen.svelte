<script lang="ts">
	import { onMount } from 'svelte';
	import { parseMarkdown } from '$lib/content/markdown';
	import { networkStatus } from '$lib/client/network-status.svelte';
	import { resolveFetchErrorMessage } from '$lib/client/fetch-error-message';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import FetchErrorState from '$lib/components/ui/FetchErrorState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	let {
		title,
		backHref,
		documentPath
	}: {
		title: string;
		backHref: string;
		documentPath: string;
	} = $props();

	type LoadState = 'loading' | 'ready' | 'error';

	let loadState = $state<LoadState>('loading');
	let htmlContent = $state('');
	let errorMessage = $state('');

	async function loadDocument() {
		loadState = 'loading';
		errorMessage = '';

		try {
			const response = await fetch(documentPath);
			if (!response.ok) {
				errorMessage = resolveFetchErrorMessage(!networkStatus.isOnline, '无法加载文档内容');
				loadState = 'error';
				return;
			}

			const markdown = await response.text();
			htmlContent = parseMarkdown(markdown);
			loadState = 'ready';
		} catch {
			errorMessage = resolveFetchErrorMessage(!networkStatus.isOnline, '无法加载文档内容');
			loadState = 'error';
		}
	}

	onMount(() => {
		void loadDocument();
	});
</script>

<SecondaryPageShell {title} {backHref}>
	{#if loadState === 'loading'}
		<div class="flex items-center justify-center py-12">
			<LoadingIndicator />
		</div>
	{:else if loadState === 'error'}
		<FetchErrorState
			offline={!networkStatus.isOnline}
			description={errorMessage}
			onRetry={loadDocument}
		/>
	{:else}
		<div class="markdown-prose prose prose-sm max-w-none px-4 py-2 dark:prose-invert">
			{@html htmlContent}
		</div>
	{/if}
</SecondaryPageShell>
