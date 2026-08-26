<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import type { Pathname } from '$app/types';
	import { staticPath } from '$lib/config/static-path';
	import { parseMarkdown } from '$lib/content/markdown';
	import { connectivity } from '$lib/platform/connectivity.svelte';
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
		backHref: Pathname;
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
			const response = await fetch(staticPath(documentPath));
			if (!response.ok) {
				errorMessage = resolveFetchErrorMessage(!connectivity.isOnline, hostT('legal.loadFailed'));
				loadState = 'error';
				return;
			}

			const markdown = await response.text();
			htmlContent = parseMarkdown(markdown);
			loadState = 'ready';
		} catch {
			errorMessage = resolveFetchErrorMessage(!connectivity.isOnline, hostT('legal.loadFailed'));
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
			offline={!connectivity.isOnline}
			description={errorMessage}
			onRetry={loadDocument}
		/>
	{:else}
		<div class="markdown-prose prose prose-sm max-w-none px-4 py-2 dark:prose-invert">
			{@html htmlContent}
		</div>
	{/if}
</SecondaryPageShell>
