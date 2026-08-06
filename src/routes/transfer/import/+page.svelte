<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import TransferImportScreen from '$lib/components/transfer/TransferImportScreen.svelte';

	const transfer = createTransferState();

	onMount(() => {
		transfer.loadPersistedPreview();
	});

	function continueToConfirm() {
		transfer.persistPreview();
		goto(resolve('/transfer/import/confirm'));
	}
</script>

<TransferImportScreen {transfer} onContinue={continueToConfirm} />

<p class="px-4 pb-4">
	<a href={resolve('/mine')} class="text-sm text-blue-600">返回</a>
</p>
