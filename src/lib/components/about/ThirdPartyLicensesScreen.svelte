<script lang="ts">
	import { onMount } from 'svelte';
	import { staticPath } from '$lib/config/static-path';
	import { connectivity } from '$lib/platform/connectivity.svelte';
	import { resolveFetchErrorMessage } from '$lib/client/fetch-error-message';
	import Card from '$lib/components/ui/Card.svelte';
	import FetchErrorState from '$lib/components/ui/FetchErrorState.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	interface ThirdPartyLicense {
		name: string;
		license: string;
	}

	type LoadState = 'loading' | 'ready' | 'error' | 'empty';

	let licenses = $state<ThirdPartyLicense[]>([]);
	let loadState = $state<LoadState>('loading');
	let errorMessage = $state('');

	async function loadLicenses() {
		loadState = 'loading';
		errorMessage = '';

		try {
			const response = await fetch(staticPath('/licenses/third-party.json'));
			if (!response.ok) {
				errorMessage = resolveFetchErrorMessage(!connectivity.isOnline, '无法加载第三方许可证列表');
				loadState = 'error';
				return;
			}

			licenses = (await response.json()) as ThirdPartyLicense[];
			loadState = licenses.length > 0 ? 'ready' : 'empty';
		} catch {
			errorMessage = resolveFetchErrorMessage(!connectivity.isOnline, '无法加载第三方许可证列表');
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
	<FetchErrorState title="暂无许可证记录" description="未找到第三方依赖许可证数据。" />
{:else}
	<ul class="license-list">
		{#each licenses as entry (entry.name)}
			<li>
				<Card variant="outlined">
					<p class="m3-title-small">{entry.name}</p>
					<p class="m3-body-small text-on-surface-variant">{entry.license}</p>
				</Card>
			</li>
		{/each}
	</ul>
{/if}

<style>
	.license-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	p {
		margin: 0;
	}

	p + p {
		margin-top: 0.25rem;
	}
</style>
