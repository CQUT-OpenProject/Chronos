<script lang="ts">
	import { onMount } from 'svelte';
	import { getRepository } from '$lib/client/repository';
	import { createTransferState } from '$lib/transfer/transfer-state.svelte';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import TransferExportScreen from '$lib/components/transfer/TransferExportScreen.svelte';

	const transfer = createTransferState();
	let currentTimetableName = $state<string | null>(null);

	onMount(async () => {
		const snapshot = await getRepository().getAppStateSnapshot();
		currentTimetableName = snapshot.currentTimetable?.name ?? null;
	});
</script>

<SecondaryPageShell title="导出课表" backHref="/mine">
	<TransferExportScreen {transfer} {currentTimetableName} />
</SecondaryPageShell>
