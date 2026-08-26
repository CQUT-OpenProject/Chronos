<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppEngine, getAppController } from '$lib/services/app-engine';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferImportScreen from '$lib/components/transfer/TransferImportScreen.svelte';

	const engine = getAppEngine();
	const transfer = createTransferState(engine);
	const controller = getAppController();

	transfer.clearPersistedPreview();

	function continueToConfirm() {
		transfer.persistPreview();
		goto(resolve('/transfer/import/confirm'));
	}
</script>

<SecondaryPageShell title={hostT('route.import')} backHref="/mine">
	<TransferImportScreen {transfer} onContinue={continueToConfirm} />
</SecondaryPageShell>
