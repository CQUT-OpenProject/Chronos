<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import { staticPath } from '$lib/config/static-path';
	import { connectivity } from '$lib/platform/connectivity.svelte';
	import { resolveFetchErrorMessage } from '$lib/client/fetch-error-message';
	import { getAppController } from '$lib/services/app-engine';

	import FetchErrorState from '$lib/components/ui/FetchErrorState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	interface ThirdPartyLicense {
		name: string;
		license: string;
	}

	type LoadState = 'loading' | 'ready' | 'error' | 'empty';

	const controller = getAppController();

	let licenses = $state<ThirdPartyLicense[]>([]);
	let loadState = $state<LoadState>('loading');
	let errorMessage = $state('');

	async function loadLicenses() {
		loadState = 'loading';
		errorMessage = '';

		try {
			const response = await fetch(staticPath('/licenses/third-party.json'));
			if (!response.ok) {
				errorMessage = resolveFetchErrorMessage(
					!connectivity.isOnline,
					hostT('about.licenses.thirdParty.loadFailed')
				);
				loadState = 'error';
				return;
			}

			licenses = (await response.json()) as ThirdPartyLicense[];
			loadState = licenses.length > 0 ? 'ready' : 'empty';
		} catch {
			errorMessage = resolveFetchErrorMessage(
				!connectivity.isOnline,
				hostT('about.licenses.thirdParty.loadFailed')
			);
			loadState = 'error';
		}
	}

	onMount(() => {
		void loadLicenses();
	});
</script>

{#if loadState === 'loading'}
	<div class="flex items-center justify-center py-12">
		<LoadingIndicator />
	</div>
{:else if loadState === 'error'}
	<FetchErrorState
		offline={!connectivity.isOnline}
		description={errorMessage}
		onRetry={loadLicenses}
	/>
{:else if loadState === 'empty'}
	<FetchErrorState
		title={hostT('about.licenses.thirdParty.empty.title')}
		description={hostT('about.licenses.thirdParty.empty.desc')}
	/>
{:else}
	<ul class="flex flex-col divide-y divide-outline-variant/60">
		{#each licenses as entry (entry.name)}
			<li class="flex flex-col gap-0.5 py-3">
				<span class="text-title-small text-on-surface">{entry.name}</span>
				<span class="text-body-small text-on-surface-variant">{entry.license}</span>
			</li>
		{/each}
	</ul>
{/if}
