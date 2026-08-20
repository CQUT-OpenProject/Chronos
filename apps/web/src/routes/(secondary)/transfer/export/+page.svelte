<script lang="ts">
	import { onMount } from 'svelte';
	import { createCredentialVault } from '$lib/client/credential-vault';
	import { IVaultService } from '@chronos/core';
	import { getAppEngine } from '$lib/services/app-engine';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const engine = getAppEngine();
	const transfer = createTransferState(
		createCredentialVault({ vault: engine.services.get(IVaultService) }),
		engine
	);

	let currentTimetableName = $state<string | null>(null);
	let longLinkWarning = $state(false);

	onMount(async () => {
		const metadata = await transfer.getExportMetadata();
		currentTimetableName = metadata.timetableName;
		longLinkWarning = metadata.longLinkWarning;
	});
</script>

<SecondaryPageShell title="导出课表" backHref="/mine" flush>
	<TransferExportScreen {transfer} {currentTimetableName} {longLinkWarning} />
</SecondaryPageShell>
