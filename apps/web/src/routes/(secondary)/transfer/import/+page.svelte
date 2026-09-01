<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ensureEngineFullyReady, getAppEngine } from '$lib/services/app-engine';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferImportScreen from '$lib/components/transfer/TransferImportScreen.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';

	const engine = getAppEngine();
	const transfer = createTransferState(engine);

	let ready = $state(false);

	onMount(async () => {
		await ensureEngineFullyReady();
		transfer.clearPersistedPreview();
		ready = true;
	});

	function continueToConfirm() {
		transfer.persistPreview();
		goto(resolve('/transfer/import/confirm'));
	}
</script>

{#if ready}
	<SecondaryPageShell title={hostT('route.import')} backShellTab="mine">
		<TransferImportScreen {transfer} onContinue={continueToConfirm} />
	</SecondaryPageShell>
{:else}
	<div class="flex min-h-dvh items-center justify-center bg-canvas">
		<LoadingIndicator />
	</div>
{/if}
