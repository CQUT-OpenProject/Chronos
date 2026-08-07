<script lang="ts">
	import { onMount } from 'svelte';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import { Card } from 'm3-svelte';

	interface ThirdPartyLicense {
		name: string;
		license: string;
	}

	let licenses = $state<ThirdPartyLicense[]>([]);

	onMount(async () => {
		const response = await fetch('/licenses/third-party.json');
		if (!response.ok) return;
		licenses = (await response.json()) as ThirdPartyLicense[];
	});
</script>

<SecondaryPageShell title="第三方依赖许可证" backHref="/open-source-licenses">
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
</SecondaryPageShell>

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
