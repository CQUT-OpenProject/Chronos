<script lang="ts">
	import { onMount } from 'svelte';
	import { networkStatus } from '$lib/client/network-status.svelte';
	import { resolveFetchErrorMessage } from '$lib/client/fetch-error-message';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import FetchErrorState from '$lib/components/ui/FetchErrorState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	type LoadState = 'loading' | 'ready' | 'error';

	let loadState = $state<LoadState>('loading');
	let licenseText = $state('');
	let errorMessage = $state('');

	async function loadLicense() {
		loadState = 'loading';
		errorMessage = '';

		try {
			const response = await fetch('/licenses/project_license.txt');
			if (!response.ok) {
				errorMessage = resolveFetchErrorMessage(!networkStatus.isOnline, '无法加载许可证文本');
				loadState = 'error';
				return;
			}

			licenseText = await response.text();
			loadState = 'ready';
		} catch {
			errorMessage = resolveFetchErrorMessage(!networkStatus.isOnline, '无法加载许可证文本');
			loadState = 'error';
		}
	}

	onMount(() => {
		void loadLicense();
	});
</script>

<SecondaryPageShell title="本项目许可证" backHref="/open-source-licenses">
	{#if loadState === 'loading'}
		<div class="flex items-center justify-center py-12">
			<LoadingIndicator />
		</div>
	{:else if loadState === 'error'}
		<FetchErrorState
			offline={!networkStatus.isOnline}
			description={errorMessage}
			onRetry={loadLicense}
		/>
	{:else}
		<pre
			class="m3-body-small leading-relaxed whitespace-pre-wrap text-on-surface-variant">{licenseText}</pre>
	{/if}
</SecondaryPageShell>
