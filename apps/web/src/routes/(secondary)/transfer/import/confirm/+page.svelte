<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getAppController, getAppEngine } from '$lib/services/app-engine';
	import { ImportMode } from '$lib/domain/import-mode';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import TransferImportConfirmScreen from '$lib/components/transfer/TransferImportConfirmScreen.svelte';

	const engine = getAppEngine();
	const transfer = createTransferState(engine);
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
	<SecondaryPageShell title={hostT('route.importConfirm')} backHref="/transfer/import" flush>
		<TransferImportConfirmScreen {transfer} {currentTimetableName} onConfirm={handleConfirmed} />
	</SecondaryPageShell>
{/if}
