<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import { staticPath } from '$lib/config/static-path';
	import { connectivity } from '$lib/platform/connectivity.svelte';
	import { resolveFetchErrorMessage } from '$lib/client/fetch-error-message';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import FetchErrorState from '$lib/components/ui/FetchErrorState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import { getAppController } from '$lib/services/app-engine';

	type LoadState = 'loading' | 'ready' | 'error';

	const controller = getAppController();

	let loadState = $state<LoadState>('loading');
	let licenseText = $state('');
	let errorMessage = $state('');

	async function loadLicense() {
		loadState = 'loading';
		errorMessage = '';

		try {
			const response = await fetch(staticPath('/licenses/project_license.txt'));
			if (!response.ok) {
				errorMessage = resolveFetchErrorMessage(
					!connectivity.isOnline,
					hostT('about.licenses.project.loadFailed')
				);
				loadState = 'error';
				return;
			}

			licenseText = await response.text();
			loadState = 'ready';
		} catch {
			errorMessage = resolveFetchErrorMessage(
				!connectivity.isOnline,
				hostT('about.licenses.project.loadFailed')
			);
			loadState = 'error';
		}
	}

	onMount(() => {
		void loadLicense();
	});
</script>

<SecondaryPageShell title={hostT('route.licenseProject')} backHref="/open-source-licenses">
	{#if loadState === 'loading'}
		<div class="flex items-center justify-center py-12">
			<LoadingIndicator />
		</div>
	{:else if loadState === 'error'}
		<FetchErrorState
			offline={!connectivity.isOnline}
			description={errorMessage}
			onRetry={loadLicense}
		/>
	{:else}
		<pre
			class="m3-body-small leading-relaxed whitespace-pre-wrap text-on-surface-variant">{licenseText}</pre>
	{/if}
</SecondaryPageShell>
