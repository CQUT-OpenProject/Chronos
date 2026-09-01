<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import { ensureEngineFullyReady, getAppEngine } from '$lib/services/app-engine';
	import { checkPrimaryExportWarning } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	const engine = getAppEngine();

	let ready = $state(false);
	let exportWarning = $state<string | null>(null);

	onMount(async () => {
		await ensureEngineFullyReady();
		exportWarning = await checkPrimaryExportWarning(engine);
		ready = true;
	});
</script>

{#if ready}
	<SecondaryPageShell title={hostT('route.export')} backShellTab="mine">
		<TransferExportScreen warningMessage={exportWarning} />
	</SecondaryPageShell>
{:else}
	<div class="flex min-h-dvh items-center justify-center bg-canvas">
		<LoadingIndicator />
	</div>
{/if}
