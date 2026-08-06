<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getRepository } from '$lib/client/repository';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import TransferImportConfirmScreen from '$lib/components/transfer/TransferImportConfirmScreen.svelte';

	const transfer = createTransferState();
	let currentTimetableName = $state<string | null>(null);
	let ready = $state(false);

	onMount(async () => {
		const loaded = transfer.loadPersistedPreview();
		if (!loaded) {
			goto(resolve('/transfer/import'));
			return;
		}
		const snapshot = await getRepository().getAppStateSnapshot();
		currentTimetableName = snapshot.currentTimetable?.name ?? null;
		ready = true;
	});

	function handleConfirmed() {
		goto(resolve('/'));
	}
</script>

{#if ready}
	<TransferImportConfirmScreen {transfer} {currentTimetableName} onConfirm={handleConfirmed} />
	<p class="px-4 pb-4">
		<a href={resolve('/transfer/import')} class="text-sm text-blue-600">返回</a>
	</p>
{/if}
