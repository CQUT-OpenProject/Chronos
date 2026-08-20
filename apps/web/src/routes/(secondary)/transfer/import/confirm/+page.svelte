<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';
	import { ImportMode } from '$lib/domain/import-mode';
	import { createCredentialVault } from '$lib/client/credential-vault';
	import { IVaultService } from '@chronos/core';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferImportConfirmScreen from '$lib/components/transfer/TransferImportConfirmScreen.svelte';

	const engine = getAppEngine();
	const transfer = createTransferState(
		createCredentialVault({ vault: engine.services.get(IVaultService) }),
		engine
	);
	const controller = getAppController();
	let currentTimetableName = $state<string | null>(null);
	let ready = $state(false);

	onMount(async () => {
		const loaded = transfer.loadPersistedPreview();
		if (!loaded) {
			goto(resolve('/transfer/import'));
			return;
		}
		currentTimetableName = controller.currentTimetable?.name ?? null;
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
