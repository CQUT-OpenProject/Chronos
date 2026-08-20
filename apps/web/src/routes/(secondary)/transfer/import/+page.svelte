<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferImportScreen from '$lib/components/transfer/TransferImportScreen.svelte';

	const transfer = createTransferState();

	transfer.clearPersistedPreview();

	function continueToConfirm() {
		transfer.persistPreview();
		goto(resolve('/transfer/import/confirm'));
	}
</script>

<SecondaryPageShell title="导入课表" backHref="/mine">
	<TransferImportScreen {transfer} onContinue={continueToConfirm} />
</SecondaryPageShell>
