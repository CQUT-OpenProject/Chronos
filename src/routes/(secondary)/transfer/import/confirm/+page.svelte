<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getRepository } from '$lib/client/repository';
	import { ImportMode } from '$lib/domain/import-mode';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
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
		if (!currentTimetableName && transfer.state.importMode === ImportMode.OVERWRITE_CURRENT) {
			transfer.setImportMode(ImportMode.AS_NEW);
		}
		ready = true;
	});

	function handleConfirmed() {
		goto(resolve('/'));
	}
</script>

{#if ready}
	<SecondaryPageShell title="确认导入" backHref="/transfer/import" flush>
		<TransferImportConfirmScreen {transfer} {currentTimetableName} onConfirm={handleConfirmed} />
	</SecondaryPageShell>
{/if}
